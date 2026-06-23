const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

async function initDb() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // 1. Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      clinic_name TEXT DEFAULT 'HomeoCare Clinic'
    )
  `);

  // 2. Patients Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      occupation TEXT,
      complaints TEXT,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Appointments Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT,
      doctor TEXT,
      date TEXT,
      time TEXT,
      type TEXT,
      status TEXT DEFAULT 'Confirmed',
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
  `);

  // 4. Billing Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS billing (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount REAL,
      status TEXT DEFAULT 'Paid',
      items_json TEXT,
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
  `);

  // 5. Communications Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL,
      recipients TEXT NOT NULL,
      message TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Admin User if not exists
  const admin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (username, password, clinic_name) VALUES (?, ?, ?)', 
      ['admin', hash, 'Jireh Homeopathy']
    );
    console.log('Default admin user created: admin / admin123');
  }

  return db;
}

module.exports = { initDb };
