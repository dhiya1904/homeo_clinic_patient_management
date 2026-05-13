/* ============================================================
   HomeoCareCRM — Dashboard Script
   ============================================================ */

// ── DATA ──────────────────────────────────────────────────────
const APPOINTMENTS = [
  { id: 1, name: "Meera Nair",      time: "09:00 AM", doctor: "Dr. Priya S.",  type: "New Consultation", status: "confirmed" },
  { id: 2, name: "Arjun Pillai",    time: "09:45 AM", doctor: "Dr. Arjun K.", type: "Follow-up",        status: "pending"   },
  { id: 3, name: "Divya Menon",     time: "10:30 AM", doctor: "Dr. Priya S.",  type: "Follow-up",        status: "confirmed" },
  { id: 4, name: "Rahul Thomas",    time: "11:15 AM", doctor: "Dr. Arjun K.", type: "Emergency",        status: "cancelled" },
  { id: 5, name: "Sreelakshmi V.",  time: "12:00 PM", doctor: "Dr. Priya S.",  type: "New Consultation", status: "confirmed" },
  { id: 6, name: "Kiran Das",       time: "02:00 PM", doctor: "Dr. Arjun K.", type: "Follow-up",        status: "pending"   },
];

const PAST_APPOINTMENTS = [
  { id: 101, date: "May 08, 2026", name: "Anil Kumar",   time: "10:00 AM", doctor: "Dr. Priya S.", type: "Follow-up", status: "confirmed" },
  { id: 102, date: "May 08, 2026", name: "Sneha Nair",   time: "11:30 AM", doctor: "Dr. Arjun K.", type: "New Consultation", status: "confirmed" },
  { id: 103, date: "May 07, 2026", name: "Ravi Teja",    time: "09:15 AM", doctor: "Dr. Priya S.", type: "Emergency", status: "confirmed" },
  { id: 104, date: "May 07, 2026", name: "Geetha M.",    time: "04:00 PM", doctor: "Dr. Arjun K.", type: "Follow-up", status: "cancelled" },
];

const PATIENT_DATA = { total: 1284, new: 214, repeat: 538, old: 532 };

const PATIENTS = [
  { id: "P-1001", name: "Meera Nair",     age: 34, condition: "Migraine",      tag: "new",  color: "#3b82f6" },
  { id: "P-1002", name: "Arjun Pillai",   age: 29, condition: "Allergic Rhinitis", tag: "old", color: "#7c3aed" },
  { id: "P-1003", name: "Divya Menon",    age: 42, condition: "Arthritis",     tag: "old",  color: "#0d9488" },
  { id: "P-1004", name: "Rahul Thomas",   age: 55, condition: "Hypertension",  tag: "old",  color: "#d97706" },
  { id: "P-1005", name: "Sreelakshmi V.", age: 28, condition: "Skin Allergy",  tag: "new",  color: "#e11d48" },
];

const FOLLOWUPS = [
  { name: "Binu George",    date: "Today, 4:00 PM",   urgency: "today"    },
  { name: "Latha Suresh",   date: "Tomorrow, 10:00 AM", urgency: "soon"  },
  { name: "Pradeep Kumar",  date: "May 10, 9:30 AM",  urgency: "upcoming" },
  { name: "Anitha Raj",     date: "May 11, 2:00 PM",  urgency: "upcoming" },
];

const CHART_DATA = {
  weekly:  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], values: [6200,8400,5100,9300,7800,11200,8500] },
  monthly: { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul"], values: [54000,61000,48000,72000,84500,67000,78000] },
};

const MEDICINE_DATA = [
  { patient: "Meera Nair",      medicine: "Arnica Montana 200", dosage: "5 drops", frequency: "3 times a day", status: "Running", start: "May 01, 2026" },
  { patient: "Arjun Pillai",    medicine: "Nux Vomica 30",     dosage: "4 pills", frequency: "twice daily",  status: "Running", start: "May 05, 2026" },
  { patient: "Divya Menon",     medicine: "Rhus Tox 200C",     dosage: "5 drops", frequency: "once a day",    status: "Completed", start: "Apr 20, 2026" },
  { patient: "Rahul Thomas",    medicine: "Belladonna 1M",     dosage: "2 pills", frequency: "every 4 hours", status: "Running", start: "May 10, 2026" },
  { patient: "Sreelakshmi V.",  medicine: "Pulsatilla 30",     dosage: "5 drops", frequency: "bedtime",       status: "Running", start: "May 08, 2026" },
  { patient: "Anil Kumar",      medicine: "Lycopodium 200",    dosage: "4 pills", frequency: "morning",       status: "Completed", start: "Apr 15, 2026" },
  { patient: "Sneha Nair",      medicine: "Ignatia 30",        dosage: "5 drops", frequency: "thrice daily",  status: "Running", start: "May 02, 2026" },
];


