import { DurableObject } from "cloudflare:workers";

const COOKIE = "learning_gate";
const COOKIE_PATH = "/learning";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // seconds
const CLOCK_SKEW = 5 * 60; // seconds of tolerance for a login time slightly in the future

// Sign-in page, styled as a sheet of the same engineering computation pad as the dashboard.
function loginHtml(redirect, error) {
  const err = error ? `<p class="err" role="alert">${error}</p>` : "";
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>ML Reboot, resume from checkpoint</title>
<meta name="theme-color" content="#550000"/>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23e6efe0'/%3E%3Cpath d='M5 6c4 7 8 11 12 13s7 3 10 7' fill='none' stroke='%2323271f' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='17' cy='19' r='4' fill='%23ff4f8b' stroke='%2323271f' stroke-width='2'/%3E%3C/svg%3E"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;600;700;800&family=Shantell+Sans:wght@400&display=swap"/>
<style>
:root{--pad:#e6efe0;--sheet:#f0f5ec;--grid:#c6d8bd;--ink:#23271f;--ink-soft:#4b5645;--pen:#2340a0;--pen-ink:#f0f5ec;--marker:#ff4f8b;--bad:#b3264f;color-scheme:light}
@media (prefers-color-scheme: dark){:root{--pad:#172018;--sheet:#1d271e;--grid:#263526;--ink:#e2eadc;--ink-soft:#a9b8a2;--pen:#93a9ff;--pen-ink:#111a2e;--marker:#ff6fa0;--bad:#ff8fb0;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px 16px;font:400 16px/1.55 "Schibsted Grotesk","Segoe UI",system-ui,sans-serif;color:var(--ink);background-color:#550000;background-image:linear-gradient(rgba(255,255,255,.32) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.32) 1px,transparent 1px);background-size:24px 24px;background-position:-1px -1px}
form{width:min(440px,100%);background:var(--sheet);border:2px solid var(--ink)}
.head{display:grid;grid-template-columns:minmax(0,1fr) auto;border-bottom:2px solid var(--ink)}
.head div{padding:10px 14px}.head div+div{border-left:1px solid var(--ink)}
.head small{display:block;font-size:12px;color:var(--ink-soft)}.head b{font-size:15px}
.body{padding:22px;display:grid;gap:14px}
h1{margin:0;font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.15}
p{margin:0;color:var(--ink-soft)}
.hand{font-family:"Shantell Sans","Segoe Print",cursive;color:var(--ink)}
label{font-size:14px;font-weight:600}
input[type=password]{width:100%;min-height:48px;padding:0 12px;border:2px solid var(--ink);background:var(--pad);color:var(--ink);font:inherit}
button{min-height:48px;border:2px solid var(--pen);background:var(--pen);color:var(--pen-ink);font:700 16px "Schibsted Grotesk",system-ui,sans-serif;cursor:pointer}
:focus-visible{outline:3px solid var(--pen);outline-offset:2px}
.err{color:var(--bad);font-weight:600}
.field{display:grid;gap:6px}
</style></head><body>
<form method="post" action="/learning/__auth">
<div class="head"><div><small>Subject</small><b>ML Reboot, run 01</b></div><div><small>Sheet</small><b>00 of 16</b></div></div>
<div class="body">
<h1>Resume from checkpoint</h1>
<p>Enter the password to load your latest progress. You stay signed in on this browser for 30 days.</p>
${err}
<div class="field"><label for="p">Password</label>
<input id="p" name="password" type="password" autocomplete="current-password" required autofocus/></div>
<input type="hidden" name="redirect" value="${redirect.replace(/"/g, "&quot;")}"/>
<button type="submit">Resume training</button>
<p class="hand">your learning curve is waiting.</p>
</div>
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
