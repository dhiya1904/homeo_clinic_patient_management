require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { supabase, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// --- SECURITY: Enforce JWT_SECRET presence ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

// --- CORS: Allow request origins for web app and local testing ---
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// --- SECURITY HEADERS via Helmet ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "*", "http://localhost:*", "http://127.0.0.1:*", "https://homeo-clinic-patient-management.onrender.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));


// --- RATE LIMITING ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 min
  message: { error: 'Too many login attempts, please try again later.' }
});

// --- JWT AUTHENTICATION MIDDLEWARE ---
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

// ============================================================
// AUTH ROUTES
// ============================================================

// POST /api/auth/login
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) return res.status(400).json({ error: 'User not found or inactive.' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid password.' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Return clinic_name from settings or a fallback so frontend doesn't break
    res.json({
      token,
      clinic_name: 'Jireh Homeopathy',
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found.' });

    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) return res.status(400).json({ error: 'Incorrect current password.' });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNew })
      .eq('id', req.user.id);

    if (updateError) throw updateError;
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// ============================================================
// PATIENT ROUTES
// ============================================================

// GET /api/patients
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map chief_complaints → complaints for frontend compatibility
    const mapped = patients.map(p => ({
      ...p,
      complaints: p.chief_complaints,
      registration_date: p.created_at
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/patients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients.' });
  }
});

// GET /api/patients/:id  (supports UUID or legacy patient_code like P-65522)
app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const lookupId = req.params.id;
    let query;

    // Check if the id looks like a UUID
    if (isUUID(lookupId)) {
      query = supabase.from('patients').select('*').eq('id', lookupId).single();
    } else {
      // Legacy ID — try matching as patient_code first, then as old id format
      query = supabase.from('patients').select('*').eq('patient_code', lookupId).single();
    }

    const { data: patient, error } = await query;

    if (error || !patient) return res.status(404).json({ error: 'Patient not found.' });

    res.json({ ...patient, complaints: patient.chief_complaints });
  } catch (err) {
    console.error('GET /api/patients/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch patient.' });
  }
});

// Helper: check if a string is a valid UUID v4
function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Helper: resolve legacy patient code to UUID
async function resolvePatientUUID(idOrCode) {
  if (!idOrCode) return null;
  if (isUUID(idOrCode)) return idOrCode;
  
  const { data } = await supabase
    .from('patients')
    .select('id')
    .eq('patient_code', idOrCode)
    .single();
    
  return data ? data.id : null;
}

// POST /api/patients  (handles both create and update)
app.post('/api/patients', authenticateToken, async (req, res) => {
  // Accept both old `complaints` and new `chief_complaints` from frontend
  const {
    id,
    name,
    age,
    gender,
    phone,
    email,
    address,
    occupation,
    complaints,        // legacy field from frontend
    chief_complaints,  // new field
    patient_code
  } = req.body;

  const chiefComplaintsValue = chief_complaints || complaints || null;

  try {
    // Resolve the real UUID if the frontend sent a legacy id like "P-65522"
    let existingUUID = null;

    if (id) {
      if (isUUID(id)) {
        // Frontend sent a valid UUID — use it directly
        existingUUID = id;
      } else {
        // Frontend sent a legacy ID (e.g. "P-65522") — look up by patient_code
        const { data: existing } = await supabase
          .from('patients')
          .select('id')
          .eq('patient_code', id)
          .single();

        if (existing) {
          existingUUID = existing.id;
        }
        // If not found, treat it as a new patient and use the legacy id as patient_code
      }
    }

    // Generate patient_code automatically for new patients
    let generatedCode = patient_code;
    if (!generatedCode && !existingUUID) {
      // Use the legacy id as patient_code if it looks like one (e.g. "P-65522")
      if (id && !isUUID(id)) {
        generatedCode = id;
      } else {
        const { count } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
        const nextNum = (count || 0) + 1;
        generatedCode = `PAT-${String(nextNum).padStart(6, '0')}`;
      }
    }

    const payload = {
      name,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      occupation: occupation || null,
      chief_complaints: chiefComplaintsValue,
      patient_code: generatedCode || null
    };

    let result;

    if (existingUUID) {
      // Update existing patient using the resolved UUID
      result = await supabase
        .from('patients')
        .update(payload)
        .eq('id', existingUUID)
        .select()
        .single();
    } else {
      // Insert new patient — let Supabase generate the UUID
      result = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    res.status(201).json({
      message: 'Patient saved successfully.',
      patient: { ...result.data, complaints: result.data.chief_complaints }
    });
  } catch (err) {
    console.error('POST /api/patients error:', err);
    res.status(400).json({ error: 'Failed to save patient. Please check the provided data.' });
  }
});

// ============================================================
// APPOINTMENT ROUTES
// ============================================================

// Helper: convert TIMESTAMPTZ to separate date + time strings for the frontend
function splitDatetime(datetimeStr) {
  if (!datetimeStr) return { date: null, time: null };
  const d = new Date(datetimeStr);
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().slice(0, 5); // HH:MM
  return { date, time };
}

// Helper: merge frontend date + time into a TIMESTAMPTZ string
function mergeDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const combined = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
  return new Date(combined).toISOString();
}

