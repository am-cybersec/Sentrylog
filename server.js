// server.js
// Express backend — database.db se data leke frontend ko APIs deta hai

const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = 3000;
const db = new DatabaseSync(path.join(__dirname, 'database.db'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API ROUTES ----------

// Saare users
app.get('/api/users', (req, res) => {
  const rows = db.prepare('SELECT * FROM Users').all();
  res.json(rows);
});

// Saare login attempts (with username + ip joined)
app.get('/api/login-attempts', (req, res) => {
  const rows = db.prepare(`
    SELECT la.attempt_id, u.username, ip.ip_address, ip.location,
           la.attempt_time, la.status
    FROM Login_Attempts la
    JOIN Users u ON la.user_id = u.user_id
    JOIN IP_Addresses ip ON la.ip_id = ip.ip_id
    ORDER BY la.attempt_time DESC
  `).all();
  res.json(rows);
});

// Security alerts (with username + ip joined)
app.get('/api/alerts', (req, res) => {
  const rows = db.prepare(`
    SELECT sa.alert_id, u.username, ip.ip_address, sa.alert_type,
           sa.alert_time, sa.resolved
    FROM Security_Alerts sa
    JOIN Users u ON sa.user_id = u.user_id
    JOIN IP_Addresses ip ON sa.ip_id = ip.ip_id
    ORDER BY sa.alert_time DESC
  `).all();
  res.json(rows);
});

// Brute force detection: same IP se 5+ failed logins
app.get('/api/brute-force', (req, res) => {
  const rows = db.prepare(`
    SELECT ip.ip_address, ip.location, COUNT(*) AS failed_count
    FROM Login_Attempts la
    JOIN IP_Addresses ip ON la.ip_id = ip.ip_id
    WHERE la.status = 'Failed'
    GROUP BY la.ip_id
    HAVING COUNT(*) >= 5
  `).all();
  res.json(rows);
});

// Blacklisted IP se login attempts
app.get('/api/blacklisted-attempts', (req, res) => {
  const rows = db.prepare(`
    SELECT u.username, ip.ip_address, la.attempt_time, la.status
    FROM Login_Attempts la
    JOIN Users u ON la.user_id = u.user_id
    JOIN IP_Addresses ip ON la.ip_id = ip.ip_id
    WHERE ip.is_blacklisted = 1
  `).all();
  res.json(rows);
});

// Dashboard summary stats
app.get('/api/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) AS c FROM Users').get().c;
  const totalAttempts = db.prepare('SELECT COUNT(*) AS c FROM Login_Attempts').get().c;
  const failedAttempts = db.prepare(`SELECT COUNT(*) AS c FROM Login_Attempts WHERE status='Failed'`).get().c;
  const unresolvedAlerts = db.prepare(`SELECT COUNT(*) AS c FROM Security_Alerts WHERE resolved=0`).get().c;
  res.json({ totalUsers, totalAttempts, failedAttempts, unresolvedAlerts });
});

// Toggle alert resolved status
app.post('/api/alerts/:id/resolve', (req, res) => {
  db.prepare('UPDATE Security_Alerts SET resolved = 1 WHERE alert_id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
});
