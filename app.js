/**
 * HANK CHANG • IoT Systems & Telemetry Console
 * Application Logic: Radial Orbital Clock, Interactive Terminal, Timezone Switching & Telemetry
 */

(function () {
  'use strict';

  // --- Defaults & Storage Keys ---
  const DEFAULT_PROFILE = {
    name: 'Hank Chang',
    headline: 'IoT Systems Architect & Embedded Edge Engineer',
    bio: 'Specializing in low-power microcontroller telemetry, sensor network clustering, and edge inference. Dedicated to bridging real-world sensor streams with autonomous physical intelligence.'
  };

  const STORAGE = {
    PROFILE: 'hank_console_profile',
    ACCENT: 'hank_console_accent',
    FORMAT_24: 'hank_console_24h',
    TIMEZONE: 'hank_console_timezone',
    NOTES: 'hank_console_notes'
  };

  // --- State ---
  let is24Hour = localStorage.getItem(STORAGE.FORMAT_24) !== 'false';
  let activeTimezone = localStorage.getItem(STORAGE.TIMEZONE) || 'Asia/Taipei';
  let activeAccent = localStorage.getItem(STORAGE.ACCENT) || 'amber';
  let profile = loadProfile();

  // --- DOM Elements ---
  const el = {
    html: document.documentElement,
    
    // Profile
    authorName: document.querySelector('.giant-name'),
    headlineTitle: document.querySelector('.headline-title'),
    bioText: document.getElementById('bio-text'),

    // Clock & Orbital Ring
    clockHour: document.getElementById('clock-hour'),
    clockMinute: document.getElementById('clock-minute'),
    clockSecond: document.getElementById('clock-second'),
    clockAmpm: document.getElementById('clock-ampm'),
    secondsRing: document.getElementById('seconds-progress-ring'),
    calendarText: document.getElementById('calendar-text'),
    dayProgressVal: document.getElementById('day-progress-val'),
    dayProgressFill: document.getElementById('day-progress-fill'),

    // Top Bar & Controls
    greetingSymbol: document.getElementById('greeting-symbol'),
    greetingLabel: document.getElementById('greeting-label'),
    toggle1224: document.getElementById('toggle-12-24'),
    formatIndicator: document.getElementById('format-indicator'),
    copyIsoBtn: document.getElementById('copy-iso-btn'),
    quickProfileBtn: document.getElementById('quick-profile-btn'),
    resetDefaultsBtn: document.getElementById('reset-defaults-btn'),

    // Timezone Hubs
    hubButtons: document.querySelectorAll('.hub-btn'),

    // Accent Switcher
    accentDots: document.querySelectorAll('.accent-dot'),

    // Telemetry
    telemetryPing: document.getElementById('telemetry-ping'),

    // Terminal
    terminalForm: document.getElementById('terminal-form'),
    terminalInput: document.getElementById('terminal-input'),
    terminalOutput: document.getElementById('terminal-output'),
    terminalChips: document.querySelectorAll('.t-chip'),

    // Notes
    quickNotes: document.getElementById('quick-notes'),
    notesStatus: document.getElementById('notes-status'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),

    // Modal
    modalContainer: document.getElementById('modal-container'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    cancelModalBtn: document.getElementById('cancel-modal-btn'),
    profileEditForm: document.getElementById('profile-edit-form'),
    inputDisplayName: document.getElementById('input-display-name'),
    inputHeadline: document.getElementById('input-headline'),
    inputBio: document.getElementById('input-bio')
  };

  /* ==========================================================================
     Profile Management
     ========================================================================== */

  function loadProfile() {
    try {
      const saved = localStorage.getItem(STORAGE.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { ...DEFAULT_PROFILE };
  }

  function applyProfile() {
    if (el.headlineTitle) el.headlineTitle.textContent = profile.headline;
    if (el.bioText) el.bioText.textContent = profile.bio;
  }

  function saveProfile(name, headline, bio) {
    profile = {
      name: name.trim() || DEFAULT_PROFILE.name,
      headline: headline.trim() || DEFAULT_PROFILE.headline,
      bio: bio.trim() || DEFAULT_PROFILE.bio
    };
    try {
      localStorage.setItem(STORAGE.PROFILE, JSON.stringify(profile));
    } catch (e) {}
    applyProfile();
    showToast('Profile updated successfully!');
  }

  function resetAllSettings() {
    localStorage.clear();
    profile = { ...DEFAULT_PROFILE };
    is24Hour = true;
    activeTimezone = 'Asia/Taipei';
    activeAccent = 'amber';
    applyAccent(activeAccent);
    applyProfile();
    el.quickNotes.value = '';
    showToast('Preferences restored to default.');
    tickClock();
  }

  /* ==========================================================================
     Theme Accent Switcher
     ========================================================================== */

  function applyAccent(accent) {
    activeAccent = accent;
    el.html.setAttribute('data-accent', accent);
    localStorage.setItem(STORAGE.ACCENT, accent);

    el.accentDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.theme === accent);
    });
  }

  /* ==========================================================================
     Time & Orbital Dial Engine
     ========================================================================== */

  const RING_CIRCUMFERENCE = 2 * Math.PI * 140; // ~879.64

  function pad(num) {
    return num < 10 ? '0' + num : num.toString();
  }

  function updateGreeting(hour) {
    let symbol = '☀️';
    let label = 'GOOD AFTERNOON';

    if (hour >= 5 && hour < 12) {
      symbol = '🌅';
      label = 'GOOD MORNING';
    } else if (hour >= 12 && hour < 18) {
      symbol = '☀️';
      label = 'GOOD AFTERNOON';
    } else if (hour >= 18 && hour < 22) {
      symbol = '🌇';
      label = 'GOOD EVENING';
    } else {
      symbol = '🌙';
      label = 'NIGHT MODE ACTIVE';
    }

    el.greetingSymbol.textContent = symbol;
    el.greetingLabel.textContent = label;
  }

  function tickClock() {
    const now = new Date();

    // Get time in selected timezone
    const tzOptions = {
      timeZone: activeTimezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: !is24Hour
    };

    let hourStr = '00';
    let minStr = '00';
    let secStr = '00';
    let isPm = false;

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: activeTimezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: is24Hour ? 'h23' : 'h12'
      });

      const parts = formatter.formatToParts(now);
      parts.forEach(p => {
        if (p.type === 'hour') hourStr = pad(parseInt(p.value, 10));
        if (p.type === 'minute') minStr = pad(parseInt(p.value, 10));
        if (p.type === 'second') secStr = pad(parseInt(p.value, 10));
        if (p.type === 'dayPeriod') isPm = p.value.toLowerCase().includes('pm');
      });
    } catch (err) {
      hourStr = pad(now.getHours());
      minStr = pad(now.getMinutes());
      secStr = pad(now.getSeconds());
    }

    // 12/24 hour display
    if (is24Hour) {
      el.clockAmpm.classList.add('hidden');
    } else {
      el.clockAmpm.classList.remove('hidden');
      el.clockAmpm.textContent = isPm ? 'PM' : 'AM';
    }

    el.clockHour.textContent = hourStr;
    el.clockMinute.textContent = minStr;
    el.clockSecond.textContent = secStr;

    // Update Radial SVG Seconds Ring
    const currentSeconds = parseInt(secStr, 10);
    const strokeOffset = RING_CIRCUMFERENCE - (currentSeconds / 60) * RING_CIRCUMFERENCE;
    el.secondsRing.style.strokeDashoffset = strokeOffset;

    // Day Progress calculation
    const rawHours = now.getHours();
    const totalSecs = rawHours * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const progressPct = ((totalSecs / 86400) * 100).toFixed(1);
    el.dayProgressVal.textContent = `${progressPct}%`;
    el.dayProgressFill.style.width = `${progressPct}%`;

    // Calendar Date Formatter in English
    try {
      const dateOpts = {
        timeZone: activeTimezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      el.calendarText.textContent = new Intl.DateTimeFormat('en-US', dateOpts).format(now);
    } catch (e) {
      el.calendarText.textContent = now.toDateString();
    }

    updateGreeting(now.getHours());
  }

  function toggleFormat() {
    is24Hour = !is24Hour;
    localStorage.setItem(STORAGE.FORMAT_24, is24Hour);
    el.formatIndicator.textContent = is24Hour ? '24H' : '12H';
    tickClock();
  }

  function setTimezone(tz) {
    activeTimezone = tz;
    localStorage.setItem(STORAGE.TIMEZONE, tz);
    el.hubButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tz === tz);
    });
    tickClock();
    showToast(`Timezone switched to: ${tz}`);
  }

  function copyTimestamp() {
    const now = new Date();
    const iso = now.toISOString();
    const local = now.toLocaleString();
    const output = `Timestamp: ${iso} (${local}) • Timezone: ${activeTimezone}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(output).then(() => {
        showToast('ISO Timestamp copied to clipboard!');
      }).catch(() => {
        showToast(`Current Time: ${iso}`);
      });
    } else {
      showToast(`Current Time: ${iso}`);
    }
  }

  /* ==========================================================================
     Interactive Cyber Terminal
     ========================================================================== */

  const commands = {
    help: 'Available commands: about, projects, time, contact, clear',
    about: 'Hank Chang: IoT Systems Architect & Embedded Developer at NCHU IoT Lab.',
    projects: 'Projects: 1) ESP32 Telemetry Mesh  2) Edge TinyML Inference  3) MQTT Gateway',
    time: () => `Current local time: ${new Date().toISOString()} [TZ: ${activeTimezone}]`,
    contact: 'GitHub: https://github.com/hankyyyyyy | NCHU IoT Systems Research',
    clear: () => {
      el.terminalOutput.innerHTML = '';
      return '';
    }
  };

  function printTerminalLine(text, isCmd = false) {
    const p = document.createElement('p');
    p.className = 'term-line';
    if (isCmd) {
      p.innerHTML = `<span class="term-prompt">hank@nchu:~$</span> <span class="term-cmd">${text}</span>`;
    } else {
      p.textContent = text;
    }
    el.terminalOutput.appendChild(p);
    el.terminalOutput.scrollTop = el.terminalOutput.scrollHeight;
  }

  function executeTerminalCommand(input) {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    printTerminalLine(trimmed, true);

    if (trimmed === 'clear') {
      commands.clear();
      return;
    }

    if (commands[trimmed]) {
      const response = typeof commands[trimmed] === 'function' ? commands[trimmed]() : commands[trimmed];
      if (response) printTerminalLine(response);
    } else {
      printTerminalLine(`Command not found: "${trimmed}". Type "help" for options.`);
    }
  }

  /* ==========================================================================
     Hardware Telemetry Simulation
     ========================================================================== */

  function initTelemetryJitter() {
    setInterval(() => {
      if (el.telemetryPing) {
        const ping = Math.floor(10 + Math.random() * 5); // 10-14ms
        el.telemetryPing.textContent = `${ping} ms`;
      }
    }, 3200);
  }

  /* ==========================================================================
     Research Notes Auto-save
     ========================================================================== */

  function initNotes() {
    const saved = localStorage.getItem(STORAGE.NOTES);
    if (saved) el.quickNotes.value = saved;

    let debounce = null;
    el.quickNotes.addEventListener('input', () => {
      el.notesStatus.textContent = 'SAVING...';
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        localStorage.setItem(STORAGE.NOTES, el.quickNotes.value);
        el.notesStatus.textContent = 'AUTOSAVED';
      }, 500);
    });
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */

  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    el.toastMessage.textContent = msg;
    el.toast.classList.add('show');
    toastTimer = setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     Profile Modal Handlers
     ========================================================================== */

  function openModal() {
    el.inputDisplayName.value = profile.name;
    el.inputHeadline.value = profile.headline;
    el.inputBio.value = profile.bio;
    el.modalContainer.classList.add('open');
    el.modalContainer.setAttribute('aria-hidden', 'false');
    el.inputDisplayName.focus();
  }

  function closeModal() {
    el.modalContainer.classList.remove('open');
    el.modalContainer.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     Event Bindings & Initialization
     ========================================================================== */

  function bindEvents() {
    // Format Toggle
    el.toggle1224.addEventListener('click', toggleFormat);
    el.copyIsoBtn.addEventListener('click', copyTimestamp);

    // Accent Switcher
    el.accentDots.forEach(dot => {
      dot.addEventListener('click', () => {
        applyAccent(dot.dataset.theme);
      });
    });

    // Timezone Hubs
    el.hubButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setTimezone(btn.dataset.tz);
      });
    });

    // Modal
    el.quickProfileBtn.addEventListener('click', openModal);
    el.closeModalBtn.addEventListener('click', closeModal);
    el.cancelModalBtn.addEventListener('click', closeModal);
    el.modalContainer.addEventListener('click', (e) => {
      if (e.target === el.modalContainer) closeModal();
    });

    el.profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile(el.inputDisplayName.value, el.inputHeadline.value, el.inputBio.value);
      closeModal();
    });

    // Terminal
    el.terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeTerminalCommand(el.terminalInput.value);
      el.terminalInput.value = '';
    });

    el.terminalChips.forEach(chip => {
      chip.addEventListener('click', () => {
        executeTerminalCommand(chip.dataset.cmd);
      });
    });

    // Reset
    el.resetDefaultsBtn.addEventListener('click', resetAllSettings);
  }

  function init() {
    applyAccent(activeAccent);
    applyProfile();
    el.formatIndicator.textContent = is24Hour ? '24H' : '12H';

    el.hubButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tz === activeTimezone);
    });

    tickClock();
    setInterval(tickClock, 1000);

    bindEvents();
    initNotes();
    initTelemetryJitter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
