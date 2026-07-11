// setup_db.js
// Ye script database.db banati hai, tables create karti hai aur sample data daalti hai.
// Run: node setup_db.js

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const DB_PATH = './database.db';

// Purani database file delete kar dete hain taake fresh setup ho
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new DatabaseSync(DB_PATH);

// ---------- TABLES ----------
db.exec(`
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT,
    department TEXT,
    role TEXT
);

CREATE TABLE IP_Addresses (
    ip_id INTEGER PRIMARY KEY,
    ip_address TEXT NOT NULL,
    location TEXT,
    is_blacklisted INTEGER DEFAULT 0
);

CREATE TABLE Login_Attempts (
    attempt_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    ip_id INTEGER,
    attempt_time TEXT,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (ip_id) REFERENCES IP_Addresses(ip_id)
);

CREATE TABLE Security_Alerts (
    alert_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    ip_id INTEGER,
    alert_type TEXT,
    alert_time TEXT,
    resolved INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (ip_id) REFERENCES IP_Addresses(ip_id)
);
`);

// ---------- SAMPLE DATA ----------

const users = [
  [1, 'ali_khan', 'ali@company.com', 'IT', 'Admin'],
  [2, 'sara_ahmed', 'sara@company.com', 'HR', 'Manager'],
  [3, 'usman_raza', 'usman@company.com', 'Finance', 'Employee'],
  [4, 'mimi_dev', 'mimi@company.com', 'IT', 'Developer'],
  [5, 'bilal_shah', 'bilal@company.com', 'Sales', 'Employee'],
];
const insertUser = db.prepare('INSERT INTO Users VALUES (?,?,?,?,?)');
for (const u of users) insertUser.run(...u);

const ips = [
  [1, '192.168.1.10', 'Islamabad, PK', 0],
  [2, '203.0.113.55', 'Unknown', 1],   // blacklisted
  [3, '45.9.148.22', 'Russia', 1],     // blacklisted
  [4, '192.168.1.15', 'Islamabad, PK', 0],
  [5, '78.94.12.101', 'Germany', 0],
];
const insertIp = db.prepare('INSERT INTO IP_Addresses VALUES (?,?,?,?)');
for (const ip of ips) insertIp.run(...ip);

// Login attempts (kuch success, kuch failed — including brute force pattern)
const attempts = [
  [1, 1, 1, '2026-06-28 09:00:00', 'Success'],
  [2, 2, 4, '2026-06-28 09:15:00', 'Success'],
  [3, 3, 2, '2026-06-28 10:00:00', 'Failed'],
  [4, 3, 2, '2026-06-28 10:01:00', 'Failed'],
  [5, 3, 2, '2026-06-28 10:02:00', 'Failed'],
  [6, 3, 2, '2026-06-28 10:03:00', 'Failed'],
  [7, 3, 2, '2026-06-28 10:04:00', 'Failed'],
  [8, 3, 2, '2026-06-28 10:05:00', 'Failed'], // brute force from ip_id 2
  [9, 4, 4, '2026-06-29 11:00:00', 'Success'],
  [10, 5, 5, '2026-06-29 12:00:00', 'Success'],
  [11, 1, 3, '2026-06-29 13:00:00', 'Failed'], // login attempt from blacklisted IP
  [12, 5, 3, '2026-06-30 08:30:00', 'Failed'],
  [13, 2, 4, '2026-06-30 09:00:00', 'Success'],
  [14, 4, 4, '2026-06-30 09:30:00', 'Success'],
];
const insertAttempt = db.prepare('INSERT INTO Login_Attempts VALUES (?,?,?,?,?)');
for (const a of attempts) insertAttempt.run(...a);

const alerts = [
  [1, 3, 2, 'Brute Force', '2026-06-28 10:05:00', 0],
  [2, 1, 3, 'Login from Blacklisted IP', '2026-06-29 13:00:00', 0],
  [3, 5, 3, 'Unusual Location', '2026-06-30 08:30:00', 1],
];
const insertAlert = db.prepare('INSERT INTO Security_Alerts VALUES (?,?,?,?,?,?)');
for (const al of alerts) insertAlert.run(...al);

db.close();
console.log('✅ database.db ban gayi with tables + sample data.');
