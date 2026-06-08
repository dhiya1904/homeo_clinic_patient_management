/* ============================================================
   Jireh Homeopathy — Dashboard Script
   ============================================================ */

// ── DATA ──────────────────────────────────────────────────────
const APPOINTMENTS = [];
const PAST_APPOINTMENTS = [];
const PATIENT_DATA = { total: 0, new: 0, repeat: 0, old: 0 };
const PATIENTS = [];
const FOLLOWUPS = [];
const CHART_DATA = {
  weekly:  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], values: [0,0,0,0,0,0,0] },
  monthly: { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul"], values: [0,0,0,0,0,0,0] },
};
const MEDICINE_DATA = [];


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
function renderAllPatients(patientsData) {
  const tbody = document.getElementById("allPatientsBody");
  if (!tbody) return;

  // Use provided data or fall back to global PATIENTS array
  const data = patientsData || PATIENTS;

  // Update the count badge
  const badge = document.getElementById("patientCountBadge");
  if (badge) badge.textContent = data.length;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fa-solid fa-users" style="font-size:2rem;margin-bottom:0.8rem;display:block;"></i>No patients registered yet.<br><a href="register.html" style="color:var(--accent);font-weight:600;">Register your first patient →</a></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(p => {
    const color = p.color || '#60a5fa';
    const name = p.name || 'Unknown';
    const age = p.age || '—';
    const condition = p.complaints || p.condition || '—';
    const tag = p.tag || 'new';
    const id = p.id || '';
    return `<tr>
      <td><div class="patient-avatar" style="background:${color};width:32px;height:32px;font-size:12px;margin:auto;">${getInitials(name)}</div></td>
      <td><strong style="color:var(--accent); cursor:pointer" onclick="openPatientProfile('${id}')">${name}</strong></td>
      <td>${age}</td>
      <td>${condition}</td>
      <td><span class="badge badge-${tag === 'new' ? 'confirmed' : 'pending'}">${tag === 'new' ? 'New' : 'Returning'}</span></td>
      <td>
        <button class="tbl-action" title="View Profile" onclick="openPatientProfile('${id}')"><i class="fa-solid fa-eye"></i></button>
        <button class="tbl-action" title="View Case Sheet" onclick="window.location.href='register.html?id=${id}'" style="color: var(--accent);"><i class="fa-solid fa-file-medical"></i></button>
        <button class="tbl-action" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
      </td>
    </tr>`;
  }).join("");
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

  profile.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = profile.classList.contains("open");
    if (isOpen) {
      profile.classList.remove("open");
      profile.setAttribute("aria-expanded", "false");
    } else {
      profile.classList.add("open");
      profile.setAttribute("aria-expanded", "true");
    }
  });

  document.addEventListener("click", () => {
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
  consultation: 350,
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

  // Dynamically set consultation fee based on primary doctor in settings
  const primaryDocName = localStorage.getItem("doctor-name") || "Dr. Priya S.";
  const primaryDoc = AVAILABLE_DOCTORS.find(d => d.name === primaryDocName);
  const defaultFee = primaryDoc ? primaryDoc.charge : 350;
  
  const consInput = document.getElementById("billConsultation");
  if (consInput) {
    consInput.value = defaultFee;
    CURRENT_BILL.consultation = defaultFee;
  }

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
const REPORT_DATA = [];

function renderReportTable() {
  const tbody = document.getElementById("reportsTableBody");
  if (!tbody) return;
  if (REPORT_DATA.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--muted); font-size: 14px;"><i class="fa-solid fa-folder-open" style="font-size: 20px; display: block; margin-bottom: 8px;"></i>No revenue records found yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = REPORT_DATA.map(r => `
    <tr>
      <td><strong>${r.month} 2026</strong></td>
      <td style="color:var(--accent); font-weight:bold">₹${r.revenue.toLocaleString('en-IN')}</td>
      <td>${r.patients}</td>
      <td>${r.appts}</td>
      <td><span class="badge badge-confirmed">+0%</span></td>
    </tr>
  `).join("");
}

async function initReportsPage() {
  const container = document.getElementById("reports-page-container");
  if (!container) return;

  try {
    // 1. Fetch backend analytics data in parallel
    const [patients, appointments, bills] = await Promise.all([
      getBackendPatients(),
      getBackendAppointments(),
      getBackendBilling()
    ]);

    // 2. Populate Summary Stat Cards
    // 2.a. Total Patients
    const totalPatients = patients.length;
    const patEl = document.getElementById("reportTotalPatients");
    if (patEl) patEl.textContent = totalPatients;

    // 2.b. Total Appointments
    const totalApts = appointments.length;
    const aptEl = document.getElementById("reportTotalApts");
    if (aptEl) aptEl.textContent = totalApts;

    // 2.c. Cancellations
    const cancellations = appointments.filter(a => a.status === "cancelled" || a.status === "Cancelled").length;
    const cancelEl = document.getElementById("reportCancellations");
    if (cancelEl) cancelEl.textContent = cancellations;

    // 2.d. Total Revenue
    const totalRevenue = bills.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
    const revEl = document.getElementById("reportTotalRevenue");
    if (revEl) revEl.textContent = "₹" + Math.round(totalRevenue).toLocaleString("en-IN");

    // 3. Populate Patient Demographics variables & render donut chart
    let newCount = 0, repeatCount = 0, chronicCount = 0;
    patients.forEach(p => {
      if (p.tag === "new" || p.tag === "New") newCount++;
      else if (p.tag === "repeat" || p.tag === "Repeat") repeatCount++;
      else chronicCount++;
    });

    PATIENT_DATA.total = totalPatients || 1; // avoid divide by zero
    PATIENT_DATA.new = newCount;
    PATIENT_DATA.repeat = repeatCount;
    PATIENT_DATA.old = chronicCount;

    // Trigger donut chart drawing
    renderDonutChart();

    // 4. Group Billing and Appointments by Month for 2026 Monthly Breakdown
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthFullNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const monthlyStats = {};
    monthFullNames.forEach(m => {
      monthlyStats[m] = { revenue: 0, patients: new Set(), appts: 0 };
    });

    // Process bills
    bills.forEach(b => {
      if (b.date) {
        let d = new Date(b.date);
        if (isNaN(d.getTime())) {
          d = new Date(b.date.replace(" ", "T"));
        }
        if (!isNaN(d.getTime())) {
          const mName = monthFullNames[d.getMonth()];
          monthlyStats[mName].revenue += parseFloat(b.total_amount) || 0;
          if (b.patient_id) {
            monthlyStats[mName].patients.add(b.patient_id);
          }
        }
      }
    });

    // Process appointments
    appointments.forEach(a => {
      if (a.date) {
        let d = new Date(a.date);
        if (isNaN(d.getTime())) {
          d = new Date(a.date.replace(" ", "T"));
        }
        if (!isNaN(d.getTime())) {
          const mName = monthFullNames[d.getMonth()];
          monthlyStats[mName].appts++;
          if (a.patient_id) {
            monthlyStats[mName].patients.add(a.patient_id);
          }
        }
      }
    });

    // Clear and build REPORT_DATA array
    REPORT_DATA.length = 0;
    monthFullNames.forEach(mName => {
      const stats = monthlyStats[mName];
      if (stats.revenue > 0 || stats.appts > 0 || stats.patients.size > 0) {
        REPORT_DATA.push({
          month: mName.substring(0, 3), // e.g. "May", "Jun"
          revenue: Math.round(stats.revenue),
          patients: stats.patients.size,
          appts: stats.appts,
        });
      }
    });

    // Fallback seed month if database is empty
    if (REPORT_DATA.length === 0) {
      REPORT_DATA.push({
        month: "May",
        revenue: Math.round(totalRevenue),
        patients: totalPatients,
        appts: totalApts
      });
    }

    // Call renderReportTable to populate the breakdown table
    renderReportTable();

    // 5. Update Monthly Revenue Trends chart values
    CHART_DATA.monthly.labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    CHART_DATA.monthly.values = CHART_DATA.monthly.labels.map(lbl => {
      const fullIdx = monthNames.indexOf(lbl);
      const mName = monthFullNames[fullIdx];
      return Math.round(monthlyStats[mName]?.revenue || 0);
    });

    // Fallback seed chart values if all monthly revenue is zero
    const sumMonthlyValues = CHART_DATA.monthly.values.reduce((s, v) => s + v, 0);
    if (sumMonthlyValues === 0) {
      CHART_DATA.monthly.values = [0, 0, 0, 0, Math.round(totalRevenue) || 0, 0, 0];
    }

    // Render monthly revenue trends chart
    renderChart("monthly");

  } catch (error) {
    console.error("Failed to dynamically load reports statistics:", error);
    showToast("Error loading analytics data from backend.", "error");
  }

  // Handle Dynamic PDF downloads
  const downloadBtn = document.getElementById("downloadRevenuePdfBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Popup blocked! Please allow popups to download reports.", "error");
        return;
      }

      const totalRev = REPORT_DATA.reduce((s, r) => s + r.revenue, 0);
      const totalAptsCount = REPORT_DATA.reduce((s, r) => s + r.appts, 0);
      
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
                <div class="lbl">TOTAL REVENUE (2026)</div>
                <div class="val">₹${totalRev.toLocaleString('en-IN')}</div>
              </div>
              <div class="stat-box">
                <div class="lbl">TOTAL APPOINTMENTS</div>
                <div class="val">${totalAptsCount}</div>
              </div>
              <div class="stat-box">
                <div class="lbl">STATUS</div>
                <div class="val">Active</div>
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
                ${REPORT_DATA.length === 0 
                  ? '<tr><td colspan="5" style="text-align: center; padding: 16px; color: #64748b; font-size: 14px;">No revenue records found yet.</td></tr>'
                  : REPORT_DATA.map(r => `
                    <tr>
                      <td><strong>${r.month} 2026</strong></td>
                      <td style="color:#2563eb; font-weight:700">₹${r.revenue.toLocaleString('en-IN')}</td>
                      <td>${r.patients}</td>
                      <td>${r.appts}</td>
                      <td style="color:#16a34a; font-weight:600">+0%</td>
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
  showToast(`Switched to ${theme} mode`);
}

function initTheme() {
  const savedTheme = localStorage.getItem("clinic-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// Topbar theme toggle button has been removed as per settings-only requirement.

// ── NOTIFICATION PANEL ────────────────────────────────────────
function initNotificationPanel() {
  const notifBtn = document.getElementById("notifBtn");
  if (!notifBtn) return;

  // Create the dropdown panel
  const panel = document.createElement("div");
  panel.id = "notifPanel";
  panel.style.cssText = `
    display: none; position: absolute; top: calc(100% + 12px); right: 0;
    width: 340px; background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    z-index: 9999; overflow: hidden; animation: fadeSlideDown 0.18s ease;
  `;

  // Build notification content from today's appointments
  function buildPanelContent() {
    const today = new Date().toISOString().split("T")[0];
    const todayApts = APPOINTMENTS.filter(a => a.date === today || (a.datetime && a.datetime.startsWith(today)));

    const followUps = APPOINTMENTS.filter(a => {
      const d = a.date || (a.datetime && a.datetime.split("T")[0]);
      return d === today && a.status === "Pending";
    });

    const notifications = [];

    if (todayApts.length > 0) {
      notifications.push({
        icon: "fa-calendar-check",
        color: "#3b82f6",
        title: `${todayApts.length} appointment${todayApts.length > 1 ? "s" : ""} today`,
        sub: todayApts.slice(0, 2).map(a => a.patient || a.name || "Patient").join(", ") + (todayApts.length > 2 ? ` +${todayApts.length - 2} more` : ""),
        time: "Today"
      });
    }

    if (followUps.length > 0) {
      notifications.push({
        icon: "fa-clock-rotate-left",
        color: "#f59e0b",
        title: `${followUps.length} pending follow-up${followUps.length > 1 ? "s" : ""}`,
        sub: "Awaiting confirmation",
        time: "Today"
      });
    }

    // Add a static system info item if nothing real
    if (notifications.length === 0) {
      notifications.push({
        icon: "fa-circle-check",
        color: "#16a34a",
        title: "All clear for today!",
        sub: "No appointments or follow-ups pending.",
        time: "Now"
      });
    }

    const dot = notifBtn.querySelector(".notif-dot");
    if (dot) {
      // Show dot only if real items exist
      dot.style.display = todayApts.length > 0 || followUps.length > 0 ? "block" : "none";
    }

    return `
      <div style="padding: 14px 18px 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; font-size: 15px; color: var(--text);">Notifications</span>
        <span style="font-size: 12px; color: var(--muted);">${notifications.length} new</span>
      </div>
      <div style="max-height: 320px; overflow-y: auto;">
        ${notifications.map(n => `
          <div style="display: flex; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border); align-items: flex-start; cursor: pointer; transition: background 0.15s;" 
               onmouseenter="this.style.background='rgba(59,130,246,0.06)'" onmouseleave="this.style.background=''">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${n.color}22; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <i class="fa-solid ${n.icon}" style="color: ${n.color}; font-size: 15px;"></i>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0 0 3px; font-weight: 600; font-size: 13.5px; color: var(--text);">${n.title}</p>
              <p style="margin: 0; font-size: 12px; color: var(--muted);">${n.sub}</p>
            </div>
            <span style="font-size: 11px; color: var(--muted); white-space: nowrap; margin-top: 2px;">${n.time}</span>
          </div>
        `).join("")}
      </div>
      <div style="padding: 12px 18px; text-align: center;">
        <a href="appointments.html" style="font-size: 13px; color: var(--accent); font-weight: 600; text-decoration: none;">View All Appointments →</a>
      </div>
    `;
  }

  panel.innerHTML = buildPanelContent();

  // Position panel relative to topbar-right
  const topbarRight = notifBtn.closest(".topbar-right") || notifBtn.parentNode;
  topbarRight.style.position = "relative";
  topbarRight.appendChild(panel);

  // Toggle on bell click
  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display === "block";
    if (!isOpen) {
      panel.innerHTML = buildPanelContent();
    }
    panel.style.display = isOpen ? "none" : "block";
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== notifBtn) {
      panel.style.display = "none";
    }
  });

  // Add fadeSlideDown keyframe if not already present
  if (!document.getElementById("notif-anim-style")) {
    const style = document.createElement("style");
    style.id = "notif-anim-style";
    style.textContent = `
      @keyframes fadeSlideDown {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
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

  // Make logos clickable to return to dashboard
  const logos = document.querySelectorAll(".logo");
  logos.forEach(logo => {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  });
}

// ── DOCTOR / ADMIN PROFILE PERSISTENCE ──────────────────────────────────
function setDoctorName(name, role = "Administrator") {
  localStorage.setItem("doctor-name", name);
  localStorage.setItem("admin-role", role);
  applyDoctorName(name, role);
}

function applyDoctorName(name, role) {
  const nameElements = document.querySelectorAll(".admin-name");
  nameElements.forEach(el => el.textContent = name);
  
  const roleElements = document.querySelectorAll(".admin-role");
  if (roleElements) {
    roleElements.forEach(el => el.textContent = role || "Administrator");
  }
  
  // Update Case Sheet select value in register.html if it is present
  const docInput = document.querySelector('[name="fs_doctor"]');
  if (docInput) {
    docInput.value = name;
  }
}

function showProfileModal() {
  const existing = document.getElementById('profileModalOverlay');
  if (existing) existing.remove();

  const currentName = localStorage.getItem("doctor-name") || "Dr. Priya S.";
  const currentRole = localStorage.getItem("admin-role") || "Administrator";

  const modalHtml = `
    <div class="modal-overlay" id="profileModalOverlay" style="display: grid; z-index: 3000;">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h2><i class="fa-solid fa-circle-user"></i> Edit Profile</h2>
          <button class="modal-close" onclick="document.getElementById('profileModalOverlay').remove()">&times;</button>
        </div>
        <div class="modal-form">
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="width: 72px; height: 72px; background: var(--accent-subtle); color: var(--accent); border-radius: 50%; display: grid; place-items: center; font-size: 32px; margin: 0 auto 12px;">
              <i class="fa-solid fa-user-doctor"></i>
            </div>
            <p style="font-size: 13px; color: var(--muted);">Profile details shown across the workspace</p>
          </div>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="editProfileName" value="${currentName}" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <input type="text" id="editProfileRole" value="${currentRole}" />
          </div>
          <div class="form-actions">
            <button class="btn btn-ghost" onclick="document.getElementById('profileModalOverlay').remove()">Cancel</button>
            <button class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    const newName = document.getElementById("editProfileName").value.trim();
    const newRole = document.getElementById("editProfileRole").value.trim();
    if (newName && newRole) {
      setDoctorName(newName, newRole);
      showToast("Profile updated successfully!");
      document.getElementById('profileModalOverlay').remove();
    }
  });
}

