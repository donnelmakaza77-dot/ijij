/* ============================================================
   HabitFlow – App Logic
   ============================================================ */
'use strict';

// ── Constants ─────────────────────────────────────────────────
const STORAGE_KEY = 'habitflow_v1';
const DAY_MS = 86_400_000;

const ICONS = [
  '🏃','💧','📚','🧘','🥗','💪','🎨','🎵','✍️','🌿',
  '😴','☀️','🧹','💊','🚴','🏊','🍎','🧠','🫁','🫶',
  '📝','🐾','🌅','🎯','🏋️','🧘‍♀️','🚶','🥤','🍵','🌙',
];

const COLORS = [
  '#5b5ea6','#007aff','#34c759','#ff9500','#ff3b30',
  '#af52de','#ff2d55','#5ac8fa','#30d158','#ff6b35',
  '#64d2ff','#ffd60a','#32ade6','#6e4b7b','#00c7be',
];

const FREQ_LABELS = {
  daily:    'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
};

// ── State ─────────────────────────────────────────────────────
let state = {
  habits: [],
  completions: {},  // { 'YYYY-MM-DD': Set([habitId, ...]) }
  theme: 'light',
};

// ── Persistence ───────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.habits      = saved.habits      || [];
    state.completions = {};
    for (const [d, ids] of Object.entries(saved.completions || {})) {
      state.completions[d] = new Set(ids);
    }
    state.theme = saved.theme || 'light';
  } catch { /* ignore */ }
}

function saveState() {
  const serialisable = {
    habits: state.habits,
    completions: Object.fromEntries(
      Object.entries(state.completions).map(([d, s]) => [d, [...s]])
    ),
    theme: state.theme,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
}

// ── Date Helpers ──────────────────────────────────────────────
function todayKey() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    days.push({ date: d, key: dateKey(d), label: d.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1) });
  }
  return days;
}

function isTodayOrPast(key) {
  return key <= todayKey();
}

// ── Frequency Helpers ─────────────────────────────────────────
function habitAppliesOn(habit, date) {
  const dow = date.getDay(); // 0=Sun, 6=Sat
  if (habit.frequency === 'weekdays') return dow >= 1 && dow <= 5;
  if (habit.frequency === 'weekends') return dow === 0 || dow === 6;
  return true;
}

// ── Streak Calculation ────────────────────────────────────────
function calcStreak(habit) {
  let streak = 0;
  let d = new Date();
  const todayK = todayKey();

  // Walk backwards from today
  for (let i = 0; i < 365; i++) {
    const key = dateKey(d);
    if (key > todayK) { d = new Date(d - DAY_MS); continue; }

    if (!habitAppliesOn(habit, d)) {
      d = new Date(d - DAY_MS);
      continue;
    }
    const done = state.completions[key]?.has(habit.id);
    if (done) {
      streak++;
    } else if (key === todayK) {
      // Today not done yet – don't break streak
    } else {
      break;
    }
    d = new Date(d - DAY_MS);
  }
  return streak;
}

function completionRate(habit, days) {
  let applicable = 0;
  let done = 0;
  const todayK = todayKey();
  for (const { date, key } of days) {
    if (!habitAppliesOn(habit, date)) continue;
    if (key > todayK) continue;
    applicable++;
    if (state.completions[key]?.has(habit.id)) done++;
  }
  return applicable === 0 ? 0 : Math.round(done / applicable * 100);
}

// ── Toggle Completion ─────────────────────────────────────────
function toggleToday(habitId) {
  const key = todayKey();
  if (!state.completions[key]) state.completions[key] = new Set();
  if (state.completions[key].has(habitId)) {
    state.completions[key].delete(habitId);
  } else {
    state.completions[key].add(habitId);
  }
  saveState();
  renderToday();
}

// ── UUID ──────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Render: Today ─────────────────────────────────────────────
function getTodayHabits() {
  const today = new Date();
  return state.habits.filter(h => habitAppliesOn(h, today));
}

