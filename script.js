(() => {
  "use strict";

  const STORAGE_KEY = "accesspoint.visitors.v1";
  const SEED_VISITORS = [
    { id: "seed-1", code: "PASS-184206", name: "Avery Morgan", contact: "avery.morgan@example.com", purpose: "Business Meeting", host: "Taylor Brooks · Finance", idType: "Government ID", checkIn: todayAt(8, 42), checkOut: null },
    { id: "seed-2", code: "PASS-392751", name: "Sam Rivera", contact: "+1 555 0132", purpose: "Interview", host: "People & Culture", idType: "Company Badge", checkIn: todayAt(9, 15), checkOut: null },
    { id: "seed-3", code: "PASS-705638", name: "Jamie Patel", contact: "jamie.patel@example.com", purpose: "Delivery", host: "Facilities", idType: "Government ID", checkIn: todayAt(8, 5), checkOut: todayAt(8, 27) },
    { id: "seed-4", code: "PASS-941083", name: "Casey Kim", contact: "+1 555 0198", purpose: "Event Guest", host: "Events Team", idType: "Student ID", checkIn: todayAt(7, 51), checkOut: todayAt(8, 36) }
  ];

  const state = { visitors: [], query: "", status: "all", storageAvailable: true, lastFocused: null };
  const $ = (selector, root = document) => root.querySelector(selector);
  const form = $("#visitor-form");
  const tableBody = $("#visitor-table-body");
  const modal = $("#badge-modal");
  const quickMessage = $("#quick-message");
  const errorFields = { name: $("#name-error"), contact: $("#contact-error"), host: $("#host-error") };

  function todayAt(hours, minutes) {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  function loadVisitors() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        state.visitors = SEED_VISITORS.map(visitor => ({ ...visitor }));
        saveVisitors();
        return;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || !parsed.every(isVisitorRecord)) {
        throw new Error("Saved visitor data has an invalid format.");
      }
      state.visitors = parsed;
    } catch (error) {
      state.storageAvailable = false;
      state.visitors = SEED_VISITORS.map(visitor => ({ ...visitor }));
      showStorageWarning(error);
    }
  }

  function isVisitorRecord(record) {
    return record && typeof record.id === "string" && typeof record.code === "string" &&
      typeof record.name === "string" && typeof record.contact === "string" &&
      typeof record.purpose === "string" && typeof record.host === "string" &&
      typeof record.checkIn === "string" &&
      (record.checkOut === null || typeof record.checkOut === "string");
  }

  function saveVisitors() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.visitors));
      state.storageAvailable = true;
      return true;
    } catch (error) {
      state.storageAvailable = false;
      showStorageWarning(error);
      return false;
    }
  }

  function showStorageWarning(error) {
    console.error("Unable to access saved visitor data.", error);
    const message = "Visitor data could not be saved in this browser. Changes may be lost when you leave or refresh this page.";
    const warning = $("#storage-warning");
    warning.textContent = message;
    warning.hidden = false;
    $("#live-announcement").textContent = message;
  }

  function updateClock() {
    const now = new Date();
    $("#clock").textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    $("#current-date").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    $("#today-label").textContent = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function isToday(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }

  function formatTime(isoDate) {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function renderStats() {
    const today = state.visitors.filter(visitor => isToday(visitor.checkIn));
    $("#stat-total").textContent = String(today.length);
    $("#stat-active").textContent = String(state.visitors.filter(visitor => !visitor.checkOut).length);
    $("#stat-out").textContent = String(state.visitors.filter(visitor => visitor.checkOut).length);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function visibleVisitors() {
    const query = state.query.trim().toLocaleLowerCase();
    return [...state.visitors]
      .filter(visitor => state.status === "all" || (state.status === "in" ? !visitor.checkOut : Boolean(visitor.checkOut)))
      .filter(visitor => !query || [visitor.name, visitor.code, visitor.host].some(value => value.toLocaleLowerCase().includes(query)))
      .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  }

  function renderTable() {
    const visitors = visibleVisitors();
    tableBody.innerHTML = visitors.map(visitor => {
      const isActive = !visitor.checkOut;
      const checkoutButton = isActive
        ? `<button type="button" data-action="checkout" data-id="${escapeHtml(visitor.id)}">Check out visitor</button>`
        : "";
      return `<tr>
        <td class="visitor-cell"><strong title="${escapeHtml(visitor.name)}">${escapeHtml(visitor.name)}</strong><small>${escapeHtml(visitor.contact)}</small><span class="pass-code">${escapeHtml(visitor.code)}</span></td>
        <td class="purpose-cell"><strong>${escapeHtml(visitor.purpose)}</strong><small>${escapeHtml(visitor.host)}</small></td>
        <td class="time-cell">${escapeHtml(formatTime(visitor.checkIn))}</td>
        <td class="time-cell">${isActive ? '<span class="stat-note">Active</span>' : escapeHtml(formatTime(visitor.checkOut))}</td>
        <td><span class="status-badge ${isActive ? "status-in" : "status-out"}"><span class="status-dot"></span>${isActive ? "Checked in" : "Checked out"}</span></td>
        <td><div class="action-menu">
          <button class="action-toggle" type="button" aria-label="Actions for ${escapeHtml(visitor.name)}" aria-expanded="false" aria-haspopup="true" data-action="toggle-menu">⋯</button>
          <div class="action-popover" hidden>${checkoutButton}
            <button type="button" data-action="view" data-id="${escapeHtml(visitor.id)}">View visitor pass</button>
            <button class="danger" type="button" data-action="delete" data-id="${escapeHtml(visitor.id)}">Delete log</button>
          </div>
        </div></td>
      </tr>`;
    }).join("");
    $("#empty-state").hidden = visitors.length > 0;
    $("#result-count").textContent = `Showing ${visitors.length} ${visitors.length === 1 ? "visitor" : "visitors"}`;
    renderStats();
  }

  function generateCode() {
    let code;
    do {
      code = `PASS-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`;
    } while (state.visitors.some(visitor => visitor.code === code));
    return code;
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase();
  }

  function drawVisualCode(text) {
    const canvas = $("#badge-qr");
    const context = canvas.getContext("2d");
    if (!context) return;
    const size = 21;
    const cell = canvas.width / size;
    let seed = 0;
    for (const character of text) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const finder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        const finderX = x < 7 ? x : x >= size - 7 ? x - (size - 7) : 0;
        const finderY = y < 7 ? y : y >= size - 7 ? y - (size - 7) : 0;
        const finderPixel = finder && (finderX === 0 || finderX === 6 || finderY === 0 || finderY === 6 || (finderX >= 2 && finderX <= 4 && finderY >= 2 && finderY <= 4));
        if (finderPixel || (!finder && (seed & 3) < 2)) {
          context.fillStyle = "#182337";
          context.fillRect(Math.floor(x * cell), Math.floor(y * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  function showBadge(visitor) {
    if (!visitor) return;
    state.lastFocused = document.activeElement;
    $("#badge-name").textContent = visitor.name;
    $("#badge-purpose").textContent = visitor.purpose;
    $("#badge-host").textContent = visitor.host;
    $("#badge-time").textContent = `${new Date(visitor.checkIn).toLocaleDateString()} · ${formatTime(visitor.checkIn)}`;
    $("#badge-code").textContent = visitor.code;
    $("#badge-initials").textContent = initials(visitor.name) || "V";
    drawVisualCode(visitor.code);
    modal.hidden = false;
    $("#close-badge").focus();
  }

  function closeBadge() {
    modal.hidden = true;
    if (state.lastFocused && typeof state.lastFocused.focus === "function") state.lastFocused.focus();
  }

  function setCheckout(visitor) {
    if (!visitor || visitor.checkOut) return false;
    visitor.checkOut = new Date().toISOString();
    saveVisitors();
    renderTable();
    $("#live-announcement").textContent = `${visitor.name} has been checked out.`;
    return true;
  }

  function validateForm(values) {
    const normalized = {
      name: values.get("name").trim(),
      contact: values.get("contact").trim(),
      host: values.get("host").trim()
    };
    let valid = true;
    Object.entries(errorFields).forEach(([key, element]) => {
      const missing = !normalized[key];
      element.textContent = missing ? "This field is required." : "";
      const input = $(`#visitor-${key}`);
      if (input) input.setAttribute("aria-invalid", String(missing));
      valid = valid && !missing;
    });
    const contactLooksValid = normalized.contact.includes("@")
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.contact)
      : /^[+\d][\d\s().-]{5,}$/.test(normalized.contact);
    if (normalized.contact && !contactLooksValid) {
      errorFields.contact.textContent = "Enter a valid email address or phone number.";
      $("#visitor-contact").setAttribute("aria-invalid", "true");
      valid = false;
    }
    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
    }
    return { valid, normalized };
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(form);
    const { valid, normalized } = validateForm(formData);
    if (!valid) return;
    const visitor = {
      id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      code: generateCode(),
      name: normalized.name,
      contact: normalized.contact,
      purpose: String(formData.get("purpose")),
      host: normalized.host,
      idType: String(formData.get("idType")),
      checkIn: new Date().toISOString(),
      checkOut: null
    };
    state.visitors.push(visitor);
    saveVisitors();
    renderTable();
    form.reset();
    Object.values(errorFields).forEach(element => { element.textContent = ""; });
    form.querySelectorAll('[aria-invalid="true"]').forEach(input => input.setAttribute("aria-invalid", "false"));
    $("#live-announcement").textContent = `${visitor.name} is checked in. Pass code ${visitor.code}.`;
    showBadge(visitor);
  });

  form.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && input.value.trim()) {
        input.setAttribute("aria-invalid", "false");
        errorFields[input.name].textContent = "";
      }
    });
  });

  $("#visitor-search").addEventListener("input", event => {
    state.query = event.target.value;
    renderTable();
  });
  $("#status-filter").addEventListener("change", event => {
    state.status = event.target.value;
    renderTable();
  });

  tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "toggle-menu") {
      const popover = button.nextElementSibling;
      const wasExpanded = button.getAttribute("aria-expanded") === "true";
      tableBody.querySelectorAll(".action-popover").forEach(menu => { menu.hidden = true; });
      tableBody.querySelectorAll(".action-toggle").forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
      popover.hidden = wasExpanded;
      button.setAttribute("aria-expanded", String(!wasExpanded));
      return;
    }
    const visitor = state.visitors.find(item => item.id === button.dataset.id);
    if (!visitor) return;
    if (action === "checkout") setCheckout(visitor);
    if (action === "view") showBadge(visitor);
    if (action === "delete") {
      if (!window.confirm(`Delete the visitor log for ${visitor.name}? This cannot be undone.`)) return;
      state.visitors = state.visitors.filter(item => item.id !== visitor.id);
      saveVisitors();
      renderTable();
    }
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".action-menu")) {
      tableBody.querySelectorAll(".action-popover").forEach(menu => { menu.hidden = true; });
      tableBody.querySelectorAll(".action-toggle").forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
    }
  });

  $("#quick-checkout-form").addEventListener("submit", event => {
    event.preventDefault();
    const rawCode = $("#quick-code").value.trim().toUpperCase();
    const code = /^\d{6}$/.test(rawCode) ? `PASS-${rawCode}` : rawCode;
    const visitor = state.visitors.find(item => item.code.toUpperCase() === code);
    quickMessage.classList.remove("success");
    if (!visitor) {
      quickMessage.textContent = "No visitor found with that pass code.";
      return;
    }
    if (visitor.checkOut) {
      quickMessage.textContent = "This visitor has already checked out.";
      return;
    }
    setCheckout(visitor);
    quickMessage.textContent = `${visitor.name} checked out successfully.`;
    quickMessage.classList.add("success");
    $("#quick-code").value = "";
  });

  $("#reset-demo").addEventListener("click", () => {
    if (!window.confirm("Reset all visitor logs and restore the demo records? This cannot be undone.")) return;
    state.visitors = SEED_VISITORS.map(visitor => ({ ...visitor }));
    saveVisitors();
    $("#visitor-search").value = "";
    $("#status-filter").value = "all";
    state.query = "";
    state.status = "all";
    quickMessage.textContent = "";
    renderTable();
    $("#live-announcement").textContent = "Demo records restored.";
  });

  $("#close-badge").addEventListener("click", closeBadge);
  $("#modal-x").addEventListener("click", closeBadge);
  $("#print-badge").addEventListener("click", () => window.print());
  modal.addEventListener("click", event => { if (event.target === modal) closeBadge(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeBadge();
  });

  loadVisitors();
  updateClock();
  window.setInterval(updateClock, 1000);
  renderTable();
})();