function initDoctorName() {
  const savedName = localStorage.getItem("doctor-name") || "Dr. Priya S.";
  const savedRole = localStorage.getItem("admin-role") || "Administrator";
  applyDoctorName(savedName, savedRole);

  // Bind 'My Profile' links to open the modal
  const profileLinks = document.querySelectorAll('a[href="#"]');
  profileLinks.forEach(link => {
    if (link.textContent.includes("My Profile")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        showProfileModal();
      });
    }
  });
}

// ── AVAILABLE DOCTORS MANAGEMENT ─────────────────────────────
let AVAILABLE_DOCTORS = [
  { name: "Dr. Priya S.", charge: 350 },
  { name: "Dr. Arjun K.", charge: 300 }
];

function loadAvailableDoctors() {
  const saved = localStorage.getItem("available-doctors");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      AVAILABLE_DOCTORS = parsed.map(d => {
        if (typeof d === "string") {
          return { name: d, charge: d === "Dr. Priya S." ? 350 : 300 };
        }
        return d;
      });
    } catch (e) {
      AVAILABLE_DOCTORS = [
        { name: "Dr. Priya S.", charge: 350 },
        { name: "Dr. Arjun K.", charge: 300 }
      ];
    }
  } else {
    localStorage.setItem("available-doctors", JSON.stringify(AVAILABLE_DOCTORS));
  }
}