function renderToday() {
  const habits = getTodayHabits();
  const key    = todayKey();
  const list   = document.getElementById('today-habits');
  const empty  = document.getElementById('today-empty');
  const banner = document.getElementById('today-complete');

  // Update date label
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  if (habits.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    banner.classList.add('hidden');
    updateRing(0, 0);
    return;
  }

  empty.classList.add('hidden');

  const doneCount = habits.filter(h => state.completions[key]?.has(h.id)).length;
  updateRing(doneCount, habits.length);

  const allDone = doneCount === habits.length;
  if (allDone) {
    list.innerHTML = '';
    banner.classList.remove('hidden');
    return;
  }
  banner.classList.add('hidden');

  list.innerHTML = '';
  habits.forEach(habit => {
    const done = state.completions[key]?.has(habit.id);
    const streak = calcStreak(habit);

    const card = document.createElement('div');
    card.className = 'habit-card' + (done ? ' done' : '');
    card.setAttribute('role', 'checkbox');
    card.setAttribute('aria-checked', done ? 'true' : 'false');
    card.setAttribute('aria-label', habit.name);
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="habit-check">
        <span class="habit-check-tick">✓</span>
        <span class="habit-icon-inner" aria-hidden="true">${habit.icon}</span>
      </div>
      <div class="habit-icon-badge" style="background:${habit.color}22;">
        <span aria-hidden="true">${habit.icon}</span>
      </div>
      <div class="habit-info">
        <div class="habit-name">${escHtml(habit.name)}</div>
        <div class="habit-meta">
          <span class="habit-streak">🔥 ${streak} day streak</span>
          ${habit.note ? `<span class="habit-note-text">· ${escHtml(habit.note)}</span>` : ''}
        </div>
      </div>
    `;

    card.addEventListener('click', () => toggleToday(habit.id));
    card.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleToday(habit.id); }
    });

    list.appendChild(card);
  });
}

function updateRing(done, total) {
  const pct   = total === 0 ? 0 : Math.round(done / total * 100);
  const circ  = 163.4;
  const offset = circ - (circ * pct / 100);
  document.getElementById('ring-fill').style.strokeDashoffset = offset;
  document.getElementById('ring-pct').textContent = pct + '%';
}

// ── Render: Weekly ────────────────────────────────────────────
function renderWeekly() {
  const days   = last7Days();
  const habits = state.habits;
  const list   = document.getElementById('weekly-habits');
  const empty  = document.getElementById('weekly-empty');

  if (habits.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    document.getElementById('week-score-val').textContent = '0%';
    return;
  }
  empty.classList.add('hidden');

  // Overall week score
  let totalDone = 0, totalAppl = 0;
  const todayK = todayKey();
  habits.forEach(h => {
    days.forEach(({ date, key }) => {
      if (!habitAppliesOn(h, date) || key > todayK) return;
      totalAppl++;
      if (state.completions[key]?.has(h.id)) totalDone++;
    });
  });
  const weekPct = totalAppl === 0 ? 0 : Math.round(totalDone / totalAppl * 100);
  document.getElementById('week-score-val').textContent = weekPct + '%';

  list.innerHTML = '';
  habits.forEach(habit => {
    const rate = completionRate(habit, days);
    const card = document.createElement('div');
    card.className = 'weekly-habit-card';

    const dotsHtml = days.map(({ date, key }) => {
      const isToday   = key === todayK;
      const isFuture  = key > todayK;
      const applicable = habitAppliesOn(habit, date);
      const done       = state.completions[key]?.has(habit.id);

      let dotClass = 'week-dot';
      if (!applicable || isFuture) dotClass += ' future';
      else if (done) dotClass += ' completed';
      else dotClass += ' missed';
      if (isToday) dotClass += ' today-dot';

      const content = done ? '✓' : (isFuture || !applicable ? '' : '');
      return `<div class="week-dot-wrap">
        <div class="${dotClass}" title="${date.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}">${content}</div>
        <span class="week-day-label">${date.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1)}</span>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="weekly-habit-header">
        <div class="habit-icon-badge" style="background:${habit.color}22;width:36px;height:36px;border-radius:10px;">
          ${habit.icon}
        </div>
        <span class="weekly-habit-name">${escHtml(habit.name)}</span>
        <span class="weekly-pct">${rate}%</span>
      </div>
      <div class="week-dots">${dotsHtml}</div>
    `;
    list.appendChild(card);
  });
}

// ── Render: Stats ─────────────────────────────────────────────
function renderStats() {
  const habits = state.habits;
  const cardsEl  = document.getElementById('stats-cards');
  const habitsEl = document.getElementById('stats-habits');
  const emptyEl  = document.getElementById('stats-empty');

  if (habits.length === 0) {
    cardsEl.innerHTML = '';
    habitsEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  // Aggregate stats
  const todayK = todayKey();
  let totalCompletions = 0;
  let longestStreak = 0;
  let bestHabit = null;
  let bestRate = -1;

  // All-time completion days (30-day window)
  const allDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    allDays.push({ date: d, key: dateKey(d) });
  }

  habits.forEach(h => {
    const rate = completionRate(h, allDays);
    if (rate > bestRate) { bestRate = rate; bestHabit = h; }
    const streak = calcStreak(h);
    if (streak > longestStreak) longestStreak = streak;
    allDays.forEach(({ date, key }) => {
      if (!habitAppliesOn(h, date) || key > todayK) return;
      if (state.completions[key]?.has(h.id)) totalCompletions++;
    });
  });

  // Today completions
  const todayDone = habits.filter(h => state.completions[todayK]?.has(h.id)).length;
  const todayTotal = getTodayHabits().length;
  const todayPct = todayTotal === 0 ? 0 : Math.round(todayDone / todayTotal * 100);

  cardsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalCompletions}</div>
      <div class="stat-label">Total completions (30d)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${longestStreak}</div>
      <div class="stat-label">Longest streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${todayPct}%</div>
      <div class="stat-label">Today's score</div>
    </div>
  `;

  habitsEl.innerHTML = '';
  const sorted = [...habits].sort((a, b) => completionRate(b, allDays) - completionRate(a, allDays));
  sorted.forEach(habit => {
    const rate   = completionRate(habit, allDays);
    const streak = calcStreak(habit);
    const row = document.createElement('div');
    row.className = 'stats-habit-row';
    row.innerHTML = `
      <div class="habit-icon-badge" style="background:${habit.color}22;width:42px;height:42px;border-radius:12px;flex-shrink:0;">
        ${habit.icon}
      </div>
      <div class="stats-habit-info">
        <div class="stats-habit-name">${escHtml(habit.name)}</div>
        <div class="stats-bar-wrap">
          <div class="stats-bar-fill" style="width:${rate}%;background:${habit.color};"></div>
        </div>
      </div>
      <div class="stats-habit-right">
        <div class="stats-habit-pct" style="color:${habit.color};">${rate}%</div>
        <div class="stats-habit-streak">🔥 ${streak}d</div>
      </div>
    `;
    habitsEl.appendChild(row);
  });
}

// ── Render: Manage ────────────────────────────────────────────
function renderManage() {
  const list  = document.getElementById('manage-habits');
  const empty = document.getElementById('manage-empty');

  if (state.habits.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.innerHTML = '';

  state.habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = 'manage-habit-card';
    card.innerHTML = `
      <div class="habit-icon-badge" style="background:${habit.color}22;width:44px;height:44px;border-radius:12px;flex-shrink:0;font-size:22px;">
        ${habit.icon}
      </div>
      <div class="manage-habit-info">
        <div class="manage-habit-name">${escHtml(habit.name)}</div>
        <div class="manage-habit-freq">${FREQ_LABELS[habit.frequency] || 'Every day'}</div>
      </div>
      <button class="manage-edit-btn" aria-label="Edit ${escHtml(habit.name)}">✏️</button>
    `;

    card.querySelector('.manage-edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(habit.id);
    });
    card.addEventListener('click', () => openEditModal(habit.id));
    list.appendChild(card);
  });
}