// Normalize appointment type to match CHECK constraint
const VALID_TYPES = ['Consultation', 'Follow-up', 'Emergency'];
const VALID_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];

function normalizeType(type) {
  if (!type) return 'Consultation';
  const found = VALID_TYPES.find(t => t.toLowerCase() === type.toLowerCase());
  return found || 'Consultation';
}

function normalizeStatus(status) {
  if (!status) return 'Scheduled';
  const found = VALID_STATUSES.find(s => s.toLowerCase() === status.toLowerCase());
  return found || 'Scheduled';
}

// GET /api/appointments
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, patients(name)')
      .order('appointment_datetime', { ascending: true });

    if (error) throw error;

    // Split appointment_datetime back into date + time for frontend compatibility
    const mapped = appointments.map(a => {
      const { date, time } = splitDatetime(a.appointment_datetime);
      return {
        ...a,
        date,
        time,
        patient_name: a.patients ? a.patients.name : 'Unknown',
        // Map doctor_id label back to doctor string for frontend
        doctor: a.doctor_id || a.doctor || 'Dr. Priya S.'
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// POST /api/appointments
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { patient_id, doctor, date, time, type, status, notes, follow_up_required, follow_up_date } = req.body;

  if (!patient_id || !date) {
    return res.status(400).json({ error: 'patient_id and date are required.' });
  }

  try {
    const resolvedPatientId = await resolvePatientUUID(patient_id);
    if (!resolvedPatientId) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const appointment_datetime = mergeDateTime(date, time);
    const follow_up_dt = follow_up_date ? new Date(follow_up_date).toISOString() : null;

    const { error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: resolvedPatientId,
        appointment_datetime,
        type: normalizeType(type),
        status: normalizeStatus(status),
        notes: notes || null,
        follow_up_required: follow_up_required || false,
        follow_up_date: follow_up_dt
        // Note: doctor is stored as a text reference; doctor_id FK requires user UUID.
        // For now we store it on the frontend-side string until doctors are managed in users table.
      }]);

    if (error) throw error;
    res.status(201).json({ message: 'Appointment scheduled successfully.' });
  } catch (err) {
    console.error('POST /api/appointments error:', err);
    res.status(500).json({ error: 'Failed to schedule appointment.' });
  }
});

// PATCH /api/appointments/:id/status
app.patch('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const normalizedStatus = normalizeStatus(status);

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: normalizedStatus })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Appointment status updated.' });
  } catch (err) {
    console.error('PATCH /api/appointments/:id/status error:', err);
    res.status(500).json({ error: 'Failed to update appointment status.' });
  }
});

// ============================================================
// BILLING ROUTES
// ============================================================

// Helper: generate bill number
async function generateBillNumber() {
  const { count } = await supabase
    .from('bills')
    .select('*', { count: 'exact', head: true });
  const next = (count || 0) + 1;
  return `INV-${String(next).padStart(6, '0')}`;
}

// POST /api/billing
app.post('/api/billing', authenticateToken, async (req, res) => {
  // Accept legacy payload: { id, patient_id, total_amount, items_json }
  const { patient_id, total_amount, items_json, subtotal_amount, discount_amount, tax_amount, payment_mode, status } = req.body;

  if (!patient_id || total_amount === undefined) {
    return res.status(400).json({ error: 'patient_id and total_amount are required.' });
  }

  // Parse items — may arrive as a JSON string or already as an array
  let items = items_json;
  if (typeof items_json === 'string') {
    try { items = JSON.parse(items_json); } catch { items = []; }
  }
  if (!Array.isArray(items)) items = [];

  // Validate payment_mode against CHECK constraint
  const VALID_PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
  const VALID_BILL_STATUSES = ['Pending', 'Paid', 'Cancelled'];
  const safePaymentMode = VALID_PAYMENT_MODES.includes(payment_mode) ? payment_mode : null;
  const safeBillStatus = VALID_BILL_STATUSES.includes(status) ? status : 'Pending';

  try {
    const resolvedPatientId = await resolvePatientUUID(patient_id);
    if (!resolvedPatientId) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const bill_number = await generateBillNumber();

    // 1. Insert into bills table
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert([{
        bill_number,
        patient_id: resolvedPatientId,
        total_amount: parseFloat(total_amount),
        subtotal_amount: parseFloat(subtotal_amount || total_amount),
        discount_amount: parseFloat(discount_amount || 0),
        tax_amount: parseFloat(tax_amount || 0),
        payment_mode: safePaymentMode,
        status: safeBillStatus
      }])
      .select()
      .single();

    if (billError) throw billError;

    // 2. Insert line items into bill_items table
    if (items.length > 0) {
      const billItems = items.map(item => ({
        bill_id: bill.id,
        description: item.name || item.medicine || item.description || 'Item',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price || item.unit_price || 0),
        total_price: parseFloat((item.quantity || 1) * (item.price || item.unit_price || 0))
      }));

      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(billItems);

      if (itemsError) throw itemsError;
    }

    res.status(201).json({
      message: 'Invoice saved successfully.',
      bill_id: bill.id,
      bill_number: bill.bill_number
    });
  } catch (err) {
    console.error('POST /api/billing error:', err);
    res.status(500).json({ error: 'Failed to save invoice.' });
  }
});

