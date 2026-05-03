/**
 * GEHU ERP Enhancer — content.js
 * Fetches attendance, calculates bunk slots & classes needed,
 * and injects a polished side-panel into the ERP page.
 */

(function () {
  "use strict";

  // ─── Prevent duplicate injection ─────────────────────────
  if (document.getElementById("erp-enhancer-root")) return;

  // ─── State ───────────────────────────────────────────────
  let subjects = [];
  let currentView = "overview"; // overview | bunk | needed
  let lastUpdated = null;

  // ─── Field normalizer ────────────────────────────────────
  // ERP APIs use varying casing/naming — this handles all variants.
  function normalizeSubject(raw) {
  const att = parseInt(raw.TotalPresent, 10) || 0;
  const tot = parseInt(raw.TotalLecture, 10) || 0;
  const name = raw.Subject || "Unknown Subject";

  const pct = parseFloat(raw.Percentage || 0);
  const status = getStatus(pct);
  const bunks = calculateSafeBunks(att, tot);
  const needed = calculateClassesNeeded(att, tot);

  return { name, attended: att, total: tot, pct, status, bunks, needed };
}

  // ─── API fetch ───────────────────────────────────────────
  async function fetchAttendance() {
    const res = await fetch(
      "https://student.gehu.ac.in/Student/GetSubjectDetailStudentAcademicFromLive",
      {
        method: "POST",
        credentials: "include",
        headers: {
  "x-requested-with": "XMLHttpRequest",
},
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status} — Are you logged in?`);

    const data = await res.json();

    // Parse the nested stringified JSON
    let raw;
    if (typeof data.state === "string") {
      raw = JSON.parse(data.state);
    } else if (Array.isArray(data)) {
      raw = data;
    } else if (Array.isArray(data.data)) {
      raw = data.data;
    } else {
      throw new Error("Unexpected API response format.");
    }

    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error("No attendance records found.");
    }

    return raw.map(normalizeSubject);
  }

  // ─── Status → CSS class mapping ──────────────────────────
  function statusCardClass(s) {
    const m = { "Safe": "card-safe", "OK": "card-ok", "At Risk": "card-risk", "Danger": "card-danger" };
    return m[s.label] || "card-ok";
  }

  function statusBarClass(s) {
    const m = { "Safe": "bar-safe", "OK": "bar-ok", "At Risk": "bar-risk", "Danger": "bar-danger" };
    return m[s.label] || "bar-ok";
  }

  function pctClass(s) {
    const m = { "Safe": "safe", "OK": "ok", "At Risk": "risk", "Danger": "danger" };
    return m[s.label] || "ok";
  }

  // ─── Subject card HTML ───────────────────────────────────
  function renderCard(sub) {
    const barWidth = Math.min(parseFloat(sub.pct), 100);
    const cardCls = statusCardClass(sub.status);
    const barCls = statusBarClass(sub.status);
    const pClass = pctClass(sub.status);

    // Bunk chip
    let bunkChip = "";
    if (currentView !== "needed") {
      if (sub.bunks > 0) {
        bunkChip = `<span class="erp-chip chip-bunk card-bunk-section">
          <span>🟢</span><span>Can bunk <strong>${sub.bunks}</strong> more</span>
        </span>`;
      } else {
        bunkChip = `<span class="erp-chip chip-zero card-bunk-section">
          <span>🚫</span><span>No safe bunks</span>
        </span>`;
      }
    }

    // Needed chip
    let needChip = "";
    if (currentView !== "bunk") {
      if (sub.needed > 0) {
        needChip = `<span class="erp-chip chip-need card-need-section">
          <span>📚</span><span>Need <strong>${sub.needed}</strong> more classes</span>
        </span>`;
      } else {
        needChip = `<span class="erp-chip chip-zero card-need-section">
          <span>✅</span><span>75% achieved</span>
        </span>`;
      }
    }

    return `
    <div class="erp-subject-card ${cardCls}">
      <div class="erp-subject-name">${sub.name}</div>

      <div class="erp-progress-wrap">
        <div class="erp-progress-bar ${barCls}" style="width:${barWidth}%"></div>
        <div class="erp-threshold-marker" title="75% threshold"></div>
      </div>

      <div class="erp-subject-row">
        <span class="erp-attend-info">${sub.attended} / ${sub.total} classes</span>
        <span class="erp-pct ${pClass}">${sub.pct}%</span>
      </div>

      <div class="erp-chips">
        ${bunkChip}
        ${needChip}
      </div>
    </div>`;
  }

  // ─── Summary stats ───────────────────────────────────────
  function renderSummary() {
    if (!subjects.length) return "";
    const avg = (subjects.reduce((a, s) => a + parseFloat(s.pct), 0) / subjects.length).toFixed(1);
    const totalBunks = subjects.reduce((a, s) => a + s.bunks, 0);
    const belowCritical = subjects.filter(s => parseFloat(s.pct) < 75).length;

    const avgClass = parseFloat(avg) >= 90 ? "good" : parseFloat(avg) >= 75 ? "" : "bad";
    const bunkClass = totalBunks > 0 ? "good" : "bad";
    const critClass = belowCritical === 0 ? "good" : "bad";

    return `
    <div class="erp-summary">
      <div class="erp-stat-card">
        <div class="erp-stat-val ${avgClass}">${avg}%</div>
        <div class="erp-stat-label">Avg</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-val ${bunkClass}">${totalBunks}</div>
        <div class="erp-stat-label">Total Bunks</div>
      </div>
      <div class="erp-stat-card">
        <div class="erp-stat-val ${critClass}">${belowCritical}</div>
        <div class="erp-stat-label">Below 75%</div>
      </div>
    </div>`;
  }

  // ─── Full subject list HTML ───────────────────────────────
  function renderSubjectList() {
    if (!subjects.length) return '<div class="erp-error">No subjects found.</div>';

    // For bunk view: sort descending by available bunks
    // For needed view: sort descending by needed
    let sorted = [...subjects];
    if (currentView === "bunk") {
      sorted.sort((a, b) => b.bunks - a.bunks);
    } else if (currentView === "needed") {
      sorted = sorted.filter(s => s.needed > 0).sort((a, b) => b.needed - a.needed);
      if (sorted.length === 0) {
        return `<div class="erp-error" style="background:#0f2a1a;border-color:#1a4d2e;color:#4ade80">
          <div class="erp-error-icon">🎉</div>
          All subjects are above 75%! You're good to go.
        </div>`;
      }
    }

    return sorted.map(renderCard).join("");
  }

  // ─── Section header for bunk/needed views ────────────────
  function renderSectionHeader() {
    if (currentView === "bunk") {
      return `<div class="erp-section-hdr">Sorted by safe bunks available</div>`;
    }
    if (currentView === "needed") {
      return `<div class="erp-section-hdr">Subjects below 75% — classes to attend</div>`;
    }
    return "";
  }

  // ─── Panel content update ─────────────────────────────────
  function updatePanel() {
    const panel = document.getElementById("erp-panel");
    if (!panel) return;

    // Tabs
    document.querySelectorAll(".erp-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.view === currentView);
    });

    // Summary
    const summaryEl = document.getElementById("erp-summary-area");
    if (summaryEl) summaryEl.innerHTML = renderSummary();

    // Body
    const bodyEl = document.getElementById("erp-body-area");
    if (bodyEl) bodyEl.innerHTML = renderSectionHeader() + renderSubjectList();

    // Timestamp
    const ts = document.getElementById("erp-timestamp");
    if (ts && lastUpdated) {
      ts.textContent = lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  // ─── Show loading state ───────────────────────────────────
  function showLoading() {
    const bodyEl = document.getElementById("erp-body-area");
    const summaryEl = document.getElementById("erp-summary-area");
    if (summaryEl) summaryEl.innerHTML = "";
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="erp-loader">
          <div class="erp-spinner"></div>
          <span>Fetching your attendance…</span>
        </div>`;
    }
  }

  // ─── Show error state ─────────────────────────────────────
  function showError(msg) {
    const bodyEl = document.getElementById("erp-body-area");
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="erp-error">
          <div class="erp-error-icon">⚠️</div>
          <strong>Couldn't load attendance</strong><br><br>
          ${msg}<br><br>
          <small>Make sure you're logged into ERP and on an attendance-related page.</small>
        </div>`;
    }
  }

  // ─── Load attendance ──────────────────────────────────────
  async function loadData() {
    const refreshBtn = document.getElementById("erp-refresh-btn");
    if (refreshBtn) refreshBtn.classList.add("spinning");
    showLoading();

    try {
      subjects = await fetchAttendance();
      lastUpdated = new Date();
      updatePanel();
    } catch (err) {
      showError(err.message || String(err));
    } finally {
      if (refreshBtn) refreshBtn.classList.remove("spinning");
    }
  }

  // ─── Build panel HTML ─────────────────────────────────────
  function buildPanel() {
    const panel = document.createElement("div");
    panel.id = "erp-panel";
    panel.dataset.view = "overview";

    panel.innerHTML = `
      <!-- Header -->
      <div class="erp-header">
        <div class="erp-header-top">
          <div class="erp-logo">
            <div class="erp-logo-icon">📊</div>
            <div>
              <div class="erp-logo-text">ERP Enhancer</div>
              <div class="erp-logo-sub">GEHU Attendance Tracker</div>
            </div>
          </div>
          <button id="erp-close-btn" title="Close">✕</button>
        </div>

        <!-- View Tabs -->
        <div class="erp-tabs">
          <button class="erp-tab active" data-view="overview">Overview</button>
          <button class="erp-tab" data-view="bunk">🟢 Bunk Calc</button>
          <button class="erp-tab" data-view="needed">📚 Classes Needed</button>
        </div>
      </div>

      <!-- Summary -->
      <div id="erp-summary-area"></div>

      <!-- Body -->
      <div class="erp-body" id="erp-body-area">
        <div class="erp-loader">
          <div class="erp-spinner"></div>
          <span>Loading…</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="erp-footer">
        <button class="erp-refresh-btn" id="erp-refresh-btn">
          <span class="erp-refresh-icon">⟳</span> Refresh
        </button>
        <span class="erp-last-updated">Updated: <span id="erp-timestamp">—</span></span>
      </div>
    `;

    return panel;
  }

  // ─── FAB button ───────────────────────────────────────────
  function buildFab() {
    const fab = document.createElement("button");
    fab.id = "erp-fab";
    fab.title = "Open ERP Enhancer";
    fab.innerHTML = "📊";
    return fab;
  }

  // ─── Event wiring ─────────────────────────────────────────
  function wireEvents(panel, fab) {
    // FAB toggle
    fab.addEventListener("click", () => {
      const isOpen = panel.classList.contains("visible");
      if (isOpen) {
        panel.classList.remove("visible");
        fab.classList.remove("open");
        fab.innerHTML = "📊";
        fab.title = "Open ERP Enhancer";
      } else {
        panel.classList.add("visible");
        fab.classList.add("open");
        fab.innerHTML = "✕";
        fab.title = "Close ERP Enhancer";
        if (!subjects.length) loadData();
      }
    });

    // Close button
    document.getElementById("erp-close-btn").addEventListener("click", () => {
      panel.classList.remove("visible");
      fab.classList.remove("open");
      fab.innerHTML = "📊";
    });

    // Tab switching
    panel.querySelectorAll(".erp-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        currentView = tab.dataset.view;
        panel.dataset.view = currentView;
        updatePanel();
      });
    });

    // Refresh button
    document.getElementById("erp-refresh-btn").addEventListener("click", loadData);
  }

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    const root = document.createElement("div");
    root.id = "erp-enhancer-root";

    const panel = buildPanel();
    const fab = buildFab();

    document.body.appendChild(root);
    document.body.appendChild(panel);
    document.body.appendChild(fab);

    wireEvents(panel, fab);
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