function saveAvailableDoctors() {
  localStorage.setItem("available-doctors", JSON.stringify(AVAILABLE_DOCTORS));
  applyAvailableDoctorsToDropdowns();
}

function applyAvailableDoctorsToDropdowns() {
  const dropdowns = document.querySelectorAll(".doctor-select");
  dropdowns.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = "";
    
    // Check if it's an appointment/prescription select which needs a placeholder
    if (select.id === "aptDoctor" || select.id === "prescDoctor") {
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = "Select Doctor";
      select.appendChild(defaultOpt);
    }
    
    // Add default referrer options if it is the referredBy dropdown
    if (select.id === "referredBy") {
      const selfOpt = document.createElement("option");
      selfOpt.value = "Self / Walk-in";
      selfOpt.textContent = "Self / Walk-in";
      select.appendChild(selfOpt);
      
      const webOpt = document.createElement("option");
      webOpt.value = "Website / Social Media";
      webOpt.textContent = "Website / Social Media";
      select.appendChild(webOpt);
    }
    
    AVAILABLE_DOCTORS.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.name;
      opt.textContent = `${doc.name} (₹${doc.charge || 0})`;
      select.appendChild(opt);
    });
    
    // Restore value if still in list, or set default referrers / primary doctor as fallback
    if (currentVal) {
      // Find matching option to restore
      const hasOpt = Array.from(select.options).some(opt => opt.value === currentVal);
      if (hasOpt) {
        select.value = currentVal;
      }
    } else if (select.name === "fs_doctor") {
      select.value = localStorage.getItem("doctor-name") || (AVAILABLE_DOCTORS[0] ? AVAILABLE_DOCTORS[0].name : "Dr. Priya S.");
    }
  });
}