// GET /api/billing
app.get('/api/billing', authenticateToken, async (req, res) => {
  try {
    const { data: bills, error } = await supabase
      .from('bills')
      .select('*, bill_items(*), patients(name)')
      .order('bill_date', { ascending: false });

    if (error) throw error;

    // Reconstruct legacy items_json for frontend compatibility
    const mapped = bills.map(b => ({
      ...b,
      date: b.bill_date,
      patient_name: b.patients ? b.patients.name : 'Unknown',
      items_json: b.bill_items || []
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/billing error:', err);
    res.status(500).json({ error: 'Failed to fetch billing records.' });
  }
});

// ============================================================
// PRESCRIPTIONS ROUTES
// ============================================================

// GET /api/prescriptions
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*, prescription_items(*), patients(name)')
      .order('prescription_date', { ascending: false });

    if (error) throw error;

    const mapped = prescriptions.map(p => ({
      ...p,
      patient_name: p.patients ? p.patients.name : 'Unknown',
      items: p.prescription_items || []
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/prescriptions error:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions.' });
  }
});

// POST /api/prescriptions
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
  const { patient_id, appointment_id, symptoms_observed, diagnosis, advice, next_visit_date, items } = req.body;

  if (!patient_id) return res.status(400).json({ error: 'patient_id is required.' });

  try {
    const resolvedPatientId = await resolvePatientUUID(patient_id);
    if (!resolvedPatientId) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const { data: prescription, error: prescError } = await supabase
      .from('prescriptions')
      .insert([{
        patient_id: resolvedPatientId,
        appointment_id: appointment_id || null,
        symptoms_observed: symptoms_observed || null,
        diagnosis: diagnosis || null,
        advice: advice || null,
        next_visit_date: next_visit_date ? new Date(next_visit_date).toISOString() : null
      }])
      .select()
      .single();

    if (prescError) throw prescError;

    // Insert prescription items if provided
    if (Array.isArray(items) && items.length > 0) {
      const prescItems = items.map(item => ({
        prescription_id: prescription.id,
        medicine_name: item.medicine_name || item.name || 'Unknown',
        medicine_id: item.medicine_id || null,
        dosage: item.dosage || '—',
        frequency: item.frequency || '—',
        duration: item.duration || null,
        instructions: item.instructions || null
      }));

      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(prescItems);

      if (itemsError) throw itemsError;
    }

    res.status(201).json({
      message: 'Prescription saved successfully.',
      prescription_id: prescription.id
    });
  } catch (err) {
    console.error('POST /api/prescriptions error:', err);
    res.status(500).json({ error: 'Failed to save prescription.' });
  }
});

// ============================================================
// COMMUNICATIONS ROUTES
// ============================================================

// GET /api/communications
app.get('/api/communications', authenticateToken, async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('communications')
      .select('*, patients(name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Map new column names to legacy names for frontend compatibility
    const mapped = logs.map(l => ({
      ...l,
      recipients: l.recipient_address,
      message: l.message_content,
      sent_at: l.sent_at || l.created_at,
      patient_name: l.patients ? l.patients.name : null
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/communications error:', err);
    res.status(500).json({ error: 'Failed to fetch communication logs.' });
  }
});

// POST /api/communications
app.post('/api/communications', authenticateToken, async (req, res) => {
  // Accept legacy: { channel, recipients, message }
  // Also accept new: { channel, recipient_address, message_content, subject, patient_id }
  const {
    channel,
    recipients,
    recipient_address,
    message,
    message_content,
    subject,
    patient_id
  } = req.body;

  const finalChannel = channel;
  const finalRecipient = recipient_address || recipients;
  const finalMessage = message_content || message;

  if (!finalChannel || !finalRecipient || !finalMessage) {
    return res.status(400).json({ error: 'channel, recipients, and message are required.' });
  }

  // Validate channel against CHECK constraint
  const VALID_CHANNELS = ['WhatsApp', 'Email', 'SMS'];
  if (!VALID_CHANNELS.includes(finalChannel)) {
    return res.status(400).json({
      error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(', ')}`
    });
  }

  try {
    const resolvedPatientId = await resolvePatientUUID(patient_id);

    const { error } = await supabase
      .from('communications')
      .insert([{
        channel: finalChannel,
        recipient_address: finalRecipient,
        message_content: finalMessage,
        subject: subject || null,
        patient_id: resolvedPatientId || null,
        status: 'Sent',
        sent_at: new Date().toISOString()
      }]);

    if (error) throw error;
    res.status(201).json({ message: 'Communication logged successfully.' });
  } catch (err) {
    console.error('POST /api/communications error:', err);
    res.status(500).json({ error: 'Failed to log communication.' });
  }
});

// ============================================================
// STATIC FILES
// ============================================================
// Serve frontend last so API routes take priority
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============================================================
// START SERVER
// ============================================================
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to Supabase:', err.message);
  process.exit(1);
});