// ── Render All ────────────────────────────────────────────────
function renderAll() {
  renderToday();
  renderWeekly();
  renderStats();
  renderManage();
}

// ── Navigation ────────────────────────────────────────────────
let currentView = 'today';

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelector(`.nav-item[data-view="${view}"]`).classList.add('active');

  // Re-render the activated view
  if (view === 'today')   renderToday();
  if (view === 'weekly')  renderWeekly();
  if (view === 'stats')   renderStats();
  if (view === 'manage')  renderManage();
}

// ── Modal State ───────────────────────────────────────────────
let editingId   = null;
let pickedIcon  = ICONS[0];
let pickedColor = COLORS[0];

function openAddModal() {
  editingId   = null;
  pickedIcon  = ICONS[0];
  pickedColor = COLORS[0];

  document.getElementById('modal-title').textContent = 'New Habit';
  document.getElementById('habit-name').value    = '';
  document.getElementById('habit-note').value    = '';
  document.getElementById('habit-frequency').value = 'daily';
  document.getElementById('delete-habit-btn').classList.add('hidden');

  refreshIconPicker();
  refreshColorPicker();
  document.getElementById('habit-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('habit-name').focus(), 80);
}

function openEditModal(id) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  editingId   = id;
  pickedIcon  = habit.icon;
  pickedColor = habit.color;

  document.getElementById('modal-title').textContent = 'Edit Habit';
  document.getElementById('habit-name').value    = habit.name;
  document.getElementById('habit-note').value    = habit.note || '';
  document.getElementById('habit-frequency').value = habit.frequency || 'daily';
  document.getElementById('delete-habit-btn').classList.remove('hidden');

  refreshIconPicker();
  refreshColorPicker();
  document.getElementById('habit-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('habit-name').focus(), 80);
}

function closeModal() {
  document.getElementById('habit-modal').classList.add('hidden');
  editingId = null;
}

function saveHabit() {
  const name = document.getElementById('habit-name').value.trim();
  if (!name) {
    document.getElementById('habit-name').focus();
    document.getElementById('habit-name').style.borderColor = 'var(--danger)';
    setTimeout(() => document.getElementById('habit-name').style.borderColor = '', 1200);
    return;
  }

  const frequency = document.getElementById('habit-frequency').value;
  const note      = document.getElementById('habit-note').value.trim();

  if (editingId) {
    const idx = state.habits.findIndex(h => h.id === editingId);
    if (idx !== -1) {
      state.habits[idx] = { ...state.habits[idx], name, icon: pickedIcon, color: pickedColor, frequency, note };
    }
  } else {
    state.habits.push({ id: uid(), name, icon: pickedIcon, color: pickedColor, frequency, note, createdAt: Date.now() });
  }

  saveState();
  closeModal();
  renderAll();
}

// ── Confirm Delete ────────────────────────────────────────────
let pendingDeleteId = null;

function promptDelete(id) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  pendingDeleteId = id;
  document.getElementById('confirm-habit-name').textContent = habit.name;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  state.habits = state.habits.filter(h => h.id !== pendingDeleteId);
  // Remove completions for this habit
  for (const s of Object.values(state.completions)) s.delete(pendingDeleteId);
  pendingDeleteId = null;
  saveState();
  document.getElementById('confirm-modal').classList.add('hidden');
  closeModal();
  renderAll();
}

