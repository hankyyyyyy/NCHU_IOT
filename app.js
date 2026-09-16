/**
 * NCHU AIoT 2026 - Hank Chang Personal Telemetry Dashboard
 * Interactive Particle Mesh Physics, Precision Clock Engine & Telemetry Simulator
 */

(function () {
  'use strict';

  // --- Configuration & Defaults ---
  const DEFAULT_PROFILE = {
    name: 'Hank Chang',
    role: 'NCHU AIoT Engineer & Developer • 物聯網與邊緣智能系統探索'
  };

  const STORAGE_KEYS = {
    PROFILE: 'aiot_hank_profile',
    TIME_FORMAT: 'aiot_hank_time_format' // '12' or '24'
  };

  // --- State ---
  let is24HourFormat = localStorage.getItem(STORAGE_KEYS.TIME_FORMAT) !== '12';
  let userProfile = loadUserProfile();

  // --- DOM Elements ---
  const elHours = document.getElementById('clock-hours');
  const elMinutes = document.getElementById('clock-minutes');
  const elSeconds = document.getElementById('clock-seconds');
  const elPeriod = document.getElementById('clock-period');
  const elPeriodContainer = document.getElementById('period-container');
  const elDate = document.getElementById('clock-date');
  const elTimezone = document.getElementById('clock-timezone');
  const elDayProgressVal = document.getElementById('day-progress-val');
  const elDayProgressFill = document.getElementById('day-progress-fill');

  const elGreetingText = document.getElementById('greeting-text');
  const elGreetingIcon = document.getElementById('greeting-icon');

  const elUserName = document.getElementById('user-name');
  const elUserRole = document.getElementById('user-role');
  const elAvatarInitials = document.getElementById('avatar-initials');

  const btnFormatToggle = document.getElementById('format-toggle-btn');
  const lblFormat = document.getElementById('format-label');
  const btnCopyTime = document.getElementById('copy-time-btn');
  const btnQuickEdit = document.getElementById('quick-edit-btn');
  const btnInlineRename = document.getElementById('inline-rename-btn');
  const btnResetProfile = document.getElementById('reset-profile-btn');

  const modalOverlay = document.getElementById('edit-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const editForm = document.getElementById('edit-profile-form');
  const inputName = document.getElementById('input-name');
  const inputRole = document.getElementById('input-role');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  const telemetryLatency = document.getElementById('telemetry-latency');

  // World Clocks
  const worldTokyo = document.getElementById('world-tokyo');
  const worldLondon = document.getElementById('world-london');
  const worldNy = document.getElementById('world-ny');
  const worldSf = document.getElementById('world-sf');

  /* ==========================================================================
     Profile State & Initialization
     ========================================================================== */

  function loadUserProfile() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name !== 'Alex Rivera') return parsed;
      }
    } catch (e) {
      console.warn('Failed reading profile from storage:', e);
    }
    return { ...DEFAULT_PROFILE };
  }

  function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function applyProfile() {
    elUserName.textContent = userProfile.name;
    elUserRole.textContent = userProfile.role;
    if (elAvatarInitials) {
      elAvatarInitials.textContent = getInitials(userProfile.name);
    }
    updateGreeting(new Date());
  }

  function saveUserProfile(name, role) {
    userProfile = {
      name: name.trim() || DEFAULT_PROFILE.name,
      role: role.trim() || DEFAULT_PROFILE.role
    };
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed saving profile:', e);
    }
    applyProfile();
    showToast('Profile updated successfully!');
  }

  function resetProfile() {
    userProfile = { ...DEFAULT_PROFILE };
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (e) {}
    applyProfile();
    showToast('Profile reset to default.');
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     Time & Clock Telemetry Loop
     ========================================================================== */

  function padZero(num, size = 2) {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  function updateGreeting(now) {
    const hour = now.getHours();
    let text = 'GOOD DAY';
    let icon = '✨';

    if (hour >= 5 && hour < 12) {
      text = 'GOOD MORNING';
      icon = '🌅';
    } else if (hour >= 12 && hour < 17) {
      text = 'GOOD AFTERNOON';
      icon = '☀️';
    } else if (hour >= 17 && hour < 22) {
      text = 'GOOD EVENING';
      icon = '🌇';
    } else {
      text = 'NIGHT MODE ACTIVE';
      icon = '🌙';
    }

    elGreetingText.textContent = `${text}, ${userProfile.name.toUpperCase()}`;
    elGreetingIcon.textContent = icon;
  }

  function updateWorldClocks(now) {
    const opts = { hour: '2-digit', minute: '2-digit', hour12: !is24HourFormat };
    try {
      if (worldTokyo) worldTokyo.textContent = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'Asia/Tokyo' }).format(now);
      if (worldLondon) worldLondon.textContent = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'Europe/London' }).format(now);
      if (worldNy) worldNy.textContent = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'America/New_York' }).format(now);
      if (worldSf) worldSf.textContent = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'America/Los_Angeles' }).format(now);
    } catch (e) {
      console.warn('World clock format error:', e);
    }
  }

  function tickClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 12H vs 24H formatting
    if (is24HourFormat) {
      elPeriodContainer.style.display = 'none';
    } else {
      elPeriodContainer.style.display = 'flex';
      const isPm = hours >= 12;
      elPeriod.textContent = isPm ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
    }

    elHours.textContent = padZero(hours);
    elMinutes.textContent = padZero(minutes);
    elSeconds.textContent = padZero(seconds);

    // Day Progress
    const totalSecondsToday = now.getHours() * 3600 + minutes * 60 + seconds;
    const dayProgress = ((totalSecondsToday / 86400) * 100).toFixed(1);
    elDayProgressVal.textContent = `${dayProgress}%`;
    elDayProgressFill.style.width = `${dayProgress}%`;

    // Calendar Date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    elDate.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // World clocks
    updateWorldClocks(now);
  }

  function initTimezone() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei';
      const offsetMin = -new Date().getTimezoneOffset();
      const offsetHrs = offsetMin / 60;
      const sign = offsetHrs >= 0 ? '+' : '';
      elTimezone.textContent = `${tz} (UTC${sign}${offsetHrs})`;
    } catch (e) {
      elTimezone.textContent = 'Asia/Taipei (UTC+8)';
    }
  }

  function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    lblFormat.textContent = is24HourFormat ? '24H' : '12H';
    localStorage.setItem(STORAGE_KEYS.TIME_FORMAT, is24HourFormat ? '24' : '12');
    tickClock();
  }

  function copyTimestamp() {
    const now = new Date();
    const isoString = now.toISOString();
    const localString = now.toLocaleString();
    const textToCopy = `Timestamp: ${isoString} (${localString})`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('ISO Timestamp copied to clipboard!');
      }).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Timestamp copied to clipboard!');
    } catch (err) {
      showToast('Copy failed.');
    }
    document.body.removeChild(textArea);
  }

  /* ==========================================================================
     Simulated Live Diagnostics Jitter
     ========================================================================== */

  function simulateTelemetryJitter() {
    setInterval(() => {
      if (telemetryLatency) {
        const jitter = Math.floor(12 + Math.random() * 6); // 12-17ms
        telemetryLatency.textContent = `${jitter} ms`;
      }
    }, 3500);
  }

  /* ==========================================================================
     Profile Modal Handlers
     ========================================================================== */

  function openModal() {
    inputName.value = userProfile.name;
    inputRole.value = userProfile.role;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    inputName.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     Interactive HTML5 Canvas Particle Physics Network
     ========================================================================== */

  function initParticleCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 18000), 75);

    const mouse = { x: null, y: null, maxDist: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 1.8 + 1,
        baseAlpha: Math.random() * 0.4 + 0.2
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      // Draw and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.baseAlpha})`;
        ctx.fill();

        // Connect with nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect with mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.maxDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 * (1 - mdist / mouse.maxDist)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderParticles);
    }

    requestAnimationFrame(renderParticles);
  }

  /* ==========================================================================
     Event Bindings & Initialization
     ========================================================================== */

  function bindEvents() {
    btnFormatToggle.addEventListener('click', toggleTimeFormat);
    btnCopyTime.addEventListener('click', copyTimestamp);
    btnQuickEdit.addEventListener('click', openModal);
    btnInlineRename.addEventListener('click', openModal);
    btnResetProfile.addEventListener('click', resetProfile);

    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });

    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveUserProfile(inputName.value, inputRole.value);
      closeModal();
    });
  }

  function init() {
    lblFormat.textContent = is24HourFormat ? '24H' : '12H';
    applyProfile();
    initTimezone();
    tickClock();
    setInterval(tickClock, 1000);
    setInterval(() => updateGreeting(new Date()), 60000);

    bindEvents();
    simulateTelemetryJitter();
    initParticleCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
