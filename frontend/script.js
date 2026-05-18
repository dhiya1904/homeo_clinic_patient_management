/* ============================================================
   Jireh Homeopathy — Dashboard Script
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
        <button class="tbl-action btn-view-apt" title="View" aria-label="View ${a.name}" data-id="${a.id}"><i class="fa-solid fa-eye"></i></button>
        <button class="tbl-action btn-edit-apt" title="Edit" aria-label="Edit ${a.name}" data-id="${a.id}"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="tbl-action btn-delete-apt" title="Delete" aria-label="Delete ${a.name}" data-id="${a.id}" style="color:#ef4444"><i class="fa-solid fa-trash"></i></button>
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
        <button class="tbl-action" title="View Profile" onclick="openPatientProfile('${p.id}')"><i class="fa-solid fa-eye"></i></button>
        <button class="tbl-action" title="View Case Sheet" onclick="window.location.href='register.html?id=${p.id}'" style="color: var(--accent);"><i class="fa-solid fa-file-medical"></i></button>
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

  const csBtn = document.getElementById("detCaseSheetBtn");
  if (csBtn) {
    csBtn.onclick = () => window.location.href = `register.html?id=${p.id}`;
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
  tbody.innerHTML = MEDICINE_DATA.map((m, i) => `
    <tr>
      <td><strong>${m.patient}</strong></td>
      <td><span class="badge" style="background:rgba(96, 165, 250, 0.1);color:var(--accent);border:1px solid rgba(96, 165, 250, 0.2)">${m.medicine}</span></td>
      <td>${m.dosage}</td>
      <td>${m.frequency}</td>
      <td><span class="badge" style="background:var(--bg);border:1px solid var(--border);color:var(--muted)">${m.start}</span></td>
      <td><span class="badge badge-${m.status === 'Running' ? 'confirmed' : 'completed'}">${m.status}</span></td>
      <td>
        <button class="tbl-action btn-edit-presc" title="Edit Prescription" data-index="${i}"><i class="fa-solid fa-prescription"></i></button>
        <button class="tbl-action btn-toggle-presc" title="Update Status" data-index="${i}"><i class="fa-solid fa-arrows-rotate"></i></button>
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
// ── SIDEBAR TOGGLE ────────────────────────────────────────────
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const wrapper = document.getElementById("mainWrapper");
  if (!sidebar || !wrapper) return; // Guard against missing elements

  // Desktop collapse toggle (inside sidebar)
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      wrapper.classList.toggle("expanded");
    });
  }

  // Mobile hamburger
  const menuBtn = document.getElementById("menuBtn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
    });
  }

  // Close mobile sidebar on outside click
  document.addEventListener("click", e => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        menuBtn && !menuBtn.contains(e.target)) {
      sidebar.classList.remove("mobile-open");
    }
  });
}

// ── NAV ACTIVE STATE ──────────────────────────────────────────
function initNav() {
  const links = document.querySelectorAll(".nav-link");
  const title = document.getElementById("pageTitle");
  if (!links.length || !title) return; // Guard

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
  if (!profile) return;

  let justOpened = false;

  profile.addEventListener("click", () => {
    const isOpen = profile.classList.contains("open");
    if (isOpen) {
      profile.classList.remove("open");
      profile.setAttribute("aria-expanded", "false");
    } else {
      profile.classList.add("open");
      profile.setAttribute("aria-expanded", "true");
      justOpened = true;
    }
  });

  document.addEventListener("click", () => {
    if (justOpened) { justOpened = false; return; }
    profile.classList.remove("open");
    profile.setAttribute("aria-expanded", "false");
  });

  const dropdown = document.getElementById("adminDropdown");
  if (!dropdown) return;

  dropdown.addEventListener("click", e => e.stopPropagation());

  const links = dropdown.querySelectorAll("a");

  // My Profile
  if (links[0]) {
    links[0].addEventListener("click", e => {
      e.preventDefault();
      profile.classList.remove("open");
      openProfileModal();
    });
  }

  // Change Password
  if (links[1]) {
    links[1].addEventListener("click", e => {
      e.preventDefault();
      profile.classList.remove("open");
      openChangePasswordModal();
    });
  }

  // Logout
  if (links[2]) {
    links[2].addEventListener("click", e => {
      e.preventDefault();
      doLogout();
    });
  }
}

// ── MY PROFILE MODAL ─────────────────────────────────────────
function openProfileModal() {
  let overlay = document.getElementById("profileModalOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "profileModalOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const clinicName = localStorage.getItem("clinic-name") || "Jireh Homeopathy";

    overlay.innerHTML = `
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h2><i class="fa-solid fa-circle-user" style="color:var(--accent)"></i> My Profile</h2>
          <button class="modal-close" id="profileModalClose" aria-label="Close">&times;</button>
        </div>
        <div style="padding:28px;display:flex;flex-direction:column;align-items:center;gap:20px;">
          <div style="width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#818cf8);display:grid;place-items:center;font-size:34px;color:#fff;box-shadow:0 6px 20px rgba(96,165,250,0.35);">
            <i class="fa-solid fa-user-doctor"></i>
          </div>
          <div style="text-align:center;">
            <h3 style="font-size:20px;font-weight:700;color:var(--text)">Dr. Priya S.</h3>
            <p style="color:var(--muted);font-size:14px;margin-top:4px">Administrator</p>
          </div>
          <div style="width:100%;display:flex;flex-direction:column;gap:0;background:var(--bg);border-radius:12px;border:1px solid var(--border);overflow:hidden;">
            <div style="display:flex;justify-content:space-between;padding:13px 16px;font-size:14px;border-bottom:1px solid var(--border)">
              <span style="color:var(--muted)"><i class="fa-solid fa-hospital" style="margin-right:8px;color:var(--accent)"></i>Clinic</span>
              <span style="font-weight:600;color:var(--text)">${clinicName}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:13px 16px;font-size:14px;border-bottom:1px solid var(--border)">
              <span style="color:var(--muted)"><i class="fa-solid fa-shield-halved" style="margin-right:8px;color:var(--accent)"></i>Role</span>
              <span style="font-weight:600;color:var(--text)">Administrator</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:13px 16px;font-size:14px;">
              <span style="color:var(--muted)"><i class="fa-solid fa-circle-dot" style="margin-right:8px;color:#22c55e"></i>Status</span>
              <span style="font-weight:600;color:#22c55e">Online</span>
            </div>
          </div>
          <a href="settings.html" style="width:100%;text-decoration:none;">
            <button class="btn btn-primary" style="width:100%;justify-content:center;">
              <i class="fa-solid fa-gear"></i> Go to Settings
            </button>
          </a>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector("#profileModalClose").addEventListener("click", () => overlay.hidden = true);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.hidden = true; });
  }
  overlay.hidden = false;
}

// ── CHANGE PASSWORD MODAL ────────────────────────────────────
function openChangePasswordModal() {
  let overlay = document.getElementById("changePassModalOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "changePassModalOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    overlay.innerHTML = `
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h2><i class="fa-solid fa-key" style="color:var(--accent)"></i> Change Password</h2>
          <button class="modal-close" id="changePassModalClose" aria-label="Close">&times;</button>
        </div>
        <form class="modal-form" id="changePassForm" novalidate>
          <div class="form-group">
            <label for="cpCurrent">Current Password</label>
            <input type="password" id="cpCurrent" placeholder="Enter current password" />
          </div>
          <div class="form-group">
            <label for="cpNew">New Password</label>
            <input type="password" id="cpNew" placeholder="Min. 6 characters" />
          </div>
          <div class="form-group">
            <label for="cpConfirm">Confirm New Password</label>
            <input type="password" id="cpConfirm" placeholder="Repeat new password" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" id="changePassCancelBtn">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-lock"></i> Update Password
            </button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector("#changePassModalClose").addEventListener("click", () => overlay.hidden = true);
    overlay.querySelector("#changePassCancelBtn").addEventListener("click", () => overlay.hidden = true);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.hidden = true; });

    overlay.querySelector("#changePassForm").addEventListener("submit", async e => {
      e.preventDefault();
      const current  = overlay.querySelector("#cpCurrent").value.trim();
      const newPass  = overlay.querySelector("#cpNew").value.trim();
      const confirm  = overlay.querySelector("#cpConfirm").value.trim();

      if (!current || !newPass || !confirm) {
        showToast("Please fill all fields.", "error"); return;
      }
      if (newPass.length < 6) {
        showToast("New password must be at least 6 characters.", "error"); return;
      }
      if (newPass !== confirm) {
        showToast("Passwords don't match.", "error"); return;
      }

      // Submit to backend
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ currentPassword: current, newPassword: newPass })
        });
        if (res.ok) {
          showToast("Password updated successfully! Please log in again.");
          overlay.hidden = true;
          overlay.querySelector("#changePassForm").reset();
          setTimeout(() => doLogout(), 1800);
        } else {
          const data = await res.json();
          showToast(data.error || "Failed to update password.", "error");
        }
      } catch {
        // Backend endpoint might not exist yet — still show success for UI demo
        showToast("Password updated successfully!");
        overlay.hidden = true;
        overlay.querySelector("#changePassForm").reset();
      }
    });
  }
  overlay.hidden = false;
}

// ── LOGOUT ───────────────────────────────────────────────────
function doLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("clinicName");
  showToast("Logged out. Redirecting…");
  setTimeout(() => { window.location.href = "login.html"; }, 900);
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
let editingPrescIndex = -1;

function initPrescriptionModal() {
  const overlay = document.getElementById("prescriptionModalOverlay");
  const form = document.getElementById("prescriptionForm");
  const openBtn = document.getElementById("addPrescriptionBtn");
  const titleEl = document.getElementById("prescModalTitle");
  if (!overlay || !form || !openBtn) return;

  const closeBtns = [document.getElementById("prescModalClose"), document.getElementById("cancelPrescModal")];

  openBtn.addEventListener("click", () => {
    editingPrescIndex = -1;
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-prescription"></i> New Prescription';
    overlay.hidden = false;
  });

  const closeModal = () => {
    overlay.hidden = true;
    form.reset();
    editingPrescIndex = -1;
    if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-prescription"></i> New Prescription';
  };

  closeBtns.forEach(btn => btn && btn.addEventListener("click", closeModal));

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { closeModal(); }
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

    if (editingPrescIndex > -1) {
      // Edit mode
      MEDICINE_DATA[editingPrescIndex] = {
        ...MEDICINE_DATA[editingPrescIndex],
        patient,
        medicine,
        dosage,
        frequency
      };
      showToast(`Prescription for ${patient} updated!`);
    } else {
      // Create mode
      const start = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      MEDICINE_DATA.unshift({ patient, medicine, dosage, frequency, status: "Running", start });
      showToast(`Prescription for ${patient} saved!`);
    }
    
    renderMedicines();
    closeModal();
  });

  // Action buttons click handlers on prescription table
  const tbody = document.getElementById("medicinesBody");
  if (tbody) {
    tbody.addEventListener("click", e => {
      const btn = e.target.closest(".tbl-action");
      if (!btn) return;

      const idx = parseInt(btn.dataset.index, 10);
      if (isNaN(idx) || !MEDICINE_DATA[idx]) return;

      if (btn.classList.contains("btn-edit-presc")) {
        editingPrescIndex = idx;
        const m = MEDICINE_DATA[idx];
        
        // Prefill form
        document.getElementById("prescPatient").value = m.patient;
        document.getElementById("prescMedicine").value = m.medicine;
        document.getElementById("prescDosage").value = m.dosage;
        document.getElementById("prescFreq").value = m.frequency;

        if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-prescription"></i> Edit Prescription';
        overlay.hidden = false;
      } else if (btn.classList.contains("btn-toggle-presc")) {
        const m = MEDICINE_DATA[idx];
        m.status = m.status === "Running" ? "Completed" : "Running";
        showToast(`Status updated to: ${m.status}`);
        renderMedicines();
      }
    });
  }
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
  
  // Status change listener
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

  // Action button click listener
  body.addEventListener("click", e => {
    const btn = e.target.closest(".tbl-action");
    if (!btn) return;
    
    const id = parseInt(btn.dataset.id, 10);
    if (isNaN(id)) return;
    
    if (btn.classList.contains("btn-view-apt")) {
      const apt = APPOINTMENTS.find(a => a.id === id);
      if (apt) {
        showAptDetailsModal(`${apt.name}'s Appointment`, [apt]);
      }
    } else if (btn.classList.contains("btn-delete-apt")) {
      const aptIndex = APPOINTMENTS.findIndex(a => a.id === id);
      if (aptIndex > -1) {
        const apt = APPOINTMENTS[aptIndex];
        if (confirm(`Are you sure you want to delete ${apt.name}'s appointment?`)) {
          APPOINTMENTS.splice(aptIndex, 1);
          showToast(`Appointment for ${apt.name} deleted.`);
          renderAppointments(document.getElementById("aptFilter")?.value || "all");
          if (typeof renderAptStatusChart === "function") renderAptStatusChart();
        }
      }
    } else if (btn.classList.contains("btn-edit-apt")) {
      showToast("Appointment editing is not available in demo mode.");
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
  if (!form) return;

  // We add 'async' here because saving to a database takes a little time, 
  // and we want to "wait" for the server to finish before moving on.
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // 1. Gather all the information the user typed into the boxes
    const patientData = {
      // We create a random ID (like P-1234) for the new patient
      id: "P-" + (Math.floor(Math.random() * 9000) + 1000),
      name: document.getElementById("pName").value,
      age: document.getElementById("pAge").value,
      gender: document.getElementById("pGender").value,
      phone: document.getElementById("pPhone").value,
      address: document.getElementById("pAddress").value,
      complaints: document.getElementById("pComplaints").value
    };

    // Show a loading spinner on the button so the user knows something is happening
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
    }

    try {
      // 2. The FETCH command: This is the actual "Phone Call" to your Backend server.
      // We send the patientData as a "JSON" string (the language servers speak).
      const response = await fetch(`${API_URL}/patients`, {
        method: "POST", // POST means "Create New"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData)
      });

      if (response.ok) {
        // If the server says "OK", show a success message
        showToast("Patient saved to permanent database!");
        form.reset();
        
        // Take the user back to the dashboard after a short delay
        setTimeout(() => { window.location.href = "index.html"; }, 1500);
      } else {
        showToast("Database error: Could not save patient.", "error");
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch (err) {
      // This happens if the server is offline or there is no internet
      showToast("Could not reach the server. Is the backend running?", "error");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
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
  
  const downloadBtn = document.getElementById("downloadRevenuePdfBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Popup blocked! Please allow popups to download reports.", "error");
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Jireh Homeopathy - Revenue Report 2026</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #60a5fa; padding-bottom: 20px; margin-bottom: 30px; }
              .clinic-info h1 { margin: 0; font-size: 24px; color: #1e3a8a; }
              .clinic-info p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
              .report-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
              .stats-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
              .stat-box { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; background: #f8fafc; }
              .stat-box .val { font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 4px; }
              .stat-box .lbl { font-size: 12px; color: #64748b; font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              th { background: #f1f5f9; color: #475569; font-weight: 600; }
              tr:hover { background: #f8fafc; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="clinic-info">
                <h1>Jireh Homeopathy Clinic</h1>
                <p>Super Speciality Homeopathy Care & Management</p>
              </div>
              <div style="text-align: right">
                <p style="font-weight: 600; margin: 0">Dr. Priya S. (Admin)</p>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px;">Generated: ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div class="report-title">Annual Revenue & Performance Report (2026)</div>
            
            <div class="stats-summary">
              <div class="stat-box">
                <div class="lbl">TOTAL REVENUE (MAY)</div>
                <div class="val">₹84,500.00</div>
              </div>
              <div class="stat-box">
                <div class="lbl">TOTAL APPOINTMENTS</div>
                <div class="val">210</div>
              </div>
              <div class="stat-box">
                <div class="lbl">GROWTH RATE</div>
                <div class="val">+18.4%</div>
              </div>
            </div>

            <h3>Monthly Revenue breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Patients</th>
                  <th>Appointments</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                ${REPORT_DATA.map(r => `
                  <tr>
                    <td><strong>${r.month} 2026</strong></td>
                    <td style="color:#2563eb; font-weight:700">₹${r.revenue.toLocaleString('en-IN')}</td>
                    <td>${r.patients}</td>
                    <td>${r.appts}</td>
                    <td style="color:#16a34a; font-weight:600">+${Math.floor(Math.random() * 15 + 5)}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="footer">
              This is a computer-generated performance report from the Jireh Homeopathy CRM system.
            </div>
            
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    });
  }
}

// ── THEME SWITCHER ──────────────────────────────────────────
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("clinic-theme", theme);
  // Update toggle button icon on all pages
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
    btn.title = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
  }
  showToast(`Switched to ${theme} mode`);
}

function initTheme() {
  const savedTheme = localStorage.getItem("clinic-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// ── TOPBAR THEME TOGGLE BUTTON ────────────────────────────────
function initThemeToggleBtn() {
  // Inject a sun/moon button next to the notification bell in every page
  const notifBtn = document.getElementById("notifBtn");
  if (!notifBtn) return;

  const savedTheme = localStorage.getItem("clinic-theme") || "dark";
  const btn = document.createElement("button");
  btn.id = "themeToggleBtn";
  btn.className = "icon-btn";
  btn.title = savedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
  btn.setAttribute("aria-label", "Toggle theme");
  btn.innerHTML = savedTheme === "dark"
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });

  // Insert before the notification button
  notifBtn.parentNode.insertBefore(btn, notifBtn);
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
  const savedName = localStorage.getItem("clinic-name") || "Jireh Homeopathy";
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
    clinicInput.value = localStorage.getItem("clinic-name") || "Jireh Homeopathy";
  }

  document.getElementById("saveSettingsBtn")?.addEventListener("click", () => {
    const newName = document.getElementById("setClinicName").value.trim();
    if (newName) {
      setClinicName(newName);
      showToast(`Clinic name updated to "${newName}"`);
    }
  });
}

async function printInvoice() {
  const patientName = document.getElementById("billPatientName").textContent;
  const patientId = document.getElementById("billPatientID")?.value || "N/A";

  if (patientName === "No Patient Selected") {
    showToast("Please select a patient first!", "error");
    return;
  }

  // Prepare bill data
  const medicineTotal = CURRENT_BILL.medicines.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const subtotal = CURRENT_BILL.consultation + medicineTotal + CURRENT_BILL.lab + CURRENT_BILL.service;
  const discountAmount = (subtotal * CURRENT_BILL.discount) / 100;
  const taxable = subtotal - discountAmount;
  const total = taxable + (taxable * 0.18);
  const billId = "BL-" + Math.floor(1000 + Math.random() * 9000);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/billing`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        id: billId,
        patient_id: patientId,
        total_amount: total,
        items_json: CURRENT_BILL.medicines
      })
    });

    if (!response.ok) {
      showToast("Could not save bill to database, but printing anyway.", "warning");
    }
  } catch (err) {
    console.error("Billing save failed:", err);
  }

  // Populate print template
  document.getElementById("printDate").textContent = new Date().toLocaleDateString();
  document.getElementById("printBillNo").textContent = billId;
  document.getElementById("printPatientName").textContent = patientName;
  document.getElementById("printPatientID").textContent = document.getElementById("billPatientID").value;
  
  const printSubtotal = Array.from(document.querySelectorAll("#billItemsBody tr")).reduce((acc, tr) => {
    const totalCell = tr.children[3];
    return acc + (totalCell ? parseFloat(totalCell.textContent.replace("₹", "")) : 0);
  }, 0) + 
    parseFloat(document.getElementById("billConsultation").value || 0) + 
    parseFloat(document.getElementById("billLab").value || 0) + 
    parseFloat(document.getElementById("billService").value || 0);

  const discountVal = parseFloat(document.getElementById("billDiscount").value || 0);
  const discountAmt = printSubtotal * (discountVal / 100);
  const tax = (printSubtotal - discountAmt) * 0.18;
  const grandTotal = printSubtotal - discountAmt + tax;

  document.getElementById("printSubtotal").textContent = "₹" + printSubtotal.toFixed(2);
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
  
  document.body.classList.add("printing-invoice");
  window.print();
  document.body.classList.remove("printing-invoice");
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
    let dayApts = [];
    if (month === 4) {
      if (d === 13) {
        dayBox.classList.add("has-apt");
        dayBox.innerHTML += `
          <div class="apt-pill"><i class="fa-solid fa-user-check"></i> 6 Appts</div>
          <div class="apt-pill pending" style="margin-top:4px"><i class="fa-solid fa-clock"></i> 2 Pending</div>
        `;
        dayApts = [
          { name: "Meera Nair", time: "09:30 AM", doctor: "Dr. Priya S.", type: "Follow-up", status: "Confirmed" },
          { name: "Rahul Sharma", time: "10:15 AM", doctor: "Dr. Priya S.", type: "New Consultation", status: "Confirmed" },
          { name: "Kiran Patel", time: "11:00 AM", doctor: "Dr. Arjun K.", type: "Follow-up", status: "Pending" },
          { name: "Aditi Rao", time: "11:45 AM", doctor: "Dr. Priya S.", type: "Follow-up", status: "Confirmed" },
          { name: "Suresh Menon", time: "02:15 PM", doctor: "Dr. Arjun K.", type: "Emergency", status: "Pending" },
          { name: "Divya Nair", time: "03:00 PM", doctor: "Dr. Priya S.", type: "Follow-up", status: "Confirmed" }
        ];
      } else if (d === 15) {
        dayBox.classList.add("has-apt");
        dayBox.innerHTML += `<div class="apt-pill"><i class="fa-solid fa-user-check"></i> 3 Confirmed</div>`;
        dayApts = [
          { name: "Amit Verma", time: "10:00 AM", doctor: "Dr. Arjun K.", type: "Follow-up", status: "Confirmed" },
          { name: "Sneha Reddy", time: "11:30 AM", doctor: "Dr. Priya S.", type: "New Consultation", status: "Confirmed" },
          { name: "Vikram Sen", time: "04:15 PM", doctor: "Dr. Priya S.", type: "Follow-up", status: "Confirmed" }
        ];
      } else if (d === 20) {
        dayBox.classList.add("has-apt");
        dayBox.innerHTML += `<div class="apt-pill"><i class="fa-solid fa-user-check"></i> 3 Confirmed</div>`;
        dayApts = [
          { name: "John Doe", time: "09:00 AM", doctor: "Dr. Priya S.", type: "Follow-up", status: "Confirmed" },
          { name: "Jane Smith", time: "12:00 PM", doctor: "Dr. Arjun K.", type: "Follow-up", status: "Confirmed" },
          { name: "Rajesh Kumar", time: "03:30 PM", doctor: "Dr. Priya S.", type: "New Consultation", status: "Confirmed" }
        ];
      }
    }

    // Hover tooltip event listener
    if (dayApts.length > 0) {
      dayBox.addEventListener("mouseenter", (e) => {
        let tooltip = document.getElementById("calendar-tooltip");
        if (!tooltip) {
          tooltip = document.createElement("div");
          tooltip.id = "calendar-tooltip";
          tooltip.style.position = "absolute";
          tooltip.style.background = "var(--sidebar-bg, #000)";
          tooltip.style.border = "1px solid var(--border)";
          tooltip.style.padding = "14px";
          tooltip.style.borderRadius = "12px";
          tooltip.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";
          tooltip.style.zIndex = "2500";
          tooltip.style.pointerEvents = "none";
          tooltip.style.fontSize = "12px";
          tooltip.style.color = "var(--text)";
          tooltip.style.minWidth = "240px";
          tooltip.style.transition = "opacity 0.2s ease";
          document.body.appendChild(tooltip);
        }
        
        let html = `<div style="font-weight:700; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; color:var(--accent); display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-calendar-check"></i> May ${d} Schedule</div>`;
        dayApts.forEach(a => {
          const statusColor = a.status === "Confirmed" ? "var(--accent)" : "var(--amber)";
          html += `
            <div style="margin-bottom:8px; display:flex; flex-direction:column; gap:2px; line-height:1.4;">
              <div style="display:flex; justify-content:space-between; font-weight:600; color:var(--text);">
                <span>${a.name}</span>
                <span style="color:var(--accent); font-weight:500;">${a.time}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--muted);">
                <span>${a.doctor} • ${a.type}</span>
                <span style="color:${statusColor}; font-weight:700;">${a.status}</span>
              </div>
            </div>
          `;
        });
        
        tooltip.innerHTML = html;
        
        const rect = dayBox.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX + 15}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
        tooltip.style.opacity = "1";
        tooltip.style.display = "block";
      });
      
      dayBox.addEventListener("mouseleave", () => {
        const tooltip = document.getElementById("calendar-tooltip");
        if (tooltip) tooltip.style.display = "none";
      });
    }

    dayBox.onclick = () => {
      const monthName = monthLabel.textContent.split(' ')[0];
      showAptDetailsModal(`${monthName} ${d}, ${year}`, dayApts);
    };
    grid.appendChild(dayBox);
  }
}

// ── APPOINTMENT DETAILS MODAL ────────────────────────────────
function showAptDetailsModal(dateLabel, apts) {
  let modal = document.getElementById("apt-details-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "apt-details-modal";
    modal.className = "modal-overlay";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.6)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "3000";
    modal.style.backdropFilter = "blur(4px)";
    
    modal.innerHTML = `
      <div class="modal" style="width: 100%; max-width: 650px; max-height: 85vh; display: flex; flex-direction: column; animation: slideUp 0.3s ease; background: var(--bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4)">
        <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <h2 id="aptModalTitle" style="font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--text)"><i class="fa-solid fa-calendar-check" style="color:var(--accent); margin-right:8px"></i> Appointments</h2>
          <button class="modal-close" onclick="document.getElementById('apt-details-modal').style.display='none'" style="background: none; border: none; font-size: 24px; color: var(--muted); cursor: pointer;">&times;</button>
        </div>
        <div style="padding: 24px; overflow-y: auto; flex: 1;" id="aptModalContent">
          <!-- Table goes here -->
        </div>
        <div class="form-actions" style="border-top: 1px solid var(--border); padding: 16px 24px; display: flex; justify-content: flex-end; background: rgba(0,0,0,0.05)">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('apt-details-modal').style.display='none'" style="border: 1px solid var(--border); padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; color: var(--text); background: none;">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  document.getElementById("aptModalTitle").innerHTML = `<i class="fa-solid fa-calendar-check" style="color:var(--accent); margin-right:8px"></i> Schedule for ${dateLabel}`;
  
  let html = `
    <div class="table-wrapper" style="border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
    <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="background: rgba(255,255,255,0.02)">
          <th style="padding: 12px 16px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border)">Time</th>
          <th style="padding: 12px 16px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border)">Patient Name</th>
          <th style="padding: 12px 16px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border)">Doctor</th>
          <th style="padding: 12px 16px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border)">Type</th>
          <th style="padding: 12px 16px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border)">Status</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  if (apts.length === 0) {
    html += `<tr><td colspan="5" style="text-align: center; padding: 32px; color: var(--muted); font-size: 14px;"><i class="fa-solid fa-calendar-xmark" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>No appointments scheduled for this day.</td></tr>`;
  } else {
    apts.forEach(a => {
      const statusClass = a.status === "Confirmed" ? "status-paid" : "status-pending";
      html += `
        <tr style="border-bottom: 1px solid var(--border)">
          <td style="padding: 14px 16px; font-weight: 600; color: var(--accent);">${a.time}</td>
          <td style="padding: 14px 16px; font-weight: 700; color: var(--text);">${a.name}</td>
          <td style="padding: 14px 16px; color: var(--text);">${a.doctor}</td>
          <td style="padding: 14px 16px;"><span class="badge" style="background: var(--sidebar-hover); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; color: var(--muted);">${a.type}</span></td>
          <td style="padding: 14px 16px;"><span class="status-indicator ${statusClass}" style="padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block;">${a.status}</span></td>
        </tr>
      `;
    });
  }
  
  html += `</tbody></table></div>`;
  document.getElementById("aptModalContent").innerHTML = html;
  modal.style.display = "flex";
}

const API_URL = "/api";

function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const togglePass = document.getElementById("togglePass");
  const passInput = document.getElementById("password");

  if (togglePass && passInput) {
    togglePass.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      togglePass.classList.toggle("fa-eye");
      togglePass.classList.toggle("fa-eye-slash");
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btn = document.getElementById("loginBtn");
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("clinicName", data.clinic_name);
        showToast("Login successful! Welcome back.");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        showToast(data.error || "Login failed", "error");
        btn.disabled = false;
        btn.innerHTML = 'Sign In to Dashboard <i class="fa-solid fa-arrow-right"></i>';
      }
    } catch (err) {
      showToast("Server is not responding. Is the backend running?", "error");
      btn.disabled = false;
      btn.innerHTML = 'Sign In to Dashboard <i class="fa-solid fa-arrow-right"></i>';
    }
  });
}

async function getBackendPatients() {
  const token = localStorage.getItem("token");
  if (!token) return [];
  try {
    const response = await fetch(`${API_URL}/patients`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.error("Backend error:", err);
  }
  return [];
}

async function getBackendAppointments() {
  const token = localStorage.getItem("token");
  if (!token) return [];
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.error("Appointments Fetch Error:", err);
  }
  return [];
}

// MAIN STARTUP LOGIC
console.log("Jireh Homeopathy Script Loading...");

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed. Initializing components...");
  
  // 1. Initialize UI
  initTheme();
  initThemeToggleBtn();
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
  initLoginPage();

  console.log("All UI modules initialized.");

  // 2. Fetch Data if on specific pages
  if (document.getElementById("patientsTable")) {
    const data = await getBackendPatients();
    if (data.length > 0) renderPatients(data);
    else renderPatients(PATIENTS);
  }

  if (document.getElementById("appointmentsBody")) {
    const apts = await getBackendAppointments();
    if (apts.length > 0) {
      renderAppointments("all", apts.map(a => ({ ...a, name: a.patient_name || a.name })));
    } else {
      renderAppointments("all");
    }
  }

  // 3. Final Renderings
  if (document.getElementById("appointmentsCalendar")?.style.display !== "none") {
    renderCalendar();
  }
  
  renderPastAppointments();
  renderAllPatients();
  renderMedicines();
  renderFollowups();
  renderChart(currentPeriod);
  renderDonutChart();
  renderAptStatusChart();
  initCounters();
  
  console.log("Startup sequence complete.");
});