// ── Icon / Color Pickers ──────────────────────────────────────
function refreshIconPicker() {
  const picker = document.getElementById('icon-picker');
  picker.innerHTML = '';
  ICONS.forEach(icon => {
    const btn = document.createElement('button');
    btn.className = 'icon-btn' + (icon === pickedIcon ? ' selected' : '');
    btn.textContent = icon;
    btn.type = 'button';
    btn.setAttribute('aria-label', icon);
    btn.addEventListener('click', () => { pickedIcon = icon; refreshIconPicker(); });
    picker.appendChild(btn);
  });
}

function refreshColorPicker() {
  const picker = document.getElementById('color-picker');
  picker.innerHTML = '';
  COLORS.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch' + (color === pickedColor ? ' selected' : '');
    swatch.style.background = color;
    swatch.style.color      = color;
    swatch.setAttribute('aria-label', color);
    swatch.setAttribute('role', 'radio');
    swatch.setAttribute('aria-checked', color === pickedColor ? 'true' : 'false');
    swatch.addEventListener('click', () => { pickedColor = color; refreshColorPicker(); });
    picker.appendChild(swatch);
  });
}

// ── Theme ─────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').querySelector('.theme-icon').textContent =
    theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.theme);
  saveState();
}

// ── Escape HTML ───────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Seed Demo Data ────────────────────────────────────────────
function seedDemoData() {
  if (state.habits.length > 0) return;

  const demos = [
    { name: 'Morning run',      icon: '🏃', color: '#007aff', frequency: 'daily',    note: '30 minutes' },
    { name: 'Drink 8 glasses',  icon: '💧', color: '#5ac8fa', frequency: 'daily',    note: 'Stay hydrated!' },
    { name: 'Read 20 minutes',  icon: '📚', color: '#af52de', frequency: 'daily',    note: '' },
    { name: 'Meditate',         icon: '🧘', color: '#34c759', frequency: 'daily',    note: '10 mins' },
    { name: 'Weekly planning',  icon: '📝', color: '#ff9500', frequency: 'weekdays', note: 'Monday mornings' },
  ];

  demos.forEach(d => state.habits.push({ id: uid(), ...d, createdAt: Date.now() }));

  // Seed some completions for the past 7 days
  const todayK = todayKey();
  for (let i = 6; i >= 1; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const k = dateKey(d);
    state.completions[k] = new Set();
    state.habits.forEach((h, idx) => {
      if (!habitAppliesOn(h, d)) return;
      if (Math.random() > 0.25) state.completions[k].add(h.id);
    });
  }

  saveState();
}

// ── Init ──────────────────────────────────────────────────────
function init() {
  loadState();
  applyTheme(state.theme);
  seedDemoData();

  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Modal buttons
  document.getElementById('open-add-modal').addEventListener('click', openAddModal);
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-modal').addEventListener('click', closeModal);
  document.getElementById('save-habit-btn').addEventListener('click', saveHabit);
  document.getElementById('delete-habit-btn').addEventListener('click', () => {
    if (editingId) promptDelete(editingId);
  });

  // Confirm delete
  document.getElementById('confirm-cancel').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('hidden');
    pendingDeleteId = null;
  });
  document.getElementById('confirm-delete').addEventListener('click', confirmDelete);

  // Close modal on overlay click
  document.getElementById('habit-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('habit-modal')) closeModal();
  });
  document.getElementById('confirm-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('confirm-modal')) {
      document.getElementById('confirm-modal').classList.add('hidden');
      pendingDeleteId = null;
    }
  });

  // Keyboard: Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      document.getElementById('confirm-modal').classList.add('hidden');
    }
    if (e.key === 'Enter' && !document.getElementById('habit-modal').classList.contains('hidden')) {
      if (document.activeElement !== document.getElementById('save-habit-btn')) saveHabit();
    }
  });

  // Enter in name field saves
  document.getElementById('habit-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveHabit();
  });

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