// ── UTILITIES ─────────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  if (!t) {
    console.log(`Toast (${type}): ${msg}`);
    return;
  }
  t.textContent = "";
  const icon = document.createElement("i");
  icon.className = type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark";
  t.appendChild(icon);
  t.appendChild(document.createTextNode(" " + msg));
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = "toast"; }, 3200);
}

// ── COUNTER ANIMATION ─────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || "";
  const duration = 1200;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + (target > 999
      ? Math.floor(current).toLocaleString("en-IN")
      : Math.floor(current));
    if (current >= target) clearInterval(timer);
  }, step);
}

function initCounters() {
  // Only animate remaining stat-value elements (follow-ups + revenue)
  document.querySelectorAll(".stat-value[data-target]").forEach(el => animateCounter(el));
  // Update apt count badge
  const badge = document.getElementById("aptCount");
  if (badge) badge.textContent = APPOINTMENTS.length;
}

// ── DONUT CHART ───────────────────────────────────────────────
function renderDonutChart() {
  const { total, new: n, repeat: r, old: o } = PATIENT_DATA;
  const circumference = 2 * Math.PI * 62; // r=62
  const segs = [
    { id: "seg-new",    val: n },
    { id: "seg-repeat", val: r },
    { id: "seg-old",    val: o },
  ];

  let offset = 0;
  segs.forEach(({ id, val }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const dash = (val / total) * circumference;
    el.style.strokeDasharray  = `0 ${circumference}`;
    el.style.strokeDashoffset = -offset;
    setTimeout(() => {
      el.style.strokeDasharray = `${dash} ${circumference - dash}`;
    }, 80);
    offset += dash;
  });

  const totalEl = document.getElementById("donutTotal");
  if (totalEl) {
    let c = 0;
    const inc = total / 75;
    const t = setInterval(() => {
      c = Math.min(c + inc, total);
      totalEl.textContent = Math.floor(c).toLocaleString("en-IN");
      if (c >= total) clearInterval(t);
    }, 16);
  }

  [["leg-new", n], ["leg-repeat", r], ["leg-old", o]].forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let c = 0; const inc = val / 75;
    const t = setInterval(() => {
      c = Math.min(c + inc, val);
      el.textContent = Math.floor(c);
      if (c >= val) clearInterval(t);
    }, 16);
  });
}

// ── APT STATUS CHART ───────────────────────────────────────
function renderAptStatusChart() {
  const counts = { confirmed: 0, pending: 0, cancelled: 0 };
  APPOINTMENTS.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
  const total = APPOINTMENTS.length;

  const totalEl = document.getElementById("aptStatusTotal");
  if (totalEl) totalEl.textContent = `${total} total`;

  const statuses = ["confirmed", "pending", "cancelled"];
  statuses.forEach(s => {
    const fill  = document.getElementById(`bar-${s}`);
    const count = document.getElementById(`cnt-${s}`);
    if (!fill || !count) return;
    count.textContent = counts[s];
    const pct = total ? Math.round((counts[s] / total) * 100) : 0;
    // animate
    setTimeout(() => { fill.style.width = pct + "%"; }, 120);
  });
}

