require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'homeocare-secret-key-2026';

app.use(cors());
app.use(express.json());

let db;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, clinic_name: user.clinic_name });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- PATIENT ROUTES ---

app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patients = await db.all('SELECT * FROM patients ORDER BY registration_date DESC');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.post('/api/patients', async (req, res) => {
  // Note: Allow public registration without token if needed, or check logic
  const { id, name, age, gender, phone, email, address, occupation, complaints } = req.body;
  try {
    await db.run(
      'INSERT INTO patients (id, name, age, gender, phone, email, address, occupation, complaints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, age, gender, phone, email, address, occupation, complaints]
    );
    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to register patient. ID might already exist.' });
  }
});

// --- APPOINTMENTS ROUTES ---

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await db.all(`
      SELECT a.*, p.name as patient_name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.date ASC, a.time ASC
    `);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { patient_id, doctor, date, time, type } = req.body;
  try {
    await db.run(
      'INSERT INTO appointments (patient_id, doctor, date, time, type) VALUES (?, ?, ?, ?, ?)',
      [patient_id, doctor, date, time, type]
    );
    res.status(201).json({ message: 'Appointment scheduled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

// Initialize DB and start server
initDb().then(database => {
  db = database;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
