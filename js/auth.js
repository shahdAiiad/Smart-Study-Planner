/**
 * SmartStudy — shared frontend auth helpers
 *
 * Stores the JWT in localStorage and exposes small helpers used by
 * signup.html, login.html, dashboard.html, index.html, etc.
 */

const API_BASE = 'http://localhost:3000';

const Auth = {
  getToken()    { return localStorage.getItem('ss_token'); },
  getUser()     { try { return JSON.parse(localStorage.getItem('ss_user')); } catch { return null; } },
  isLoggedIn()  { return !!this.getToken(); },

  saveSession(token, user) {
    localStorage.setItem('ss_token', token);
    localStorage.setItem('ss_user', JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
  },

  async api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  async refreshMe() {
    try {
      const { user } = await this.api('/api/me');
      this.saveSession(this.getToken(), user);
      return user;
    } catch (e) {
      this.clear();
      return null;
    }
  },

  async logout() {
    try { await this.api('/api/auth/logout', { method: 'POST' }); } catch {}
    this.clear();
    window.location.href = 'index.html';
  },
};

// Run a quick auth-aware nav update on every page that includes this script
(async function updateNav() {
  const navActions = document.querySelector('[data-nav-actions]');
  if (!navActions) return;

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    // make sure backend still recognises the token
    const fresh = await Auth.refreshMe();

    if (fresh) {
      navActions.innerHTML = `
        <a class="btn btn-ghost" href="dashboard.html">
          ${fresh.picture ? `<img src="${fresh.picture}" alt="" style="width:22px;height:22px;border-radius:50%;margin-right:8px;vertical-align:middle;">` : ''}
          ${(fresh.name || fresh.email).split(' ')[0]}
        </a>
        <a class="btn btn-primary" href="dashboard.html">Dashboard</a>
      `;
    }
  }
})();