// ── APPOINTMENTS TABLE ────────────────────────────────────────
function renderAppointments(filter = "all") {
  const tbody = document.getElementById("appointmentsBody");
  if (!tbody) return;
  let rows;
  if (filter === "all") rows = APPOINTMENTS;
  else if (filter === "upcoming") rows = APPOINTMENTS.filter(a => a.status !== "cancelled" && a.status !== "completed");
  else rows = APPOINTMENTS.filter(a => a.status === filter);
  tbody.innerHTML = rows.map((a, i) => `
    <tr>
      <td>${String(i + 1).padStart(2,"0")}</td>
      <td><strong>${a.name}</strong></td>
      <td><i class="fa-regular fa-clock" style="color:var(--muted);margin-right:5px"></i>${a.time}</td>
      <td>${a.doctor}</td>
      <td>${a.type}</td>
      <td>
        <select class="status-select badge badge-${a.status}" data-id="${a.id}">
          <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="tbl-action" title="View" aria-label="View ${a.name}"><i class="fa-solid fa-eye"></i></button>
        <button class="tbl-action" title="Edit" aria-label="Edit ${a.name}"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="tbl-action" title="Delete" aria-label="Delete ${a.name}" style="color:#ef4444"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join("");
}

// ── PAST APPOINTMENTS TABLE ───────────────────────────────────
function renderPastAppointments() {
  const tbody = document.getElementById("pastAppointmentsBody");
  if (!tbody) return;
  tbody.innerHTML = PAST_APPOINTMENTS.map(a => `
    <tr>
      <td><span class="badge" style="background:var(--bg);border:1px solid var(--border);color:var(--muted)">${a.date}</span></td>
      <td><strong>${a.name}</strong></td>
      <td><i class="fa-regular fa-clock" style="color:var(--muted);margin-right:5px"></i>${a.time}</td>
      <td>${a.doctor}</td>
      <td>${a.type}</td>
      <td><span class="badge badge-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
      <td>
        <button class="tbl-action" title="View"><i class="fa-solid fa-eye"></i></button>
      </td>
    </tr>`).join("");
}

// ── PATIENTS TABLE ──────────────────────────────────────────────
function renderPatients() {
  const tbody = document.getElementById("patientList");
  if (!tbody) return;
  tbody.innerHTML = PATIENTS.map(p => `
    <li class="patient-item" role="listitem">
      <div class="patient-avatar" style="background:${p.color}">${getInitials(p.name)}</div>
      <div class="patient-info">
        <div class="patient-name">${p.name}</div>
        <div class="patient-meta">${p.age} yrs &nbsp;·&nbsp; ${p.condition}</div>
      </div>
      <span class="patient-tag tag-${p.tag}">${p.tag === "new" ? "New" : "Returning"}</span>
    </li>`).join("");
}

// ── ALL PATIENTS TABLE (patients.html) ─────────────────────────
function renderAllPatients() {
  const tbody = document.getElementById("allPatientsBody");
  if (!tbody) return;
  tbody.innerHTML = PATIENTS.map(p => `
    <tr>
      <td><div class="patient-avatar" style="background:${p.color};width:32px;height:32px;font-size:12px;margin:auto;">${getInitials(p.name)}</div></td>
      <td><strong style="color:var(--accent); cursor:pointer" onclick="openPatientProfile('${p.id}')">${p.name}</strong></td>
      <td>${p.age}</td>
      <td>${p.condition}</td>
      <td><span class="badge badge-${p.tag === 'new' ? 'confirmed' : 'pending'}">${p.tag === "new" ? "New" : "Returning"}</span></td>
      <td>
        <button class="tbl-action" title="View" onclick="openPatientProfile('${p.id}')"><i class="fa-solid fa-eye"></i></button>
        <button class="tbl-action" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
      </td>
    </tr>`).join("");
}

function openPatientProfile(id) {
  const p = PATIENTS.find(pat => pat.id === id);
  if (!p) return;

  const overlay = document.getElementById("patientDetailsModalOverlay");
  if (!overlay) return;

  // Populate Sidebar
  document.getElementById("detAvatar").textContent = getInitials(p.name);
  document.getElementById("detAvatar").style.background = p.color;
  document.getElementById("detName").textContent = p.name;
  document.getElementById("detID").textContent = p.id;
  document.getElementById("detAge").textContent = p.age + " Years";
  document.getElementById("detCondition").textContent = p.condition;

  const billBtn = document.getElementById("detNewBillBtn");
  if (billBtn) {
    billBtn.onclick = () => window.location.href = `billing.html?id=${p.id}`;
  }

  // Populate History (Mock)
  const historyList = document.getElementById("detHistory");
  const prescriptions = MEDICINE_DATA.filter(m => m.patient === p.name);
  
  if (prescriptions.length === 0) {
    historyList.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--muted)">No consultation history found for this patient.</div>';
  } else {
    historyList.innerHTML = prescriptions.map(presc => `
      <div class="card" style="background:var(--bg); border:1px solid var(--border); padding:1rem">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
          <span style="font-weight:700; color:var(--accent)">${presc.start}</span>
          <span class="badge badge-confirmed">Completed</span>
        </div>
        <p style="font-size:0.9rem; margin-bottom:0.8rem"><strong>Diagnosis:</strong> ${p.condition} - Patient reported improvement.</p>
        <div style="background:var(--card); padding:0.8rem; border-radius:8px; border:1px solid var(--border)">
          <div style="font-size:0.8rem; font-weight:600; color:var(--muted); margin-bottom:0.4rem">PRESCRIBED MEDICINE</div>
          <div style="display:flex; justify-content:space-between">
            <span style="font-weight:600">${presc.medicine}</span>
            <span>${presc.dosage} | ${presc.frequency}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  overlay.hidden = false;

  document.getElementById("closeDetailsModal").onclick = () => overlay.hidden = true;
  overlay.onclick = (e) => { if(e.target === overlay) overlay.hidden = true; };
}

// ── FOLLOW-UPS LIST ───────────────────────────────────────────
function renderFollowups() {
  const list = document.getElementById("followupList");
  if (!list) return;
  list.innerHTML = FOLLOWUPS.map(f => `
    <li class="followup-item" role="listitem">
      <div class="fu-icon"><i class="fa-solid fa-rotate-right"></i></div>
      <div>
        <div class="fu-name">${f.name}</div>
        <div class="fu-date">${f.date}</div>
      </div>
      <span class="fu-urgency fu-${f.urgency}">${f.urgency.charAt(0).toUpperCase()+f.urgency.slice(1)}</span>
    </li>`).join("");
}

// ── MEDICINES TABLE ───────────────────────────────────────────
function renderMedicines() {
  const tbody = document.getElementById("medicinesBody");
  if (!tbody) return;
  tbody.innerHTML = MEDICINE_DATA.map(m => `
    <tr>
      <td><strong>${m.patient}</strong></td>
      <td><span class="badge" style="background:rgba(96, 165, 250, 0.1);color:var(--accent);border:1px solid rgba(96, 165, 250, 0.2)">${m.medicine}</span></td>
      <td>${m.dosage}</td>
      <td>${m.frequency}</td>
      <td><span class="badge" style="background:var(--bg);border:1px solid var(--border);color:var(--muted)">${m.start}</span></td>
      <td><span class="badge badge-${m.status === 'Running' ? 'confirmed' : 'completed'}">${m.status}</span></td>
      <td>
        <button class="tbl-action" title="Edit Prescription"><i class="fa-solid fa-prescription"></i></button>
        <button class="tbl-action" title="Update Status"><i class="fa-solid fa-arrows-rotate"></i></button>
      </td>
    </tr>`).join("");
}

// ── CHART ─────────────────────────────────────────────────────
let currentPeriod = "weekly";

function renderChart(period) {
  const area = document.getElementById("chartArea");
  const labels = document.getElementById("chartLabels");
  if (!area || !labels) return;

  const data = CHART_DATA[period];
  const max = Math.max(...data.values);

  area.innerHTML = data.values.map((v, i) => {
    const pct = Math.round((v / max) * 100);
    return `<div class="chart-bar-wrap">
      <div class="chart-bar" style="height:0%" data-pct="${pct}" title="₹${v.toLocaleString("en-IN")}"></div>
    </div>`;
  }).join("");

  labels.innerHTML = data.labels.map(l => `<span class="chart-label">${l}</span>`).join("");

  // animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll(".chart-bar").forEach(bar => {
      setTimeout(() => { bar.style.height = bar.dataset.pct + "%"; }, 50);
    });
  });
}

