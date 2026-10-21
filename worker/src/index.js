import { DurableObject } from "cloudflare:workers";

const COOKIE = "learning_gate";
const COOKIE_PATH = "/learning";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // seconds
const CLOCK_SKEW = 5 * 60; // seconds of tolerance for a login time slightly in the future

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
<p>Enter the site password to open your learning dashboard. You will stay signed in on this browser for 30 days.</p>
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

// Session token: "<nonce>.<issuedAt>.<hmac>", where issuedAt (unix seconds) is covered by the
// signature so it cannot be altered. Tokens without an issuedAt (the old format) are rejected.
async function issueSession(env) {
  const payload = `${crypto.randomUUID()}.${Math.floor(Date.now() / 1000)}`;
  const sig = await hmacSign(env.SESSION_SECRET, payload);
  return `${payload}.${sig}`;
}

async function verifySession(env, token) {
  if (!token || !env.SESSION_SECRET) return false;
  const i = token.lastIndexOf(".");
  if (i < 1) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = await hmacSign(env.SESSION_SECRET, payload);
  if (!timingSafeEqual(sig, expected)) return false;

  const parts = payload.split(".");
  if (parts.length !== 2 || !/^\d+$/.test(parts[1])) return false;
  const age = Math.floor(Date.now() / 1000) - Number(parts[1]);
  return age >= -CLOCK_SKEW && age <= SESSION_MAX_AGE;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let ok = 0;
  for (let i = 0; i < a.length; i++) ok |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ok === 0;
}

// Durable Object holding everything that needs exact, consistent state: dashboard progress and
// sign-in attempt counts. There is a single instance ("main"); SQLite calls are synchronous, so
// each method's read-check-write runs atomically without interleaving with other requests.
const STORE_NAME = "main";
const LOGIN_LIMIT = 5; // attempts per IP...
const LOGIN_WINDOW = 60; // ...per this many seconds

// Pre-Durable-Object progress lived in KV under this key; it is imported once if the store is empty.
const LEGACY_PROGRESS_KEY = "progress:v1";

export class LearningStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      updated_at INTEGER NOT NULL,
      state TEXT NOT NULL
    )`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS login_attempts (
      ip TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL
    )`);
    ctx.blockConcurrencyWhile(() => this.importLegacyProgress());
  }

  readProgress() {
    return this.sql.exec("SELECT updated_at, state FROM progress WHERE id = 1").toArray()[0] || null;
  }

  writeProgress(updatedAt, stateJson) {
    this.sql.exec(
      `INSERT INTO progress (id, updated_at, state) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at, state = excluded.state`,
      updatedAt,
      stateJson
    );
  }

  // Runs before any request is delivered. Must not throw, or the object is reset; a failed import
  // is logged and retried the next time the object starts, as long as no progress has been saved.
  async importLegacyProgress() {
    try {
      if (this.readProgress() || !this.env.LEARNING_PROGRESS) return;
      const raw = await this.env.LEARNING_PROGRESS.get(LEGACY_PROGRESS_KEY);
      if (!raw) return;
      const legacy = JSON.parse(raw);
      if (!legacy || typeof legacy.state !== "object" || legacy.state === null) return;
      this.writeProgress(Number(legacy.updatedAt) || Date.now(), JSON.stringify(legacy.state));
      console.log("Imported legacy progress from KV", { updatedAt: legacy.updatedAt });
    } catch (err) {
      console.error("Legacy progress import from KV failed", err);
    }
  }

  getProgress() {
    const row = this.readProgress();
    if (!row) return { exists: false };
    return { exists: true, updatedAt: row.updated_at, state: JSON.parse(row.state) };
  }

  // Newest copy wins: a write older than the stored copy is rejected and the stored copy returned.
  putProgress(updatedAt, state) {
    const row = this.readProgress();
    if (row && row.updated_at > updatedAt) {
      return { conflict: true, updatedAt: row.updated_at, state: JSON.parse(row.state) };
    }
    this.writeProgress(updatedAt, JSON.stringify(state));
    return { ok: true, updatedAt };
  }

  // Fixed window per IP, starting at its first attempt. Returns false once the IP has used up its
  // attempts in the current window.
  allowLoginAttempt(ip) {
    const now = Math.floor(Date.now() / 1000);
    this.sql.exec("DELETE FROM login_attempts WHERE window_start <= ?", now - LOGIN_WINDOW);
    const row = this.sql.exec("SELECT count FROM login_attempts WHERE ip = ?", ip).toArray()[0];
    if (!row) {
      this.sql.exec("INSERT INTO login_attempts (ip, window_start, count) VALUES (?, ?, 1)", ip, now);
      return true;
    }
    if (row.count >= LOGIN_LIMIT) return false;
    this.sql.exec("UPDATE login_attempts SET count = count + 1 WHERE ip = ?", ip);
    return true;
  }
}

const store = (env) => env.LEARNING.getByName(STORE_NAME);

// Keyed by IP so an attacker hitting the form cannot lock out the owner from another network.
// If the store is unreachable (e.g. free-tier quota exhausted), the attempt is allowed so the owner
// is never locked out of their own dashboard; the password check still applies.
async function isLoginAllowed(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  try {
    return await store(env).allowLoginAttempt(ip);
  } catch (err) {
    console.error("Login rate limiter unavailable; allowing attempt", err);
    return true;
  }
}

async function handleAuth(request, env) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  const redirect = String(form.get("redirect") || "/learning/");
  const safeRedirect = redirect.startsWith("/learning") ? redirect : "/learning/";

  if (!(await isLoginAllowed(request, env))) {
    return new Response(loginHtml(safeRedirect, "Too many attempts. Wait a minute and try again."), {
      status: 429,
      headers: { "content-type": "text/html; charset=utf-8", "retry-after": "60" },
    });
  }

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
      "Set-Cookie": `${COOKIE}=${encodeURIComponent(session)}; Path=${COOKIE_PATH}; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

const MAX_PROGRESS_BYTES = 512 * 1024;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function handleProgress(request, env) {
  if (!env.LEARNING) {
    return jsonResponse({ error: "Progress storage is not configured." }, 500);
  }

  if (request.method === "GET") {
    try {
      return jsonResponse(await store(env).getProgress());
    } catch (err) {
      console.error("Progress read failed", err);
      return jsonResponse({ error: "Progress storage unavailable." }, 503);
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

    let result;
    try {
      result = await store(env).putProgress(updatedAt, body.state);
    } catch (err) {
      console.error("Progress write failed", err);
      return jsonResponse({ error: "Progress storage unavailable." }, 503);
    }
    if (result.conflict) {
      return jsonResponse({ error: "conflict", updatedAt: result.updatedAt, state: result.state }, 409);
    }
    return jsonResponse(result);
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
