/**
 * Personal Dashboard & Live Clock Engine
 * Built with Vanilla JavaScript
 */

(function () {
  'use strict';

  // State
  const storedName = localStorage.getItem('personal_name');
  const initialName = (storedName && storedName !== 'Alex Rivera') ? storedName : 'Hank Chang';
  if (storedName === 'Alex Rivera') {
    localStorage.setItem('personal_name', 'Hank Chang');
  }

  const state = {
    userName: initialName,
    is24Hour: localStorage.getItem('time_format_24h') !== 'false',
    showSeconds: localStorage.getItem('show_seconds') !== 'false',
    showMilliseconds: false,
    theme: localStorage.getItem('personal_theme') || 'dark',
    focusIndex: 0
  };

  const focusStatuses = [
    { label: 'In The Zone', color: 'var(--accent-emerald)' },
    { label: 'Deep Work', color: 'var(--accent-indigo)' },
    { label: 'Taking a Break', color: 'var(--accent-amber)' },
    { label: 'Brainstorming', color: 'var(--accent-cyan)' }
  ];

  const focusQuotes = [
    '"The secret of getting ahead is getting started."',
    '"Focus on being productive instead of busy."',
    '"Small disciplines repeated with consistency lead to great achievements."',
    '"Time is what we want most, but what we use worst."',
    '"The future depends on what you do today."'
  ];

  // DOM Elements
  const el = {
    // Theme & Formatting
    html: document.documentElement,
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    formatToggleBtn: document.getElementById('format-toggle-btn'),
    formatLabel: document.getElementById('format-label'),
    secToggleBtn: document.getElementById('sec-toggle-btn'),
    msToggleBtn: document.getElementById('ms-toggle-btn'),
    
    // Timezone
    tzDisplay: document.getElementById('tz-display'),
    
    // Greeting & Name
    greetingPill: document.getElementById('greeting-pill'),
    greetingIcon: document.getElementById('greeting-icon'),
    greetingText: document.getElementById('greeting-text'),
    nameDisplay: document.getElementById('name-display'),
    nameText: document.getElementById('name-text'),
    editNameBtn: document.getElementById('edit-name-btn'),
    nameEditBox: document.getElementById('name-edit-box'),
    nameInput: document.getElementById('name-input'),
    saveNameBtn: document.getElementById('save-name-btn'),
    cancelNameBtn: document.getElementById('cancel-name-btn'),
    footerUserName: document.getElementById('footer-user-name'),

    // Clock
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    milliseconds: document.getElementById('milliseconds'),
    secElements: document.querySelectorAll('.sec-elem'),
    ampm: document.getElementById('ampm'),
    
    // Progress & Date
    dayProgressFill: document.getElementById('day-progress-fill'),
    dayProgressText: document.getElementById('day-progress-text'),
    fullDay: document.getElementById('full-day'),
    fullDate: document.getElementById('full-date'),
    dayOfYearPill: document.getElementById('day-of-year-pill'),
    weekNumberPill: document.getElementById('week-number-pill'),

    // World Clocks
    worldTokyo: document.getElementById('world-time-tokyo'),
    worldLondon: document.getElementById('world-time-london'),
    worldNy: document.getElementById('world-time-ny'),
    worldSf: document.getElementById('world-time-sf'),

    // Focus Widget
    focusStatusToggle: document.getElementById('focus-status-toggle'),
    focusStatusLabel: document.getElementById('focus-status-label'),
    focusQuote: document.getElementById('focus-quote'),
    focusPill: document.getElementById('focus-pill')
  };

  /* ==========================================================================
     Theme Management
     ========================================================================== */

  function applyTheme(theme) {
    state.theme = theme;
    el.html.setAttribute('data-theme', theme);
    localStorage.setItem('personal_theme', theme);
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  /* ==========================================================================
     User Name Management
     ========================================================================== */

  function renderName() {
    el.nameText.textContent = state.userName;
    if (el.footerUserName) {
      el.footerUserName.textContent = state.userName;
    }
  }

  function startEditName() {
    el.nameDisplay.classList.add('hidden');
    el.nameEditBox.classList.remove('hidden');
    el.nameInput.value = state.userName;
    el.nameInput.focus();
    el.nameInput.select();
  }

  function saveName() {
    const val = el.nameInput.value.trim();
    if (val.length > 0) {
      state.userName = val;
      localStorage.setItem('personal_name', val);
      renderName();
      updateGreeting();
    }
    cancelEditName();
  }

  function cancelEditName() {
    el.nameEditBox.classList.add('hidden');
    el.nameDisplay.classList.remove('hidden');
  }

  /* ==========================================================================
     Time & Clock Logic
     ========================================================================== */

  function pad(num, size = 2) {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function updateGreeting(now = new Date()) {
    const hour = now.getHours();
    let greeting = 'Welcome';
    let icon = '✨';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
      icon = '🌅';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
      icon = '☀️';
    } else if (hour >= 17 && hour < 22) {
      greeting = 'Good Evening';
      icon = '🌇';
    } else {
      greeting = 'Good Night';
      icon = '🌙';
    }

    el.greetingText.textContent = `${greeting}, ${state.userName}`;
    el.greetingIcon.textContent = icon;
  }

  function updateWorldClocks(now) {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !state.is24Hour
    };

    try {
      if (el.worldTokyo) {
        el.worldTokyo.textContent = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'Asia/Tokyo' }).format(now);
      }
      if (el.worldLondon) {
        el.worldLondon.textContent = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'Europe/London' }).format(now);
      }
      if (el.worldNy) {
        el.worldNy.textContent = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'America/New_York' }).format(now);
      }
      if (el.worldSf) {
        el.worldSf.textContent = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'America/Los_Angeles' }).format(now);
      }
    } catch (e) {
      console.warn('World clock timezone formatting error:', e);
    }
  }

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // 12/24 Hour format
    if (!state.is24Hour) {
      el.ampm.classList.remove('hidden');
      const isPm = hours >= 12;
      el.ampm.textContent = isPm ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // hour 0 should be 12
    } else {
      el.ampm.classList.add('hidden');
    }

    el.hours.textContent = pad(hours);
    el.minutes.textContent = pad(minutes);
    el.seconds.textContent = pad(seconds);

    if (state.showMilliseconds) {
      el.milliseconds.textContent = '.' + pad(milliseconds, 3);
    }

    // Day Progress calculation
    const rawHours = now.getHours();
    const secondsInDay = rawHours * 3600 + minutes * 60 + seconds;
    const progressPercent = ((secondsInDay / 86400) * 100).toFixed(1);
    el.dayProgressFill.style.width = `${progressPercent}%`;
    el.dayProgressText.textContent = `${progressPercent}%`;

    // Calendar & Date details
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    el.fullDay.textContent = days[now.getDay()];
    el.fullDate.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // Day of year and Week number
    const totalDays = isLeapYear(now.getFullYear()) ? 366 : 365;
    const dayOfYear = getDayOfYear(now);
    el.dayOfYearPill.textContent = `Day ${dayOfYear} of ${totalDays}`;
    el.weekNumberPill.textContent = `Week ${getWeekNumber(now)}`;

    // Update greeting
    updateGreeting(now);

    // Update World Clocks
    updateWorldClocks(now);
  }

  /* ==========================================================================
     Timezone & Formatting Controls
     ========================================================================== */

  function initTimezone() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const offsetMinutes = -new Date().getTimezoneOffset();
      const offsetHours = offsetMinutes / 60;
      const sign = offsetHours >= 0 ? '+' : '';
      el.tzDisplay.textContent = `${tz} (UTC${sign}${offsetHours})`;
    } catch (e) {
      el.tzDisplay.textContent = 'Local Time';
    }
  }

  function setFormat(is24) {
    state.is24Hour = is24;
    localStorage.setItem('time_format_24h', is24);
    el.formatLabel.textContent = is24 ? '24H' : '12H';
    updateClock();
  }

  function toggleFormat() {
    setFormat(!state.is24Hour);
  }

  function toggleSeconds() {
    state.showSeconds = !state.showSeconds;
    localStorage.setItem('show_seconds', state.showSeconds);
    el.secToggleBtn.classList.toggle('active', state.showSeconds);
    el.secToggleBtn.textContent = `Sec: ${state.showSeconds ? 'ON' : 'OFF'}`;

    el.secElements.forEach(item => {
      if (state.showSeconds) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  function toggleMilliseconds() {
    state.showMilliseconds = !state.showMilliseconds;
    el.msToggleBtn.classList.toggle('active', state.showMilliseconds);
    el.msToggleBtn.textContent = `ms: ${state.showMilliseconds ? 'ON' : 'OFF'}`;

    if (state.showMilliseconds) {
      el.milliseconds.classList.remove('hidden');
      startHighFrequencyTicker();
    } else {
      el.milliseconds.classList.add('hidden');
      startNormalTicker();
    }
  }

  let clockTimer = null;

  function startNormalTicker() {
    if (clockTimer) clearInterval(clockTimer);
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  function startHighFrequencyTicker() {
    if (clockTimer) clearInterval(clockTimer);
    updateClock();
    clockTimer = setInterval(updateClock, 40); // 25 fps updates for milliseconds
  }

  /* ==========================================================================
     Widget Handlers
     ========================================================================== */

  function cycleFocusStatus() {
    state.focusIndex = (state.focusIndex + 1) % focusStatuses.length;
    const current = focusStatuses[state.focusIndex];
    el.focusStatusLabel.textContent = current.label;
    
    // Cycle quote
    const nextQuote = focusQuotes[Math.floor(Math.random() * focusQuotes.length)];
    el.focusQuote.textContent = nextQuote;
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  function bindEvents() {
    // Theme
    el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Format
    el.formatToggleBtn.addEventListener('click', toggleFormat);
    el.secToggleBtn.addEventListener('click', toggleSeconds);
    el.msToggleBtn.addEventListener('click', toggleMilliseconds);

    // Name Editing
    el.nameDisplay.addEventListener('click', startEditName);
    el.editNameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startEditName();
    });
    el.saveNameBtn.addEventListener('click', saveName);
    el.cancelNameBtn.addEventListener('click', cancelEditName);

    el.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveName();
      } else if (e.key === 'Escape') {
        cancelEditName();
      }
    });

    // Focus Widget
    if (el.focusStatusToggle) {
      el.focusStatusToggle.addEventListener('click', cycleFocusStatus);
    }
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */

  function init() {
    applyTheme(state.theme);
    renderName();
    initTimezone();
    setFormat(state.is24Hour);
    
    if (!state.showSeconds) {
      el.secToggleBtn.classList.remove('active');
      el.secToggleBtn.textContent = 'Sec: OFF';
      el.secElements.forEach(item => item.classList.add('hidden'));
    }

    bindEvents();
    startNormalTicker();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