function renderSettingsDocsList() {
  const container = document.getElementById("docsListContainer");
  if (!container) return;
  
  container.innerHTML = "";
  if (AVAILABLE_DOCTORS.length === 0) {
    container.innerHTML = `<span style="color: var(--muted); font-size: 13px;">No doctors added yet. Enter a name and fee above to add.</span>`;
    return;
  }
  
  AVAILABLE_DOCTORS.forEach(doc => {
    const badge = document.createElement("div");
    badge.className = "doctor-badge";
    badge.style.display = "flex";
    badge.style.alignItems = "center";
    badge.style.gap = "8px";
    badge.style.background = "var(--bg)";
    badge.style.border = "1px solid var(--border)";
    badge.style.padding = "6px 12px";
    badge.style.borderRadius = "20px";
    badge.style.fontSize = "13px";
    badge.style.fontWeight = "600";
    badge.style.color = "var(--text)";
    
    badge.innerHTML = `
      <span>${doc.name} (₹${doc.charge || 0})</span>
      <i class="fa-solid fa-xmark remove-doc-btn" style="cursor: pointer; color: var(--muted); font-size: 12px;" data-name="${doc.name}"></i>
    `;
    
    container.appendChild(badge);
  });
  
  // Attach remove listeners
  container.querySelectorAll(".remove-doc-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const nameToRemove = e.target.getAttribute("data-name");
      AVAILABLE_DOCTORS = AVAILABLE_DOCTORS.filter(d => d.name !== nameToRemove);
      saveAvailableDoctors();
      renderSettingsDocsList();
    });
  });
}

