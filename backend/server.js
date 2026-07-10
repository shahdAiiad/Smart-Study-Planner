/**
 * SmartStudy API — minimal real auth backend
 * Stack: Express + SQLite + Google OAuth + JWT
 *
 * Endpoints:
 *   POST /api/auth/google      { access_token }            → { token, user }
 *   POST /api/auth/signup      { email, password, name }   → { token, user }
 *   POST /api/auth/signin      { email, password }         → { token, user }
 *   GET  /api/me               (Authorization: Bearer ...) → { user }
 *   POST /api/auth/logout      (no-op for JWT, but kept for symmetry)
 *
 * Run:
 *   cd backend
 *   npm install
 *   node server.js
 */


require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const Database   = require('better-sqlite3');
const fetch      = globalThis.fetch;
const crypto     = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---------- Config ----------
const JWT_SECRET  = process.env.JWT_SECRET  || 'dev-secret-change-me-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// ---------- Middleware ----------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---------- Database ----------
const db = new Database('smartstudy.db');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT,
    picture       TEXT,
    provider      TEXT DEFAULT 'local',
    password_hash TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ---------- Helpers ----------
function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, picture: u.picture, provider: u.provider };
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------- Routes ----------

app.get('/api/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

// ---- Google OAuth: front-end sends access_token, backend verifies with Google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { access_token } = req.body || {};
    if (!access_token) return res.status(400).json({ error: 'Missing access_token' });

    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(401).json({ error: 'Invalid Google token', detail: t });
    }
    const profile = await r.json();
    if (!profile.email) return res.status(400).json({ error: 'Google account has no email' });

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.email);
    if (!user) {
      const result = db.prepare(`
        INSERT INTO users (email, name, picture, provider)
        VALUES (?, ?, ?, 'google')
      `).run(profile.email, profile.name || '', profile.picture || '');
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else if (!user.picture && profile.picture) {
      db.prepare('UPDATE users SET picture = ? WHERE id = ?').run(profile.picture, user.id);
      user.picture = profile.picture;
    }

    const token = makeToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('google auth error', err);
    return res.status(500).json({ error: 'Server error during Google auth' });
  }
});

// ---- Email/password signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name)
      return res.status(400).json({ error: 'Missing email, password, or name' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email format' });

    const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (email, name, password_hash, provider)
      VALUES (?, ?, ?, 'local')
    `).run(email, name, hash);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = makeToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
});

// ---- Email/password signin
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Missing email or password' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !user.password_hash)
      return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = makeToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('signin error', err);
    return res.status(500).json({ error: 'Server error during signin' });
  }
});

// ---- Current user
app.get('/api/me', authRequired, (req, res) => {
  const user = db.prepare(
    'SELECT id, email, name, picture, provider, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  return res.json({ user });
});

// ---- Logout (client just deletes token; this endpoint is for symmetry)
app.post('/api/auth/logout', authRequired, (_, res) => res.json({ ok: true }));

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`✓ SmartStudy API running on http://localhost:${PORT}`);
  console.log(`  Google Client ID configured: ${GOOGLE_CLIENT_ID ? 'yes' : 'no (set GOOGLE_CLIENT_ID env var)'}`);
});