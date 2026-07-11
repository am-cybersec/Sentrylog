// script.js — frontend logic: backend APIs se data fetch karke UI render karta hai

// live clock
function updateClock(){
  document.getElementById('clock').textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

async function fetchJSON(url, opts){
  const res = await fetch(url, opts);
  return res.json();
}

// ---------- STATS ----------
async function loadStats(){
  const stats = await fetchJSON('/api/stats');
  document.querySelectorAll('.stat-card').forEach(card => {
    const key = card.dataset.key;
    card.querySelector('.stat-value').textContent = stats[key];
  });
}

// ---------- LOGIN ATTEMPTS TABLE ----------
async function loadAttempts(){
  const rows = await fetchJSON('/api/login-attempts');
  const tbody = document.querySelector('#attempts-table tbody');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.username}</td>
      <td>${r.ip_address}</td>
      <td>${r.location}</td>
      <td>${r.attempt_time}</td>
      <td><span class="status-pill ${r.status === 'Success' ? 'status-success' : 'status-failed'}">${r.status}</span></td>
    </tr>
  `).join('');
}

// ---------- ALERTS ----------
async function loadAlerts(){
  const rows = await fetchJSON('/api/alerts');
  const list = document.getElementById('alert-list');
  list.innerHTML = rows.map(r => `
    <div class="alert-item ${r.resolved ? 'resolved' : ''}">
      <div class="alert-item-top">
        <span>${r.alert_type}</span>
        <span>${r.resolved ? 'Resolved' : 'Open'}</span>
      </div>
      <div class="alert-item-meta">${r.username} · ${r.ip_address} · ${r.alert_time}</div>
      <button class="resolve-btn" data-id="${r.alert_id}" ${r.resolved ? 'disabled' : ''}>
        ${r.resolved ? 'Resolved' : 'Mark resolved'}
      </button>
    </div>
  `).join('');

  list.querySelectorAll('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetchJSON(`/api/alerts/${btn.dataset.id}/resolve`, { method: 'POST' });
      loadAlerts();
      loadStats();
    });
  });
}

// ---------- BRUTE FORCE ----------
async function loadBruteForce(){
  const rows = await fetchJSON('/api/brute-force');
  const tbody = document.querySelector('#brute-table tbody');
  tbody.innerHTML = rows.length
    ? rows.map(r => `<tr><td>${r.ip_address}</td><td>${r.location}</td><td>${r.failed_count}</td></tr>`).join('')
    : `<tr><td colspan="3" style="color:var(--muted)">No brute-force patterns detected</td></tr>`;
}

// ---------- BLACKLISTED IP ATTEMPTS ----------
async function loadBlacklist(){
  const rows = await fetchJSON('/api/blacklisted-attempts');
  const tbody = document.querySelector('#blacklist-table tbody');
  tbody.innerHTML = rows.length
    ? rows.map(r => `
        <tr>
          <td>${r.username}</td>
          <td>${r.ip_address}</td>
          <td>${r.attempt_time}</td>
          <td><span class="status-pill ${r.status === 'Success' ? 'status-success' : 'status-failed'}">${r.status}</span></td>
        </tr>`).join('')
    : `<tr><td colspan="4" style="color:var(--muted)">No blacklisted-IP attempts</td></tr>`;
}

async function loadAll(){
  loadStats();
  loadAttempts();
  loadAlerts();
  loadBruteForce();
  loadBlacklist();
}

loadAll();
