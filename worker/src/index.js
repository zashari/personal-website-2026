const COOKIE = "learning_gate";
const COOKIE_PATH = "/learning";

function loginHtml(redirect, error) {
  const err = error ? `<p style="color:#b42318;font-size:13px;margin:0 0 12px">${error}</p>` : "";
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Learning — sign in</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;font:14px/1.5 Inter,system-ui,sans-serif;background:#f7f9fd;color:#17233c}
.card{width:min(400px,92vw);background:#fff;border:1px solid #e6eaf2;border-radius:16px;padding:28px;box-shadow:0 5px 24px rgba(25,45,87,.06)}
h1{margin:0 0 6px;font-size:20px;letter-spacing:-.4px}p{margin:0 0 20px;color:#68778f;font-size:13px}
label{display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#36506d}
input{width:100%;padding:11px 12px;border:1px solid #dce4f1;border-radius:10px;font-size:14px}
button{margin-top:16px;width:100%;padding:12px;border:0;border-radius:10px;background:#315edb;color:#fff;font-weight:750;font-size:14px;cursor:pointer}
button:hover{background:#274fb9}
</style></head><body>
<form class="card" method="post" action="/learning/__auth">
<h1>ML Reboot</h1>
<p>Enter the site password to open your learning dashboard. This session ends when you close the browser.</p>
${err}
<label for="p">Password</label>
<input id="p" name="password" type="password" autocomplete="current-password" required autofocus/>
<input type="hidden" name="redirect" value="${redirect.replace(/"/g, "&quot;")}"/>
<button type="submit">Continue</button>
</form></body></html>`;
}

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function hmacSign(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function issueSession(env) {
  const nonce = crypto.randomUUID();
  const sig = await hmacSign(env.SESSION_SECRET, nonce);
  return `${nonce}.${sig}`;
}

async function verifySession(env, token) {
  if (!token || !env.SESSION_SECRET) return false;
  const i = token.lastIndexOf(".");
  if (i < 1) return false;
  const nonce = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = await hmacSign(env.SESSION_SECRET, nonce);
  if (sig.length !== expected.length) return false;
  let ok = 0;
  for (let j = 0; j < sig.length; j++) ok |= sig.charCodeAt(j) ^ expected.charCodeAt(j);
  return ok === 0;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let ok = 0;
  for (let i = 0; i < a.length; i++) ok |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ok === 0;
}

async function handleAuth(request, env) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  const redirect = String(form.get("redirect") || "/learning/");
  const safeRedirect = redirect.startsWith("/learning") ? redirect : "/learning/";

  if (!timingSafeEqual(password, env.LEARNING_PASSWORD || "")) {
    return new Response(loginHtml(safeRedirect, "Wrong password. Try again."), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const session = await issueSession(env);
  return new Response(null, {
    status: 302,
    headers: {
      Location: safeRedirect,
      "Set-Cookie": `${COOKIE}=${encodeURIComponent(session)}; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

// Single-user progress store: the whole dashboard state lives under one KV key.
const PROGRESS_KEY = "progress:v1";
const MAX_PROGRESS_BYTES = 512 * 1024;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function handleProgress(request, env) {
  if (!env.LEARNING_PROGRESS) {
    return jsonResponse({ error: "Progress storage is not configured." }, 500);
  }

  if (request.method === "GET") {
    const raw = await env.LEARNING_PROGRESS.get(PROGRESS_KEY);
    if (!raw) return jsonResponse({ exists: false });
    try {
      const parsed = JSON.parse(raw);
      return jsonResponse({ exists: true, updatedAt: parsed.updatedAt || 0, state: parsed.state });
    } catch {
      return jsonResponse({ error: "Stored progress is corrupt." }, 500);
    }
  }

  if (request.method === "PUT") {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_PROGRESS_BYTES) {
      return jsonResponse({ error: "Progress payload too large." }, 413);
    }
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return jsonResponse({ error: "Invalid JSON." }, 400);
    }
    if (!body || typeof body.state !== "object" || body.state === null || Array.isArray(body.state)) {
      return jsonResponse({ error: "Missing progress state." }, 400);
    }
    const updatedAt = Number(body.updatedAt) || Date.now();

    // Newest copy wins: reject writes older than what is stored and hand back the stored copy.
    const existingRaw = await env.LEARNING_PROGRESS.get(PROGRESS_KEY);
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw);
        if ((existing.updatedAt || 0) > updatedAt) {
          return jsonResponse(
            { error: "conflict", updatedAt: existing.updatedAt, state: existing.state },
            409
          );
        }
      } catch {
        // Corrupt stored value: overwrite it with the incoming state.
      }
    }

    await env.LEARNING_PROGRESS.put(
      PROGRESS_KEY,
      JSON.stringify({ version: 1, updatedAt, state: body.state })
    );
    return jsonResponse({ ok: true, updatedAt });
  }

  return jsonResponse({ error: "Method not allowed." }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/learning/__auth") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
      return handleAuth(request, env);
    }

    if (!url.pathname.startsWith("/learning")) {
      return fetch(request);
    }

    const session = getCookie(request, COOKIE);
    const authed = await verifySession(env, session);

    if (url.pathname === "/learning/api/progress") {
      if (!authed) return jsonResponse({ error: "unauthorized" }, 401);
      return handleProgress(request, env);
    }

    // Authenticated page requests fall through to the GitHub Pages origin.
    if (authed) {
      return fetch(request);
    }

    if (request.method === "GET") {
      return new Response(loginHtml(url.pathname + url.search, ""), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Unauthorized", { status: 401 });
  },
};
