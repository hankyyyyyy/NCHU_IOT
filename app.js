/**
 * Hank Chang - Personal Horizon & IoT Space
 * Interactive Starfield Simulation, Precision Dual Clock & Memo State
 */

(function () {
  'use strict';

  // --- Defaults & Storage Keys ---
  const DEFAULT_PROFILE = {
    name: 'Hank Chang',
    bio: '專注於物聯網系統開發、嵌入式微控制器與邊緣智能運算。熱衷將傳感器數據轉化為具備即時洞察力的實體系統。'
  };

  const STORAGE = {
    PROFILE: 'hank_horizon_profile',
    FORMAT_24: 'hank_horizon_24h',
    MEMO: 'hank_horizon_memo'
  };

  // --- State ---
  let is24Hour = localStorage.getItem(STORAGE.FORMAT_24) !== 'false';
  let profile = loadProfile();

  // --- DOM Elements ---
  const el = {
    authorName: document.getElementById('author-name'),
    authorBio: document.getElementById('author-bio'),
    avatarDisplay: document.getElementById('avatar-display'),
    solarIcon: document.getElementById('solar-icon'),
    greetingMsg: document.getElementById('greeting-msg'),

    clockHr: document.getElementById('clock-hr'),
    clockMin: document.getElementById('clock-min'),
    clockSec: document.getElementById('clock-sec'),
    clockAmpm: document.getElementById('clock-ampm'),
    calendarDate: document.getElementById('calendar-date'),
    dayPercent: document.getElementById('day-percent'),
    dayProgressBar: document.getElementById('day-progress-bar'),

    timeFormatBtn: document.getElementById('time-format-btn'),
    formatText: document.getElementById('format-text'),
    copyStampBtn: document.getElementById('copy-stamp-btn'),
    customizeTriggerBtn: document.getElementById('customize-trigger-btn'),
    backToTopBtn: document.getElementById('back-to-top'),

    // World clocks
    timeTokyo: document.getElementById('time-tokyo'),
    timeLondon: document.getElementById('time-london'),
    timeNy: document.getElementById('time-ny'),
    timeSf: document.getElementById('time-sf'),

    // Memo
    memoTextarea: document.getElementById('memo-textarea'),
    memoStatus: document.getElementById('memo-status'),
    clearMemoBtn: document.getElementById('clear-memo-btn'),

    // Toast
    toast: document.getElementById('toast'),
    toastTxt: document.getElementById('toast-txt'),

    // Modal
    profileModal: document.getElementById('profile-modal'),
    modalClose: document.getElementById('modal-close'),
    modalCancel: document.getElementById('modal-cancel'),
    profileForm: document.getElementById('profile-form'),
    formName: document.getElementById('form-name'),
    formBio: document.getElementById('form-bio')
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

  function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function renderProfile() {
    el.authorName.textContent = profile.name;
    el.authorBio.textContent = profile.bio;
    el.avatarDisplay.textContent = getInitials(profile.name);
  }

  function saveProfile(name, bio) {
    profile = {
      name: name.trim() || DEFAULT_PROFILE.name,
      bio: bio.trim() || DEFAULT_PROFILE.bio
    };
    try {
      localStorage.setItem(STORAGE.PROFILE, JSON.stringify(profile));
    } catch (e) {}
    renderProfile();
    showToast('個人資料已成功儲存！');
  }

  /* ==========================================================================
     Time & Solar Telemetry Engine
     ========================================================================== */

  function pad(num) {
    return num < 10 ? '0' + num : num.toString();
  }

  function updateSolarGreeting(hour) {
    let icon = '☀️';
    let msg = '午安，保持專注與熱情';

    if (hour >= 5 && hour < 9) {
      icon = '🌅';
      msg = '早安，迎接嶄新的晨曦';
    } else if (hour >= 9 && hour < 12) {
      icon = '🌤️';
      msg = '上午好，探索物聯網世界';
    } else if (hour >= 12 && hour < 14) {
      icon = '☀️';
      msg = '正午時分，享受美味午餐與休息';
    } else if (hour >= 14 && hour < 18) {
      icon = '⛅';
      msg = '下午好，持續推進開發專案';
    } else if (hour >= 18 && hour < 22) {
      icon = '🌇';
      msg = '日落暮色，沉澱今日的研究成果';
    } else {
      icon = '🌙';
      msg = '深夜星空，適度休息保持身心健康';
    }

    el.solarIcon.textContent = icon;
    el.greetingMsg.textContent = `${msg} • ${profile.name}`;
  }

  function updateWorldClocks(now) {
    const opts = { hour: '2-digit', minute: '2-digit', hour12: !is24Hour };
    try {
      if (el.timeTokyo) el.timeTokyo.textContent = new Intl.DateTimeFormat('zh-TW', { ...opts, timeZone: 'Asia/Tokyo' }).format(now);
      if (el.timeLondon) el.timeLondon.textContent = new Intl.DateTimeFormat('zh-TW', { ...opts, timeZone: 'Europe/London' }).format(now);
      if (el.timeNy) el.timeNy.textContent = new Intl.DateTimeFormat('zh-TW', { ...opts, timeZone: 'America/New_York' }).format(now);
      if (el.timeSf) el.timeSf.textContent = new Intl.DateTimeFormat('zh-TW', { ...opts, timeZone: 'America/Los_Angeles' }).format(now);
    } catch (e) {}
  }

  function tick() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 12/24 hour display
    if (is24Hour) {
      el.clockAmpm.classList.add('hidden');
    } else {
      el.clockAmpm.classList.remove('hidden');
      const isPm = hours >= 12;
      el.clockAmpm.textContent = isPm ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }

    el.clockHr.textContent = pad(hours);
    el.clockMin.textContent = pad(minutes);
    el.clockSec.textContent = pad(seconds);

    // Day completion percentage
    const secondsPassed = now.getHours() * 3600 + minutes * 60 + seconds;
    const dayProgress = ((secondsPassed / 86400) * 100).toFixed(1);
    el.dayPercent.textContent = `${dayProgress}%`;
    el.dayProgressBar.style.width = `${dayProgress}%`;

    // Calendar Date in Traditional Chinese
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    el.calendarDate.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;

    updateSolarGreeting(now.getHours());
    updateWorldClocks(now);
  }

  function toggleFormat() {
    is24Hour = !is24Hour;
    localStorage.setItem(STORAGE.FORMAT_24, is24Hour);
    el.formatText.textContent = is24Hour ? '24H 模式' : '12H 模式';
    tick();
  }

  function copyTimestamp() {
    const now = new Date();
    const text = `Hank Chang IoT Horizon Timestamp: ${now.toISOString()} (${now.toLocaleString('zh-TW')})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('已成功複製 ISO 時間戳記！');
      }).catch(() => {
        showToast('時間已產生：' + now.toLocaleTimeString());
      });
    } else {
      showToast('時間已產生：' + now.toLocaleTimeString());
    }
  }

  /* ==========================================================================
     Interactive Memo Pad
     ========================================================================== */

  function initMemo() {
    const saved = localStorage.getItem(STORAGE.MEMO);
    if (saved) el.memoTextarea.value = saved;

    let timeout = null;
    el.memoTextarea.addEventListener('input', () => {
      el.memoStatus.textContent = '儲存中...';
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(STORAGE.MEMO, el.memoTextarea.value);
        el.memoStatus.textContent = '已自動儲存至本地';
      }, 500);
    });

    el.clearMemoBtn.addEventListener('click', () => {
      el.memoTextarea.value = '';
      localStorage.removeItem(STORAGE.MEMO);
      el.memoStatus.textContent = '筆記已清空';
    });
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */

  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    el.toastTxt.textContent = msg;
    el.toast.classList.add('show');
    toastTimer = setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     Profile Settings Modal
     ========================================================================== */

  function openModal() {
    el.formName.value = profile.name;
    el.formBio.value = profile.bio;
    el.profileModal.classList.add('open');
    el.profileModal.setAttribute('aria-hidden', 'false');
    el.formName.focus();
  }

  function closeModal() {
    el.profileModal.classList.remove('open');
    el.profileModal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     Dynamic Cosmic Starfield Physics Simulation
     ========================================================================== */

  function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const stars = [];
    const count = Math.min(Math.floor((width * height) / 12000), 80);

    const mouse = { x: null, y: null, radius: 160 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.4 ? 'rgba(255, 165, 2,' : 'rgba(255, 107, 107,'
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Gravitational mouse attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 0.5;
            s.x += (dx / dist) * force;
            s.y += (dy / dist) * force;
          }
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.fill();

        // Connect nearby cosmic dust
        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `rgba(255, 165, 2, ${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  /* ==========================================================================
     Events & Bootstrap
     ========================================================================== */

  function bindEvents() {
    el.timeFormatBtn.addEventListener('click', toggleFormat);
    el.copyStampBtn.addEventListener('click', copyTimestamp);
    el.customizeTriggerBtn.addEventListener('click', openModal);
    el.modalClose.addEventListener('click', closeModal);
    el.modalCancel.addEventListener('click', closeModal);
    el.profileModal.addEventListener('click', (e) => {
      if (e.target === el.profileModal) closeModal();
    });

    el.profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile(el.formName.value, el.formBio.value);
      closeModal();
    });

    el.backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function init() {
    renderProfile();
    el.formatText.textContent = is24Hour ? '24H 模式' : '12H 模式';
    tick();
    setInterval(tick, 1000);

    bindEvents();
    initMemo();
    initStarfield();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