// ── SIDEBAR TOGGLE ────────────────────────────────────────────
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const wrapper = document.getElementById("mainWrapper");

  // Desktop collapse toggle (inside sidebar)
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    wrapper.classList.toggle("expanded");
  });

  // Mobile hamburger
  document.getElementById("menuBtn").addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  // Close mobile sidebar on outside click
  document.addEventListener("click", e => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !document.getElementById("menuBtn").contains(e.target)) {
      sidebar.classList.remove("mobile-open");
    }
  });
}

// ── NAV ACTIVE STATE ──────────────────────────────────────────
function initNav() {
  const links = document.querySelectorAll(".nav-link");
  const title = document.getElementById("pageTitle");
  links.forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      link.closest(".nav-item").classList.add("active");
      title.textContent = link.querySelector(".nav-label")?.textContent || "Dashboard";
    });
  });
}

// ── ADMIN DROPDOWN ────────────────────────────────────────────
function initAdminDropdown() {
  const profile = document.getElementById("adminProfile");
  profile.addEventListener("click", e => {
    e.stopPropagation();
    profile.classList.toggle("open");
    profile.setAttribute("aria-expanded", profile.classList.contains("open"));
  });
  document.addEventListener("click", () => {
    profile.classList.remove("open");
    profile.setAttribute("aria-expanded", "false");
  });
}

// ── MODAL ─────────────────────────────────────────────────────
function initModal() {
  const overlay = document.getElementById("modalOverlay");
  const form = document.getElementById("appointmentForm");
  if (!overlay || !form) return;
  
  const openBtns = [document.getElementById("addAppointmentBtn"), document.getElementById("qa-book-apt")];
  const closeBtns = [document.getElementById("modalClose"), document.getElementById("cancelModal")];

  openBtns.forEach(btn => btn && btn.addEventListener("click", () => {
    overlay.hidden = false;
  }));

  closeBtns.forEach(btn => btn && btn.addEventListener("click", () => {
    overlay.hidden = true;
    form.reset();
  }));

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { overlay.hidden = true; form.reset(); }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nameInput = document.getElementById("patientName");
    const timeInput = document.getElementById("aptTime");
    const doctorInput = document.getElementById("aptDoctor");
    const typeInput = document.getElementById("aptType");

    if (!nameInput || !timeInput || !doctorInput || !typeInput) return;

    const name = nameInput.value.trim();
    const time = timeInput.value;
    const doctor = doctorInput.value;
    const type = typeInput.value;

    if (!name || !time || !doctor || !type) {
      showToast("Please fill all fields.", "error");
      return;
    }

    // Add to data
    APPOINTMENTS.unshift({ id: Date.now(), name, time, doctor, type, status: "pending" });
    
    // Update UI
    const filterEl = document.getElementById("aptFilter");
    renderAppointments(filterEl ? filterEl.value : "all");
    renderAptStatusChart();
    initCounters();
    
    overlay.hidden = true;
    form.reset();
    showToast(`Appointment for ${name} booked!`);
  });
}

