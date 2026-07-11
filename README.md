# SentryLog — User Access & Login Audit System

Cybersecurity-themed full-stack project: login activity track karta hai, brute-force
attempts detect karta hai, aur blacklisted IPs se login flag karta hai.

## Tech Stack
- **Database:** SQLite (Node.js ka built-in `node:sqlite` module — koi extra install nahi chahiye)
- **Backend:** Node.js + Express
- **Frontend:** HTML, CSS, JavaScript (vanilla)

## Folder Structure
```
login-audit-project/
├── setup_db.js       → database + tables + sample data banata hai
├── server.js         → Express backend, API routes
├── database.db       → SQLite database file (setup_db.js se generate hoti hai)
├── package.json
└── public/
    ├── index.html     → dashboard UI
    ├── style.css
    └── script.js
```

## VS Code mn kaise chalayen

1. Ye folder VS Code mn open karo
2. Terminal kholo (`Ctrl + ~`) aur run karo:
   ```
   npm install
   ```
3. Database banane ke liye (pehli baar, ya reset karne ke liye):
   ```
   node setup_db.js
   ```
4. Server start karo:
   ```
   node server.js
   ```
5. Browser mn kholo: **http://localhost:3000**

> Note: Terminal mn ek warning aayegi — `ExperimentalWarning: SQLite is an experimental feature`.
> Ye sirf warning hai, error nahi. Node.js v22+ chahiye hoga isliye (`node -v` se check kar lena).

## Database Schema (Tables)

- **Users** — user_id, username, email, department, role
- **IP_Addresses** — ip_id, ip_address, location, is_blacklisted
- **Login_Attempts** — attempt_id, user_id, ip_id, attempt_time, status
- **Security_Alerts** — alert_id, user_id, ip_id, alert_type, alert_time, resolved

## Features / Queries Demonstrated
- Dashboard summary stats (total users, attempts, failed attempts, open alerts)
- Full login attempts log (JOIN across 3 tables)
- Brute-force detection: same IP se 5+ failed logins (`GROUP BY` + `HAVING`)
- Blacklisted-IP login attempts flag
- Security alerts list with "Mark resolved" action (POST request, `UPDATE` query)

## Sample Data
`setup_db.js` mn 5 users, 5 IPs, 14 login attempts (jisme ek brute-force pattern
aur ek blacklisted-IP attempt included hai), aur 3 security alerts already daale
hue hain — turant demo ke liye ready.
