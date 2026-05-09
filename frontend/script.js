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
  { name: "Meera Nair",     age: 34, condition: "Migraine",      tag: "new",  color: "#3b82f6" },
  { name: "Arjun Pillai",   age: 29, condition: "Allergic Rhinitis", tag: "old", color: "#7c3aed" },
  { name: "Divya Menon",    age: 42, condition: "Arthritis",     tag: "old",  color: "#0d9488" },
  { name: "Rahul Thomas",   age: 55, condition: "Hypertension",  tag: "old",  color: "#d97706" },
  { name: "Sreelakshmi V.", age: 28, condition: "Skin Allergy",  tag: "new",  color: "#e11d48" },
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

// ── UTILITIES ─────────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
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
      <td><strong>${p.name}</strong></td>
      <td>${p.age}</td>
      <td>${p.condition}</td>
      <td><span class="badge badge-${p.tag === 'new' ? 'confirmed' : 'pending'}">${p.tag === "new" ? "New" : "Returning"}</span></td>
      <td>
        <button class="tbl-action" title="View"><i class="fa-solid fa-eye"></i></button>
        <button class="tbl-action" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
      </td>
    </tr>`).join("");
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
    const name = document.getElementById("patientName").value.trim();
    const time = document.getElementById("aptTime").value;
    const doctor = document.getElementById("aptDoctor").value;
    const type = document.getElementById("aptType").value;
    if (!name || !time || !doctor || !type) { showToast("Please fill all fields.", "error"); return; }

    APPOINTMENTS.unshift({ id: Date.now(), name, time, doctor, type, status: "pending" });
    renderAppointments(document.getElementById("aptFilter").value);
    overlay.hidden = true;
    form.reset();
    showToast(`Appointment for ${name} booked!`);
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
    if (!q) { renderAppointments(document.getElementById("aptFilter").value); return; }
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
  const map = {
    "qa-new-patient": "Opening new patient registration form…",
    "qa-book-apt":    "Opening appointment booking…",
    "qa-billing":     "Navigating to billing…",
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
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initNav();
  initAdminDropdown();
  initModal();
  initFilter();
  initTableActions();
  initChartTabs();
  initSearch();
  initQuickActions();
  initNewPatientForm();

  const aptFilter = document.getElementById("aptFilter");
  renderAppointments(aptFilter ? aptFilter.value : "all");
  renderPastAppointments();
  renderPatients();
  renderAllPatients();
  renderFollowups();
  renderChart(currentPeriod);
  renderDonutChart();
  renderAptStatusChart();
  initCounters();
});