// ── PRESCRIPTION MODAL ─────────────────────────────────────────
function initPrescriptionModal() {
  const overlay = document.getElementById("prescriptionModalOverlay");
  const form = document.getElementById("prescriptionForm");
  const openBtn = document.getElementById("addPrescriptionBtn");
  if (!overlay || !form || !openBtn) return;

  const closeBtns = [document.getElementById("prescModalClose"), document.getElementById("cancelPrescModal")];

  openBtn.addEventListener("click", () => {
    overlay.hidden = false;
  });

  closeBtns.forEach(btn => btn && btn.addEventListener("click", () => {
    overlay.hidden = true;
    form.reset();
  }));

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { overlay.hidden = true; form.reset(); }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const patient = document.getElementById("prescPatient").value.trim();
    const medicine = document.getElementById("prescMedicine").value.trim();
    const dosage = document.getElementById("prescDosage").value.trim();
    const frequency = document.getElementById("prescFreq").value.trim();

    if (!patient || !medicine || !dosage || !frequency) {
      showToast("Please fill all fields.", "error");
      return;
    }

    const start = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    MEDICINE_DATA.unshift({ patient, medicine, dosage, frequency, status: "Running", start });
    
    renderMedicines();
    overlay.hidden = true;
    form.reset();
    showToast(`Prescription for ${patient} saved!`);
  });
}

// ── FILTER ────────────────────────────────────────────────────
function initFilter() {
  const filter = document.getElementById("aptFilter");
  if (!filter) return;
  filter.addEventListener("change", e => {
    renderAppointments(e.target.value);
  });
}

// ── TABLE ACTIONS ─────────────────────────────────────────────
function initTableActions() {
  const body = document.getElementById("appointmentsBody");
  if (!body) return;
  body.addEventListener("change", e => {
    if (e.target.classList.contains("status-select")) {
      const id = parseInt(e.target.dataset.id, 10);
      const newStatus = e.target.value;
      const apt = APPOINTMENTS.find(a => a.id === id);
      if (apt) {
        apt.status = newStatus;
        e.target.className = `status-select badge badge-${newStatus}`;
        showToast(`Appointment status updated to ${newStatus}`);
        renderAptStatusChart();
      }
    }
  });
}

// ── CHART PERIOD TABS ─────────────────────────────────────────
function initChartTabs() {
  document.querySelectorAll(".period-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".period-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentPeriod = tab.dataset.period;
      renderChart(currentPeriod);
    });
  });
}

// ── SEARCH ────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const filterEl = document.getElementById("aptFilter");
    if (!q) { renderAppointments(filterEl ? filterEl.value : "all"); return; }
    const filtered = APPOINTMENTS.filter(a =>
      a.name.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
    );
    const tbody = document.getElementById("appointmentsBody");
    tbody.innerHTML = filtered.map((a, i) => `
      <tr>
        <td>${String(i+1).padStart(2,"0")}</td>
        <td><strong>${a.name}</strong></td>
        <td>${a.time}</td>
        <td>${a.doctor}</td>
        <td>${a.type}</td>
        <td><span class="badge badge-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
        <td>
          <button class="tbl-action"><i class="fa-solid fa-eye"></i></button>
          <button class="tbl-action"><i class="fa-solid fa-pen-to-square"></i></button>
        </td>
      </tr>`).join("");
  });
}

// ── QUICK ACTION TOAST ────────────────────────────────────────
function initQuickActions() {
  const billingBtn = document.getElementById("qa-billing");
  if (billingBtn) {
    billingBtn.addEventListener("click", () => {
      window.location.href = "billing.html";
    });
  }

  const map = {
    "qa-new-patient": "Opening new patient registration form…",
    "qa-book-apt":    "Opening appointment booking…",
  };
  Object.entries(map).forEach(([id, msg]) => {
    const el = document.getElementById(id);
    if (el && id !== "qa-new-patient") el.addEventListener("click", () => showToast(msg));
  });
}

// ── NEW PATIENT FORM ──────────────────────────────────────────
function initNewPatientForm() {
  const form = document.getElementById("newPatientForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      
      // Get the button to show loading state (optional, just disabled for now)
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
      }

      showToast("Patient registered successfully!");
      
      // Redirect back to dashboard after 1.5s
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    });
  }
}

// ── INIT ──────────────────────────────────────────────────────
// ── BILLING DATA ─────────────────────────────────────────────
const MEDICINE_PRICES = {
  "Arnica Montana 200": 150,
  "Nux Vomica 30": 120,
  "Rhus Tox 200C": 180,
  "Belladonna 1M": 200,
  "Pulsatilla 30": 140,
  "Lycopodium 200": 160,
  "Ignatia 30": 130
};

let CURRENT_BILL = {
  patient: null,
  consultation: 500,
  medicines: [],
  lab: 0,
  service: 0,
  discount: 0,
  taxRate: 18
};