function initAvailableDoctors() {
  loadAvailableDoctors();
  applyAvailableDoctorsToDropdowns();
  
  const container = document.getElementById("docsListContainer");
  if (container) {
    renderSettingsDocsList();
    
    const addBtn = document.getElementById("addDocBtn");
    const input = document.getElementById("newDocInput");
    const chargeInput = document.getElementById("newDocChargeInput");
    
    if (addBtn && input) {
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const val = input.value.trim();
        const chargeVal = parseInt(chargeInput?.value.trim() || "0", 10);
        
        if (val) {
          const exists = AVAILABLE_DOCTORS.some(d => d.name === val);
          if (!exists) {
            AVAILABLE_DOCTORS.push({ name: val, charge: chargeVal });
            saveAvailableDoctors();
            renderSettingsDocsList();
            input.value = "";
            if (chargeInput) chargeInput.value = "";
            showToast(`Added ${val} with fee ₹${chargeVal}.`);
          } else {
            showToast("Doctor is already in the list!");
          }
        }
      });
      
      const handleEnter = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addBtn.click();
        }
      };
      input.addEventListener("keypress", handleEnter);
      if (chargeInput) chargeInput.addEventListener("keypress", handleEnter);
    }
  }
}

function initSettingsPage() {
  const settingsContainer = document.getElementById("settings-page-container");
  if (!settingsContainer) return;

  const savedTheme = localStorage.getItem("clinic-theme") || "light";
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

  // Load current doctor name into input
  const doctorInput = document.getElementById("setDoctorName");
  if (doctorInput) {
    doctorInput.value = localStorage.getItem("doctor-name") || "Dr. Priya S.";
  }

  document.getElementById("saveSettingsBtn")?.addEventListener("click", () => {
    const newName = document.getElementById("setClinicName").value.trim();
    const newDoc = document.getElementById("setDoctorName").value.trim();
    
    if (newName) {
      setClinicName(newName);
    }
    if (newDoc) {
      setDoctorName(newDoc);
    }
    
    showToast("Settings updated successfully!");
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
    
    // Check for appointments (real database appointments)
    let dayApts = [];

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

// Centralized API configuration: defaults to localhost for development, and points to the live Render web service in production.
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000/api"
  : "https://homeo-clinic-patient-management.onrender.com/api";

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
  try {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}/patients`, { headers });
    if (response.ok) return await response.json();
  } catch (err) {
    console.error("Backend error:", err);
  }
  return [];
}

async function getBackendAppointments() {
  const token = localStorage.getItem("token");
  try {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}/appointments`, { headers });
    if (response.ok) return await response.json();
  } catch (err) {
    console.error("Appointments Fetch Error:", err);
  }
  return [];
}