function updateBillSummary() {
  const medicineTotal = CURRENT_BILL.medicines.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const subtotal = CURRENT_BILL.consultation + medicineTotal + CURRENT_BILL.lab + CURRENT_BILL.service;
  const discountAmount = (subtotal * CURRENT_BILL.discount) / 100;
  const taxable = subtotal - discountAmount;
  const tax = (taxable * CURRENT_BILL.taxRate) / 100;
  const total = taxable + tax;

  const el = (id) => document.getElementById(id);
  if (el("sumConsultation")) el("sumConsultation").textContent = `₹${CURRENT_BILL.consultation.toFixed(2)}`;
  if (el("sumMedicines")) el("sumMedicines").textContent = `₹${medicineTotal.toFixed(2)}`;
  if (el("sumOther")) el("sumOther").textContent = `₹${(CURRENT_BILL.lab + CURRENT_BILL.service).toFixed(2)}`;
  if (el("sumTax")) el("sumTax").textContent = `₹${tax.toFixed(2)}`;
  if (el("sumGrandTotal")) el("sumGrandTotal").textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function renderBillItems() {
  const tbody = document.getElementById("billItemsBody");
  if (!tbody) return;
  tbody.innerHTML = CURRENT_BILL.medicines.map((m, i) => `
    <tr>
      <td>${m.name}</td>
      <td>${m.quantity}</td>
      <td>₹${m.price}</td>
      <td>₹${m.quantity * m.price}</td>
      <td style="text-align:right">
        <button class="tbl-action" onclick="removeBillItem(${i})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
  if (CURRENT_BILL.medicines.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem italic">No medicines added</td></tr>';
  }
  updateBillSummary();
}

function addBillItem() {
  const med = document.getElementById("billMedSelect").value;
  const qty = parseInt(document.getElementById("billMedQty").value) || 1;
  if (!med) return;
  const price = MEDICINE_PRICES[med] || 0;
  CURRENT_BILL.medicines.push({ name: med, quantity: qty, price: price });
  renderBillItems();
}

function removeBillItem(index) {
  CURRENT_BILL.medicines.splice(index, 1);
  renderBillItems();
}

function initBillingPage() {
  const billForm = document.getElementById("billing-page-container");
  if (!billForm) return;

  // Auto-load patient from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const patientIdFromUrl = urlParams.get("id");
  if (patientIdFromUrl) {
    const input = document.getElementById("billPatientID");
    if (input) {
      input.value = patientIdFromUrl;
      setTimeout(() => {
        const btn = document.getElementById("searchPatientBill");
        if (btn) btn.click();
      }, 100);
    }
  }

  document.getElementById("addBillItemBtn").addEventListener("click", addBillItem);
  
  ["billConsultation", "billLab", "billService", "billDiscount"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        const val = parseFloat(input.value) || 0;
        if (id === "billConsultation") CURRENT_BILL.consultation = val;
        if (id === "billLab") CURRENT_BILL.lab = val;
        if (id === "billService") CURRENT_BILL.service = val;
        if (id === "billDiscount") CURRENT_BILL.discount = val;
        updateBillSummary();
      });
    }
  });

  document.getElementById("searchPatientBill")?.addEventListener("click", () => {
    const searchVal = document.getElementById("billPatientID").value.trim().toLowerCase();
    if (!searchVal) return;

    // 1. Find Patient Info
    const p = PATIENTS.find(pat => pat.name.toLowerCase().includes(searchVal) || pat.id?.toLowerCase() === searchVal);
    
    if (p) {
      document.getElementById("billPatientName").textContent = p.name;
      document.getElementById("billPatientDetails").textContent = `${p.age} Years • ${p.tag.toUpperCase()}`;
      
      // 2. Automatically Fetch Prescriptions for this patient
      const prescriptions = MEDICINE_DATA.filter(m => m.patient === p.name && m.status === "Running");
      
      if (prescriptions.length > 0) {
        // Clear existing bill and add prescribed items
        CURRENT_BILL.medicines = prescriptions.map(presc => ({
          name: presc.medicine,
          quantity: 1, // Default to 1, can be adjusted
          price: MEDICINE_PRICES[presc.medicine] || 0
        }));
        
        showToast(`Auto-fetched ${prescriptions.length} prescriptions for ${p.name}`);
      } else {
        CURRENT_BILL.medicines = [];
        showToast(`Loaded info for ${p.name}. No active prescriptions found.`);
      }
      
      renderBillItems();
    } else {
      showToast("Patient not found", "error");
    }
  });

  renderBillItems();
}

// ── REPORTS DATA ─────────────────────────────────────────────
const REPORT_DATA = [
  { month: "January",   revenue: 54000, patients: 120, appts: 145 },
  { month: "February",  revenue: 61000, patients: 135, appts: 160 },
  { month: "March",     revenue: 48000, patients: 110, appts: 130 },
  { month: "April",     revenue: 72000, patients: 155, appts: 185 },
  { month: "May",       revenue: 84500, patients: 190, appts: 210 },
  { month: "June",      revenue: 67000, patients: 145, appts: 170 },
  { month: "July",      revenue: 78000, patients: 165, appts: 195 },
];

function renderReportTable() {
  const tbody = document.getElementById("reportsTableBody");
  if (!tbody) return;
  tbody.innerHTML = REPORT_DATA.map(r => `
    <tr>
      <td><strong>${r.month} 2026</strong></td>
      <td style="color:var(--accent); font-weight:bold">₹${r.revenue.toLocaleString('en-IN')}</td>
      <td>${r.patients}</td>
      <td>${r.appts}</td>
      <td><span class="badge badge-confirmed">+${Math.floor(Math.random() * 15 + 5)}%</span></td>
    </tr>
  `).join("");
}

function initReportsPage() {
  if (!document.getElementById("reports-page-container")) return;
  renderReportTable();
  // We can reuse the existing renderChart if we have a chart container
  if (document.getElementById("reportsChartArea")) {
     // Custom logic for report specific charts can go here
  }
}

// ── THEME SWITCHER ──────────────────────────────────────────
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("clinic-theme", theme);
  showToast(`Theme switched to ${theme} mode`);
}

function initTheme() {
  const savedTheme = localStorage.getItem("clinic-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// ── CLINIC NAME PERSISTENCE ──────────────────────────────────
function setClinicName(name) {
  localStorage.setItem("clinic-name", name);
  applyClinicName(name);
}

function applyClinicName(name) {
  const elements = document.querySelectorAll(".clinic-name");
  elements.forEach(el => el.textContent = name);
}

function initClinicName() {
  const savedName = localStorage.getItem("clinic-name") || "Green Leaf Clinic";
  applyClinicName(savedName);
}

function initSettingsPage() {
  const settingsContainer = document.getElementById("settings-page-container");
  if (!settingsContainer) return;

  const savedTheme = localStorage.getItem("clinic-theme") || "dark";
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.value = savedTheme;
    themeToggle.addEventListener("change", (e) => setTheme(e.target.value));
  }

  // Load current clinic name into input
  const clinicInput = document.getElementById("setClinicName");
  if (clinicInput) {
    clinicInput.value = localStorage.getItem("clinic-name") || "Green Leaf Clinic";
  }

  document.getElementById("saveSettingsBtn")?.addEventListener("click", () => {
    const newName = document.getElementById("setClinicName").value.trim();
    if (newName) {
      setClinicName(newName);
      showToast(`Clinic name updated to "${newName}"`);
    }
  });
}

function printInvoice() {
  const patientName = document.getElementById("billPatientName").textContent;
  if (patientName === "No Patient Selected") {
    showToast("Please select a patient first!", "error");
    return;
  }

  // Populate print template
  document.getElementById("printDate").textContent = new Date().toLocaleDateString();
  document.getElementById("printBillNo").textContent = "BL-" + Math.floor(1000 + Math.random() * 9000);
  document.getElementById("printPatientName").textContent = patientName;
  document.getElementById("printPatientID").textContent = document.getElementById("billPatientID").value;
  
  const subtotal = Array.from(document.querySelectorAll("#billItemsBody tr")).reduce((acc, tr) => {
    const totalCell = tr.children[3];
    return acc + (totalCell ? parseFloat(totalCell.textContent.replace("₹", "")) : 0);
  }, 0) + 
    parseFloat(document.getElementById("billConsultation").value || 0) + 
    parseFloat(document.getElementById("billLab").value || 0) + 
    parseFloat(document.getElementById("billService").value || 0);

  const discountVal = parseFloat(document.getElementById("billDiscount").value || 0);
  const discountAmt = subtotal * (discountVal / 100);
  const tax = (subtotal - discountAmt) * 0.18;
  const grandTotal = subtotal - discountAmt + tax;

  document.getElementById("printSubtotal").textContent = "₹" + subtotal.toFixed(2);
  document.getElementById("printDiscount").textContent = "- ₹" + discountAmt.toFixed(2) + " (" + discountVal + "%)";
  document.getElementById("printTax").textContent = "₹" + tax.toFixed(2);
  document.getElementById("printTotal").textContent = "₹" + grandTotal.toFixed(2);

  // Populate table rows
  const printBody = document.getElementById("printTableBody");
  printBody.innerHTML = `
    <tr>
      <td style="padding:10px; border:1px solid #eee">Consultation Fee</td>
      <td style="padding:10px; border:1px solid #eee; text-align:center">1</td>
      <td style="padding:10px; border:1px solid #eee; text-align:right">₹${document.getElementById("billConsultation").value}</td>
    </tr>
  `;
  
  if (document.getElementById("billLab").value > 0) {
    printBody.innerHTML += `<tr><td style="padding:10px; border:1px solid #eee">Lab / Test Charges</td><td style="padding:10px; border:1px solid #eee; text-align:center">1</td><td style="padding:10px; border:1px solid #eee; text-align:right">₹${document.getElementById("billLab").value}</td></tr>`;
  }
  if (document.getElementById("billService").value > 0) {
    printBody.innerHTML += `<tr><td style="padding:10px; border:1px solid #eee">Service Charges</td><td style="padding:10px; border:1px solid #eee; text-align:center">1</td><td style="padding:10px; border:1px solid #eee; text-align:right">₹${document.getElementById("billService").value}</td></tr>`;
  }

  Array.from(document.querySelectorAll("#billItemsBody tr")).forEach(tr => {
    if (tr.children.length > 3) {
      const row = `<tr>
        <td style="padding:10px; border:1px solid #eee">${tr.children[0].textContent}</td>
        <td style="padding:10px; border:1px solid #eee; text-align:center">${tr.children[1].textContent}</td>
        <td style="padding:10px; border:1px solid #eee; text-align:right">${tr.children[3].textContent}</td>
      </tr>`;
      printBody.innerHTML += row;
    }
  });

  window.print();
}

// ── CALENDAR LOGIC ──────────────────────────────────────────
let currentCalDate = new Date(2026, 4, 1); // Starting May 2026

function initCalendar() {
  const viewListBtn = document.getElementById("viewList");
  const viewCalBtn = document.getElementById("viewCalendar");
  const listSection = document.getElementById("appointmentsList");
  const calSection = document.getElementById("appointmentsCalendar");
  const pastSection = document.getElementById("past-appointments-section");

  if (!viewListBtn || !viewCalBtn) return;

  viewListBtn.onclick = () => {
    viewListBtn.classList.add("active");
    viewCalBtn.classList.remove("active");
    viewListBtn.style.background = "var(--accent)";
    viewListBtn.style.color = "#000";
    viewCalBtn.style.background = "transparent";
    viewCalBtn.style.color = "var(--muted)";
    listSection.style.display = "block";
    pastSection.style.display = "block";
    calSection.style.display = "none";
  };

  viewCalBtn.onclick = () => {
    viewCalBtn.classList.add("active");
    viewListBtn.classList.remove("active");
    viewCalBtn.style.background = "var(--accent)";
    viewCalBtn.style.color = "#000";
    viewListBtn.style.background = "transparent";
    viewListBtn.style.color = "var(--muted)";
    listSection.style.display = "none";
    pastSection.style.display = "none";
    calSection.style.display = "block";
    renderCalendar();
  };

  document.getElementById("prevMonth")?.addEventListener("click", () => {
    currentCalDate.setMonth(currentCalDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("nextMonth")?.addEventListener("click", () => {
    currentCalDate.setMonth(currentCalDate.getMonth() + 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("currentMonthYear");
  if (!grid || !monthLabel) return;

  // Clear previous days (keep headers)
  const headers = Array.from(grid.children).slice(0, 7);
  grid.innerHTML = "";
  headers.forEach(h => grid.appendChild(h));

  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();
  const today = new Date();
  monthLabel.textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentCalDate);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    empty.style.background = "transparent";
    empty.style.border = "none";
    grid.appendChild(empty);
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day";
    
    // Highlight today
    if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
      dayBox.classList.add("today");
    }

    dayBox.innerHTML = `<span class="calendar-date">${d}</span>`;
    
    // Check for appointments (Mock Data Mapping)
    if (month === 4 && d === 13) {
       dayBox.classList.add("has-apt");
       dayBox.innerHTML += `
         <div class="apt-pill"><i class="fa-solid fa-user-check"></i> 6 Appts</div>
         <div class="apt-pill pending" style="margin-top:4px"><i class="fa-solid fa-clock"></i> 2 Pending</div>
       `;
    } else if (month === 4 && (d === 15 || d === 20)) {
       dayBox.classList.add("has-apt");
       dayBox.innerHTML += `<div class="apt-pill"><i class="fa-solid fa-user-check"></i> 3 Confirmed</div>`;
    }

    dayBox.onclick = () => showToast(`Schedule for ${monthLabel.textContent.split(' ')[0]} ${d} opened.`);
    grid.appendChild(dayBox);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initClinicName();
  initSidebar();
  initNav();
  initAdminDropdown();
  initModal();
  initPrescriptionModal();
  initFilter();
  initTableActions();
  initChartTabs();
  initSearch();
  initQuickActions();
  initNewPatientForm();
  initBillingPage();
  initReportsPage();
  initSettingsPage();
  initCalendar();

  // If calendar is default, render it
  if (document.getElementById("appointmentsCalendar")?.style.display !== "none") {
    renderCalendar();
  }

  const aptFilter = document.getElementById("aptFilter");
  renderAppointments(aptFilter ? aptFilter.value : "all");
  renderPastAppointments();
  renderPatients();
  renderAllPatients();
  renderMedicines();
  renderFollowups();
  renderChart(currentPeriod);
  renderDonutChart();
  renderAptStatusChart();
  initCounters();
});