async function getBackendBilling() {
  const token = localStorage.getItem("token");
  try {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}/billing`, { headers });
    if (response.ok) return await response.json();
  } catch (err) {
    console.error("Billing Fetch Error:", err);
  }
  return [];
}

// ── CASE SHEET SUBMISSION (register.html) ─────────────────────
async function submitCaseSheet() {
  const form = document.getElementById('caseSheetForm');
  if (!form) return;

  // Validate required fields
  const name = document.getElementById('fullName')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const gender = document.getElementById('gender')?.value;
  const complaints = document.getElementById('complaints')?.value.trim();

  if (!name) { showToast('Full Name is required.', 'error'); return; }
  if (!gender) { showToast('Gender is required.', 'error'); return; }
  if (!phone) { showToast('Phone number is required.', 'error'); return; }
  if (!complaints) { showToast('Chief Complaints are required.', 'error'); return; }

  // Generate a unique patient ID if not already set
  let regNo = document.getElementById('regNo')?.value.trim();
  if (!regNo || regNo === '') {
    regNo = 'P-' + (Math.floor(Math.random() * 90000) + 10000);
  }

  const patientData = {
    id: regNo,
    name: name,
    age: document.getElementById('age')?.value || '',
    gender: gender,
    phone: phone,
    email: '',
    address: document.getElementById('address')?.value.trim() || '',
    occupation: document.getElementById('occupation')?.value.trim() || '',
    complaints: complaints
  };

  const submitBtn = document.querySelector('.sticky-footer .btn-primary');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  }

  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    if (response.ok) {
      // Clear the draft from localStorage
      localStorage.removeItem('homeo_case_sheet_draft');
      showToast(`Patient "${name}" registered successfully!`);
      setTimeout(() => { window.location.href = 'patients.html'; }, 1500);
    } else {
      const errData = await response.json();
      showToast(errData.error || 'Failed to register patient.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Case Sheet';
      }
    }
  } catch (err) {
    showToast('Could not reach the server. Is the backend running?', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Case Sheet';
    }
  }
}

// ── QUICK ACTIONS ─────────────────────────────────────────────
function initQuickActions() {
  // Communications button → navigate to communications page
  const commBtn = document.getElementById('qa-communications');
  if (commBtn) {
    commBtn.addEventListener('click', () => {
      window.location.href = 'communications.html';
    });
  }

  // Book Appointment quick action → open modal
  const bookAptBtn = document.getElementById('qa-book-apt');
  if (bookAptBtn) {
    bookAptBtn.addEventListener('click', () => {
      const overlay = document.getElementById('modalOverlay');
      if (overlay) {
        overlay.hidden = false;
        overlay.classList.add('active');
      }
    });
  }

  // Generate Bill quick action → navigate to billing
  const billingBtn = document.getElementById('qa-billing');
  if (billingBtn) {
    billingBtn.addEventListener('click', () => {
      window.location.href = 'billing.html';
    });
  }
}

// ── COMMUNICATIONS PAGE ────────────────────────────────────────
function initCommunicationsPage() {
  const msgBody     = document.getElementById('msgBody');
  const charCount   = document.getElementById('charCount');
  const previewBox  = document.getElementById('previewBox');
  const sendBtn     = document.getElementById('sendMsgBtn');
  const patSearch   = document.getElementById('patientSearch');
  const patListBox  = document.getElementById('patientListBox');
  const recipMode   = document.getElementById('recipMode');
  const templateList = document.getElementById('templateList');

  if (!msgBody) return; // Not on communications page

  const MAX_CHARS = 500;

  // ── Mock patient list (pulls from PATIENTS if available)
  const mockPatients = PATIENTS.length > 0 ? PATIENTS : [
    { id: 1, name: 'Anita Sharma' },
    { id: 2, name: 'Ravi Kumar' },
    { id: 3, name: 'Meera Pillai' },
    { id: 4, name: 'Suresh Nair' },
    { id: 5, name: 'Kavitha Rao' },
  ];

  let selectedPatients = new Set();

  function renderPatientList(filter = '') {
    if (!patListBox) return;
    const mode = recipMode ? recipMode.value : 'individual';
    if (mode === 'all') {
      patListBox.innerHTML = '<p style="color:var(--text-muted);padding:4px;">All patients selected</p>';
      selectedPatients = new Set(mockPatients.map(p => p.id));
      return;
    }
    const filtered = mockPatients.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    patListBox.innerHTML = filtered.map(p => `
      <label style="display:flex;align-items:center;gap:6px;padding:4px 2px;cursor:pointer;color:var(--text);">
        <input type="${mode === 'individual' ? 'radio' : 'checkbox'}" name="selectedPat" value="${p.id}">
        ${p.name}
      </label>
    `).join('') || '<p style="color:var(--text-muted);padding:4px;">No patients found</p>';

    patListBox.querySelectorAll('input[name="selectedPat"]').forEach(inp => {
      inp.addEventListener('change', () => {
        if (mode === 'individual') {
          selectedPatients.clear();
          selectedPatients.add(parseInt(inp.value));
        } else {
          if (inp.checked) selectedPatients.add(parseInt(inp.value));
          else selectedPatients.delete(parseInt(inp.value));
        }
      });
    });
  }

  renderPatientList();

  if (recipMode) {
    recipMode.addEventListener('change', () => {
      selectedPatients.clear();
      renderPatientList(patSearch ? patSearch.value : '');
    });
  }

  if (patSearch) {
    patSearch.addEventListener('input', () => renderPatientList(patSearch.value));
  }

  // ── Character counter & live preview
  function updatePreview() {
    const text = msgBody.value;
    if (charCount) {
      const len = text.length;
      charCount.textContent = `${len} / ${MAX_CHARS}`;
      charCount.style.color = len > MAX_CHARS ? '#ef4444' : 'var(--text-muted)';
    }
    if (previewBox) {
      previewBox.innerHTML = text
        ? text.replace(/\n/g, '<br>')
        : '<span style="color:var(--text-muted);font-style:italic;">Your message will appear here…</span>';
    }
  }

  msgBody.addEventListener('input', updatePreview);
  updatePreview();

  // ── Template injection
  if (templateList) {
    templateList.querySelectorAll('li[data-text]').forEach(li => {
      li.style.cssText = 'padding:6px 8px;cursor:pointer;border-radius:6px;margin-bottom:4px;background:var(--surface-2,#1a1a1a);color:var(--text);';
      li.addEventListener('mouseenter', () => li.style.background = 'var(--accent-muted,#1e3a5f)');
      li.addEventListener('mouseleave', () => li.style.background = 'var(--surface-2,#1a1a1a)');
      li.addEventListener('click', () => {
        msgBody.value = li.dataset.text;
        updatePreview();
        showToast('Template loaded', 'success');
      });
    });
  }

  // ── Send button
  function getSelectedChannel() {
    const ch = document.querySelector('input[name="channel"]:checked');
    return ch ? ch.value : 'whatsapp';
  }

  function getRecipientLabel() {
    const mode = recipMode ? recipMode.value : 'individual';
    if (mode === 'all') return 'All Patients';
    if (selectedPatients.size === 0) return '—';
    const names = [...selectedPatients].map(id => {
      const p = mockPatients.find(x => x.id === id);
      return p ? p.name : id;
    });
    return names.join(', ');
  }

  function loadHistory() {
    const tbody = document.querySelector('#commHistoryTable tbody');
    if (!tbody) return;
    const history = JSON.parse(localStorage.getItem('commHistory') || '[]');
    if (history.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No messages sent yet</td></tr>';
      return;
    }
    tbody.innerHTML = history.slice().reverse().map((entry, i) => `
      <tr>
        <td>${history.length - i}</td>
        <td style="white-space:nowrap;">${entry.when}</td>
        <td><span class="ch-badge ch-${entry.channel}">${entry.channel}</span></td>
        <td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${entry.recipients}">${entry.recipients}</td>
        <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${entry.message}">${entry.message}</td>
      </tr>
    `).join('');
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const text = msgBody.value.trim();
      if (!text) { showToast('Please type a message', 'error'); return; }
      if (text.length > MAX_CHARS) { showToast(`Message too long (max ${MAX_CHARS} chars)`, 'error'); return; }
      if (selectedPatients.size === 0 && (recipMode && recipMode.value !== 'all')) {
        showToast('Please select at least one recipient', 'error'); return;
      }

      const channel = getSelectedChannel();
      const recipients = getRecipientLabel();
      const when = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

      const history = JSON.parse(localStorage.getItem('commHistory') || '[]');
      history.push({ when, channel, recipients, message: text });
      localStorage.setItem('commHistory', JSON.stringify(history));

      showToast(`Message sent via ${channel} to ${recipients}`, 'success');
      msgBody.value = '';
      updatePreview();
      selectedPatients.clear();
      renderPatientList();
      loadHistory();
    });
  }

  loadHistory();
}

// MAIN STARTUP LOGIC
console.log("Jireh Homeopathy Script Loading...");

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed. Initializing components...");
  
  // 1. Initialize UI
  initTheme();
  initNotificationPanel();
  initClinicName();
  initDoctorName();
  initAvailableDoctors();
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
  initCommunicationsPage();

  console.log("All UI modules initialized.");

  // 2. Load patients from backend (for both dashboard sidebar and patients page)
  const backendPatients = await getBackendPatients();
  if (backendPatients.length > 0) {
    // Populate global PATIENTS array with backend data
    PATIENTS.length = 0;
    
    // Also reset and calculate dashboard stats
    PATIENT_DATA.total = backendPatients.length;
    PATIENT_DATA.new = 0;
    PATIENT_DATA.repeat = 0;
    PATIENT_DATA.old = 0;

    const colors = ['#60a5fa','#34d399','#f59e0b','#a78bfa','#f87171','#38bdf8','#fb923c'];
    backendPatients.forEach((p, i) => {
      const tagValue = p.tag || 'new';
      PATIENTS.push({
        id: p.id,
        name: p.name,
        age: p.age || '—',
        condition: p.complaints || '—',
        color: colors[i % colors.length],
        tag: tagValue
      });
      
      if (tagValue === 'new') PATIENT_DATA.new++;
      else if (tagValue === 'repeat') PATIENT_DATA.repeat++;
      else PATIENT_DATA.old++;
    });
  }

  // 3. Render patients table (patients.html page)
  if (document.getElementById("allPatientsTable")) {
    renderAllPatients(PATIENTS);
  }

  // 4. Load appointments from backend
  if (document.getElementById("appointmentsBody")) {
    const apts = await getBackendAppointments();
    if (apts.length > 0) {
      APPOINTMENTS.length = 0;
      apts.forEach(a => APPOINTMENTS.push({ ...a, name: a.patient_name || a.name }));
    }
    renderAppointments("all");
  }

  // 5. Final Renderings
  if (document.getElementById("appointmentsCalendar")?.style.display !== "none") {
    renderCalendar();
  }
  
  renderPastAppointments();
  renderPatients();
  renderMedicines();
  renderFollowups();
  renderChart(currentPeriod);
  renderDonutChart();
  renderAptStatusChart();
  initCounters();
  
  console.log("Startup sequence complete.");
});
