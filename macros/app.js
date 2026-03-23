/* ============================================================
   Macros — Macro Tracking PWA
   Supabase backend with localStorage fallback
   ============================================================ */

const SUPABASE_URL = 'https://xfmcweloaladfnmfvkuk.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbWN3ZWxvYWxhZGZubWZ2a3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzIwNDMsImV4cCI6MjA4OTU0ODA0M30.q2W-rI7wwdFMyYTiQEA301z69qiVi3OgZb8cYmGBU6I';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── State ────────────────────────────────────────────────────
let currentUser = null;
let currentDate = new Date();
let settings = null;
let foods = [];
let log = [];
let waterCups = 0;
let useSupabase = true;
let currentMeal = 'breakfast';
let selectedFood = null;
let servingsCount = 1;
let statsRange = 'week';

const MEALS = ['coffee', 'breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABELS = { coffee: 'Coffee', breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const CATEGORIES = ['all', 'coffee', 'breakfast', 'lunch', 'dinner', 'snack', 'ingredient'];
const TAGS = ['all', 'homemade', 'quick', 'takeout', 'hungryroot'];

const DEFAULT_SETTINGS = {
  weight_lbs: null, height_in: null, body_fat_pct: null,
  mode: 'recomp',
  cal_target_low: 1800, cal_target_high: 2000,
  protein_target_low: 94, protein_target_high: 134,
  carb_target: 225, fat_target: 60, fiber_target: 28,
  sodium_limit: 2000, avg_steps: 8000, workouts_per_week: 4, zone2_min_per_week: 90
};

const MODE_PRESETS = {
  recomp:      { cal_target_low:1800, cal_target_high:2000, protein_target_low:94,  protein_target_high:134, carb_target:225, fat_target:60,  fiber_target:28 },
  cutting:     { cal_target_low:1500, cal_target_high:1700, protein_target_low:120, protein_target_high:134, carb_target:150, fat_target:50,  fiber_target:28 },
  maintenance: { cal_target_low:1900, cal_target_high:2100, protein_target_low:94,  protein_target_high:120, carb_target:225, fat_target:65,  fiber_target:28 },
  marathon:    { cal_target_low:2200, cal_target_high:2500, protein_target_low:94,  protein_target_high:120, carb_target:300, fat_target:70,  fiber_target:30 }
};

const SEED_FOODS = [
  { name:'Large Egg', category:'breakfast', serving_label:'1 large egg', calories:72, protein:6.2, carbs:0.4, fat:5, fiber:0, sodium:71, tags:['quick'] },
  { name:'Turkey Sausage Patty', category:'breakfast', serving_label:'1 patty (56g)', calories:108, protein:11, carbs:1, fat:7, fiber:0, sodium:340, tags:['quick'] },
  { name:'Sourdough Toast', category:'breakfast', serving_label:'1 slice', calories:96, protein:3.9, carbs:18, fat:1, fiber:1, sodium:170, tags:['quick'] },
  { name:'Half Avocado', category:'breakfast', serving_label:'1/2 avocado', calories:109, protein:1.4, carbs:6, fat:10, fiber:5, sodium:5, tags:['quick'] },
  { name:'Shredded Cheese', category:'ingredient', serving_label:'28g', calories:113, protein:6.4, carbs:1.5, fat:9, fiber:0, sodium:180, tags:['quick'] },
  { name:'Flour Tortilla', category:'ingredient', serving_label:'1 tortilla', calories:140, protein:3.7, carbs:24, fat:3.5, fiber:1, sodium:330, tags:['quick'] },
  { name:'Greek Yogurt', category:'breakfast', serving_label:'1 container', calories:120, protein:15, carbs:11, fat:2, fiber:0, sodium:55, tags:['quick'] },
  { name:'Protein Shake', category:'snack', serving_label:'1 shake', calories:220, protein:40, carbs:12, fat:3, fiber:6, sodium:200, tags:['quick'] },
  { name:'Drip Coffee + Whole Milk', category:'coffee', serving_label:'1 cup', calories:40, protein:2, carbs:3, fat:2, fiber:0, sodium:18, tags:['quick'] },
  { name:'Cold Brew + Whole Milk', category:'coffee', serving_label:'1 cup', calories:80, protein:4, carbs:6, fat:4, fiber:0, sodium:26, tags:['quick'] },
  { name:'Grilled Chicken Breast', category:'lunch', serving_label:'6 oz', calories:280, protein:52, carbs:0, fat:6, fiber:0, sodium:120, tags:['quick'] },
  { name:'Brown Rice', category:'lunch', serving_label:'1 cup cooked', calories:216, protein:5, carbs:45, fat:1.8, fiber:3.5, sodium:10, tags:['quick'] },
  { name:'Salmon Fillet', category:'dinner', serving_label:'6 oz', calories:350, protein:38, carbs:0, fat:21, fiber:0, sodium:75, tags:[] },
  { name:'Sweet Potato', category:'dinner', serving_label:'1 medium', calories:103, protein:2.3, carbs:24, fat:0.1, fiber:3.8, sodium:41, tags:['quick'] },
  { name:'Poke Bowl', category:'lunch', serving_label:'1 bowl', calories:550, protein:35, carbs:55, fat:18, fiber:4, sodium:900, tags:['takeout'] },
  { name:'Chia Pudding w/ Raspberries', category:'snack', serving_label:'1 bowl', calories:313, protein:20, carbs:32, fat:12, fiber:14, sodium:30, tags:['homemade'] },
  { name:'Hungryroot Meal (avg)', category:'dinner', serving_label:'1 meal', calories:450, protein:30, carbs:40, fat:18, fiber:6, sodium:650, tags:['hungryroot'] },
  { name:'Oatmeal with Berries', category:'breakfast', serving_label:'1 bowl', calories:280, protein:8, carbs:48, fat:6, fiber:5, sodium:10, tags:['quick'] },
  { name:'Hummus + Veggies', category:'snack', serving_label:'1 serving', calories:180, protein:5, carbs:18, fat:10, fiber:4, sodium:300, tags:['quick'] },
  { name:'Trail Mix', category:'snack', serving_label:'1/4 cup', calories:175, protein:5, carbs:15, fat:12, fiber:2, sodium:45, tags:['quick'] }
];

// ─── Utilities ────────────────────────────────────────────────
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
const fmtDate = d => d.toISOString().slice(0, 10);
const fmtDisplay = d => d.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
const n = v => Number(v) || 0;
const uid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c === 'x' ? r : (r&0x3|0x8)).toString(16); });

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ─── Data Layer (Supabase with localStorage fallback) ────────
const LS = {
  get(key) { try { return JSON.parse(localStorage.getItem('macros_' + key)); } catch { return null; } },
  set(key, val) { localStorage.setItem('macros_' + key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem('macros_' + key); }
};

function isMissingTable(error) {
  if (!error) return false;
  const msg = (error.message || '') + (error.code || '');
  return msg.includes('42P01') || msg.includes('relation') || msg.includes('does not exist');
}

async function dbGetSettings() {
  if (useSupabase) {
    const { data, error } = await sb.from('macro_settings').select('*').eq('user_id', currentUser.id).single();
    if (!error && data) return data;
    if (error && error.code === 'PGRST116') return null;
    if (isMissingTable(error)) useSupabase = false;
  }
  return LS.get('settings_' + currentUser.id);
}

async function dbSaveSettings(s) {
  const row = { ...s, user_id: currentUser.id, updated_at: new Date().toISOString() };
  if (useSupabase) {
    const { error } = await sb.from('macro_settings').upsert(row, { onConflict: 'user_id' });
    if (isMissingTable(error)) useSupabase = false;
    else if (!error) { LS.set('settings_' + currentUser.id, row); return; }
  }
  LS.set('settings_' + currentUser.id, row);
}

async function dbGetFoods() {
  if (useSupabase) {
    const { data, error } = await sb.from('macro_foods').select('*').eq('user_id', currentUser.id).order('name');
    if (!error) { LS.set('foods_' + currentUser.id, data); return data; }
    if (isMissingTable(error)) useSupabase = false;
  }
  return LS.get('foods_' + currentUser.id) || [];
}

async function dbAddFood(food) {
  const row = { ...food, id: food.id || uid(), user_id: currentUser.id, created_at: new Date().toISOString() };
  if (useSupabase) {
    const { error } = await sb.from('macro_foods').insert(row);
    if (isMissingTable(error)) useSupabase = false;
    else if (!error) { foods.push(row); LS.set('foods_' + currentUser.id, foods); return row; }
  }
  foods.push(row);
  LS.set('foods_' + currentUser.id, foods);
  return row;
}

async function dbUpdateFood(id, updates) {
  if (useSupabase) {
    const { error } = await sb.from('macro_foods').update(updates).eq('id', id).eq('user_id', currentUser.id);
    if (isMissingTable(error)) useSupabase = false;
  }
  const idx = foods.findIndex(f => f.id === id);
  if (idx >= 0) Object.assign(foods[idx], updates);
  LS.set('foods_' + currentUser.id, foods);
}

async function dbDeleteFood(id) {
  if (useSupabase) {
    await sb.from('macro_foods').delete().eq('id', id).eq('user_id', currentUser.id);
  }
  foods = foods.filter(f => f.id !== id);
  LS.set('foods_' + currentUser.id, foods);
}

async function dbGetLog(date) {
  if (useSupabase) {
    const { data, error } = await sb.from('macro_log').select('*').eq('user_id', currentUser.id).eq('date', date).order('created_at');
    if (!error) return data;
    if (isMissingTable(error)) useSupabase = false;
  }
  const all = LS.get('log_' + currentUser.id) || [];
  return all.filter(l => l.date === date);
}

async function dbGetLogRange(startDate, endDate) {
  if (useSupabase) {
    const { data, error } = await sb.from('macro_log').select('*').eq('user_id', currentUser.id).gte('date', startDate).lte('date', endDate).order('date');
    if (!error) return data;
    if (isMissingTable(error)) useSupabase = false;
  }
  const all = LS.get('log_' + currentUser.id) || [];
  return all.filter(l => l.date >= startDate && l.date <= endDate);
}

async function dbAddLog(entry) {
  const row = { ...entry, id: entry.id || uid(), user_id: currentUser.id, date: fmtDate(currentDate), created_at: new Date().toISOString() };
  // Remove tags from the row before inserting to macro_log (not a column there)
  const { tags, ...dbRow } = row;
  if (useSupabase) {
    const { error } = await sb.from('macro_log').insert(dbRow);
    if (isMissingTable(error)) useSupabase = false;
    else if (!error) {
      log.push({...row});
      const all = LS.get('log_' + currentUser.id) || [];
      all.push(row);
      LS.set('log_' + currentUser.id, all);
      return row;
    }
  }
  log.push({...row});
  const all = LS.get('log_' + currentUser.id) || [];
  all.push(row);
  LS.set('log_' + currentUser.id, all);
  return row;
}

async function dbRemoveLog(id) {
  if (useSupabase) {
    await sb.from('macro_log').delete().eq('id', id).eq('user_id', currentUser.id);
  }
  log = log.filter(l => l.id !== id);
  const all = LS.get('log_' + currentUser.id) || [];
  LS.set('log_' + currentUser.id, all.filter(l => l.id !== id));
}

async function dbGetWater(date) {
  if (useSupabase) {
    const { data, error } = await sb.from('macro_water').select('*').eq('user_id', currentUser.id).eq('date', date).single();
    if (!error && data) return n(data.cups);
    if (error && error.code === 'PGRST116') return 0;
    if (isMissingTable(error)) useSupabase = false;
  }
  const w = LS.get('water_' + currentUser.id) || {};
  return n(w[date]);
}

async function dbSaveWater(date, cups) {
  if (useSupabase) {
    const { error } = await sb.from('macro_water').upsert({ user_id: currentUser.id, date, cups, updated_at: new Date().toISOString() }, { onConflict: 'user_id,date' });
    if (isMissingTable(error)) useSupabase = false;
    else if (!error) { const w = LS.get('water_' + currentUser.id) || {}; w[date] = cups; LS.set('water_' + currentUser.id, w); return; }
  }
  const w = LS.get('water_' + currentUser.id) || {};
  w[date] = cups;
  LS.set('water_' + currentUser.id, w);
}

// ─── Auth ────────────────────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await enterApp();
  }
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && !currentUser) {
      currentUser = session.user;
      await enterApp();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      showAuth();
    }
  });
}

let isSignUp = false;
$('#auth-toggle-link').addEventListener('click', e => {
  e.preventDefault();
  isSignUp = !isSignUp;
  $('#auth-submit').textContent = isSignUp ? 'Sign Up' : 'Log In';
  $('#auth-toggle-text').textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
  $('#auth-toggle-link').textContent = isSignUp ? 'Log In' : 'Sign Up';
  $('#auth-error').textContent = '';
});

$('#auth-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#auth-email').value.trim();
  const password = $('#auth-password').value;
  $('#auth-error').textContent = '';
  $('#auth-submit').disabled = true;
  $('#auth-submit').textContent = 'Loading...';

  let result;
  if (isSignUp) {
    result = await sb.auth.signUp({ email, password });
  } else {
    result = await sb.auth.signInWithPassword({ email, password });
  }
  if (result.error) {
    $('#auth-error').textContent = result.error.message;
  }
  $('#auth-submit').disabled = false;
  $('#auth-submit').textContent = isSignUp ? 'Sign Up' : 'Log In';
});

$('#auth-forgot').addEventListener('click', e => {
  e.preventDefault();
  $('#forgot-modal').classList.add('active');
  $('#forgot-email').value = $('#auth-email').value;
});
$('#forgot-close').addEventListener('click', () => $('#forgot-modal').classList.remove('active'));
$('#forgot-form').addEventListener('submit', async e => {
  e.preventDefault();
  const { error } = await sb.auth.resetPasswordForEmail($('#forgot-email').value.trim());
  $('#forgot-msg').textContent = error ? error.message : 'Reset link sent! Check your email.';
});

function showAuth() {
  $('#auth-screen').classList.add('active');
  $('#app-screen').classList.remove('active');
}

async function enterApp() {
  $('#auth-screen').classList.remove('active');
  $('#app-screen').classList.add('active');

  // Check if Supabase tables exist
  await checkSupabaseTables();

  // Load settings
  settings = await dbGetSettings();
  if (!settings) {
    settings = { ...DEFAULT_SETTINGS };
    await dbSaveSettings(settings);
    await seedFoods();
  }

  foods = await dbGetFoods();
  await loadDay();
  renderSettings();
}

async function checkSupabaseTables() {
  const { error } = await sb.from('macro_settings').select('user_id').limit(1);
  if (isMissingTable(error)) {
    useSupabase = false;
    console.warn('Supabase macro tables not found, using localStorage');
  }
}

async function seedFoods() {
  for (const f of SEED_FOODS) {
    await dbAddFood({ ...f, is_recipe: false, recipe_ingredients: null, usda_fdc_id: null });
  }
}

// ─── Navigation ──────────────────────────────────────────────
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.page').forEach(p => p.classList.remove('active'));
    $(`#page-${page}`).classList.add('active');
    if (page === 'stats') renderStats();
    if (page === 'library') renderLibrary();
    if (page === 'settings') renderSettings();
  });
});

// ─── Date Navigation ─────────────────────────────────────────
$('#prev-day').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); loadDay(); });
$('#next-day').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); loadDay(); });

async function loadDay() {
  $('#date-display').textContent = fmtDisplay(currentDate);
  log = await dbGetLog(fmtDate(currentDate));
  waterCups = await dbGetWater(fmtDate(currentDate));
  renderHome();
}

// ─── Home Rendering ──────────────────────────────────────────
function getTotals() {
  return log.reduce((t, l) => ({
    calories: t.calories + n(l.calories) * n(l.servings || 1),
    protein: t.protein + n(l.protein) * n(l.servings || 1),
    carbs: t.carbs + n(l.carbs) * n(l.servings || 1),
    fat: t.fat + n(l.fat) * n(l.servings || 1),
    fiber: t.fiber + n(l.fiber) * n(l.servings || 1),
    sodium: t.sodium + n(l.sodium) * n(l.servings || 1)
  }), { calories:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0 });
}

function renderHome() {
  const t = getTotals();
  renderCalorieGauge(t.calories);
  renderMacroGauges(t);
  renderSodium(t.sodium);
  renderWater();
  renderMeals();
  updateModeBadge();
}

function updateModeBadge() {
  const badge = $('#mode-badge');
  const mode = settings?.mode || 'recomp';
  const totals = getTotals();
  const high = n(settings?.cal_target_high) || 2000;
  badge.className = 'mode-badge';
  if (totals.calories > high) {
    badge.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + ' Mode · Over Range';
    badge.classList.add('over');
  } else {
    badge.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + ' Mode';
    if (mode === 'cutting') badge.classList.add('cutting');
  }
}

function renderCalorieGauge(eaten) {
  const low = n(settings?.cal_target_low) || 1800;
  const high = n(settings?.cal_target_high) || 2000;
  const max = high * 1.3;
  const pct = Math.min(eaten / max, 1);

  const arc = $('#cal-arc');
  // The background arc length (for the half-circle from M 20 110 A 80 80 0 0 1 180 110)
  // Arc length = r * theta. r=80, theta=PI => arcLen = 80*PI ≈ 251.3
  const arcLen = 80 * Math.PI;
  const fillLen = arcLen * pct;
  arc.setAttribute('stroke-dasharray', `${fillLen} ${arcLen * 2}`);

  // Color
  let color = '#10b981';
  if (eaten > high) color = '#ef4444';
  else if (eaten >= low && eaten <= high) color = '#10b981';
  else if (eaten > low * 0.85) color = '#f59e0b';
  arc.setAttribute('stroke', color);

  // Range labels positioned on the arc
  // The arc goes from angle PI (left) to 0 (right), center at (100, 110), r=80
  function posOnArc(val) {
    const p = Math.min(val / max, 1);
    const angle = Math.PI * (1 - p); // PI=left, 0=right
    return { x: 100 + 88 * Math.cos(angle), y: 110 + 88 * Math.sin(angle) };
  }
  const lp = posOnArc(low);
  const hp = posOnArc(high);
  const lowLabel = $('#cal-low-label');
  const highLabel = $('#cal-high-label');
  lowLabel.setAttribute('x', lp.x - 8);
  lowLabel.setAttribute('y', lp.y - 4);
  lowLabel.textContent = low;
  highLabel.setAttribute('x', hp.x - 8);
  highLabel.setAttribute('y', hp.y - 4);
  highLabel.textContent = high;

  // Center text
  $('#cal-eaten').textContent = Math.round(eaten);
  const label = $('.calorie-label');
  label.textContent = 'eaten';
  label.style.color = color;
}

function renderMacroGauges(t) {
  const gauges = [
    { id: 'gauge-protein', value: t.protein, target: n(settings?.protein_target_high) || 134, label: 'Prot' },
    { id: 'gauge-carbs', value: t.carbs, target: n(settings?.carb_target) || 225, label: 'Carb' },
    { id: 'gauge-fat', value: t.fat, target: n(settings?.fat_target) || 60, label: 'Fat' },
    { id: 'gauge-fiber', value: t.fiber, target: n(settings?.fiber_target) || 28, label: 'Fib' }
  ];
  // Mini arc: M 6 36 A 24 24 0 0 1 54 36, r=24, theta=PI => arcLen=24*PI
  const arcLen = 24 * Math.PI;
  gauges.forEach(g => {
    const el = $(`#${g.id}`);
    const pct = Math.min(g.value / (g.target * 1.3), 1);
    const arc = $('.mini-arc', el);
    arc.setAttribute('stroke-dasharray', `${arcLen * pct} ${arcLen * 2}`);

    let color = '#10b981';
    if (g.value > g.target * 1.1) color = '#f59e0b';
    if (g.value > g.target * 1.3) color = '#ef4444';
    arc.setAttribute('stroke', color);

    $('.mini-value', el).textContent = Math.round(g.value) + 'g';
    $('.mini-label', el).textContent = g.label;
    $('.mini-target', el).textContent = `${Math.round(g.value)} / ${Math.round(g.target)}g`;
  });
}

function renderSodium(sodium) {
  const limit = n(settings?.sodium_limit) || 2000;
  const pct = Math.min(sodium / (limit * 1.2), 1) * 100;
  const bar = $('#sodium-bar');
  bar.style.width = pct + '%';
  bar.className = 'sodium-bar-fill';
  if (sodium > limit) bar.classList.add('danger');
  else if (sodium > limit * 0.8) bar.classList.add('warn');

  $('#sodium-value').textContent = `${Math.round(sodium)} / ${limit}mg`;
  $('#sodium-warning').style.display = sodium > limit ? 'flex' : 'none';
}

function renderWater() {
  const container = $('#water-cups');
  container.innerHTML = '';
  const total = Math.max(waterCups, 8);
  for (let i = 0; i < total; i++) {
    const cup = document.createElement('div');
    cup.className = 'water-cup' + (i < waterCups ? ' filled' : '');
    cup.textContent = '💧';
    container.appendChild(cup);
  }
  $('#water-count').textContent = waterCups + ' cup' + (waterCups !== 1 ? 's' : '');
}

$('#water-add').addEventListener('click', async () => {
  waterCups++;
  await dbSaveWater(fmtDate(currentDate), waterCups);
  renderWater();
});

function renderMeals() {
  const container = $('#meals-section');
  container.innerHTML = '';
  MEALS.forEach(meal => {
    const items = log.filter(l => l.meal === meal);
    const mealCal = items.reduce((s, i) => s + n(i.calories) * n(i.servings || 1), 0);
    const mealProt = items.reduce((s, i) => s + n(i.protein) * n(i.servings || 1), 0);

    // Look up tags from food library for each item
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.innerHTML = `
      <div class="meal-header">
        <div class="meal-header-left">
          <span class="meal-name">${MEAL_LABELS[meal]}</span>
          ${items.length ? `<span class="meal-total">${Math.round(mealCal)} cal · P: ${Math.round(mealProt)}g</span>` : ''}
        </div>
        <button class="meal-add-btn" data-meal="${meal}" aria-label="Add food to ${MEAL_LABELS[meal]}">+</button>
      </div>
      <div class="meal-items">
        ${items.length === 0 ? `<div class="meal-empty">Empty. Tap + to add.</div>` :
          items.map(item => {
            const sv = n(item.servings || 1);
            // Find tags from library food
            const libFood = item.food_id ? foods.find(f => f.id === item.food_id) : null;
            const tags = item.tags || (libFood ? libFood.tags : []) || [];
            const tagHtml = tags.filter(t=>t).map(t => `<span class="food-tag ${t}">${t}</span>`).join('');
            return `<div class="meal-item">
              <div class="meal-item-info">
                <div class="meal-item-name">${tagHtml}${item.name}${sv !== 1 ? ` (×${sv})` : ''}</div>
                <div class="meal-item-macros">
                  <span>${Math.round(n(item.calories)*sv)} cal</span>
                  <span>P: ${Math.round(n(item.protein)*sv)}g</span>
                  <span>C: ${Math.round(n(item.carbs)*sv)}g</span>
                  <span>F: ${Math.round(n(item.fat)*sv)}g</span>
                  <span>Fib: ${Math.round(n(item.fiber)*sv)}g</span>
                </div>
              </div>
              <button class="meal-item-remove" data-id="${item.id}" aria-label="Remove">×</button>
            </div>`;
          }).join('')
        }
      </div>
    `;
    container.appendChild(card);
  });

  // Add food buttons
  $$('.meal-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      currentMeal = btn.dataset.meal;
      openAddModal();
    });
  });

  // Remove buttons
  $$('.meal-item-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      await dbRemoveLog(btn.dataset.id);
      renderHome();
      toast('Removed');
    });
  });
}

// ─── Add Food Modal ──────────────────────────────────────────
function openAddModal() {
  $('#add-food-modal').classList.add('active');
  $('#modal-title').textContent = `Add to ${MEAL_LABELS[currentMeal]}`;
  renderModalLibrary();
  $$('.modal-tab').forEach(t => t.classList.remove('active'));
  $$('.tab-content').forEach(t => t.classList.remove('active'));
  $('.modal-tab[data-tab="library"]').classList.add('active');
  $('#tab-library').classList.add('active');
  $('#servings-row').style.display = 'none';
  selectedFood = null;
  servingsCount = 1;
  $('#modal-lib-search').value = '';
}

$('#modal-close').addEventListener('click', () => $('#add-food-modal').classList.remove('active'));
$('#add-food-modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); });

$$('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.modal-tab').forEach(t => t.classList.remove('active'));
    $$('.tab-content').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    $(`#tab-${tab.dataset.tab}`).classList.add('active');
    $('#servings-row').style.display = 'none';
    selectedFood = null;
  });
});

function renderModalLibrary(filter = '') {
  const list = $('#modal-lib-list');
  const filtered = foods.filter(f => !filter || f.name.toLowerCase().includes(filter.toLowerCase()));
  list.innerHTML = filtered.length === 0 ? '<p style="color:#555;font-size:.8rem;text-align:center;padding:1rem">No foods found</p>' :
    filtered.map(f => `
      <div class="modal-food-item" data-food-id="${f.id}">
        <div class="modal-food-name">${f.name}</div>
        <div class="modal-food-serving">${f.serving_label || '1 serving'}</div>
        <div class="modal-food-macros">
          <span>${Math.round(n(f.calories))} cal</span>
          <span>P: ${n(f.protein)}g</span>
          <span>C: ${n(f.carbs)}g</span>
          <span>F: ${n(f.fat)}g</span>
          <span>Fib: ${n(f.fiber)}g</span>
        </div>
      </div>
    `).join('');

  $$('.modal-food-item', list).forEach(item => {
    item.addEventListener('click', () => {
      const food = foods.find(f => f.id === item.dataset.foodId);
      if (food) selectFoodToAdd(food);
    });
  });
}

$('#modal-lib-search').addEventListener('input', e => renderModalLibrary(e.target.value));

function selectFoodToAdd(food) {
  selectedFood = food;
  servingsCount = 1;
  $('#serv-count').textContent = '1';
  $('#servings-row').style.display = 'flex';
  // Highlight selected
  $$('.modal-food-item').forEach(item => {
    item.style.borderColor = item.dataset.foodId === food.id || item.dataset.usdaIdx != null ? '#10b981' : '#2a2a2a';
  });
}

$('#serv-minus').addEventListener('click', () => {
  if (servingsCount > 0.5) {
    servingsCount = Math.round((servingsCount - 0.5) * 10) / 10;
    $('#serv-count').textContent = servingsCount;
  }
});
$('#serv-plus').addEventListener('click', () => {
  servingsCount = Math.round((servingsCount + 0.5) * 10) / 10;
  $('#serv-count').textContent = servingsCount;
});

$('#serv-confirm').addEventListener('click', async () => {
  if (!selectedFood) return;
  await dbAddLog({
    meal: currentMeal,
    food_id: selectedFood.id,
    name: selectedFood.name,
    servings: servingsCount,
    calories: n(selectedFood.calories),
    protein: n(selectedFood.protein),
    carbs: n(selectedFood.carbs),
    fat: n(selectedFood.fat),
    fiber: n(selectedFood.fiber),
    sodium: n(selectedFood.sodium),
    tags: selectedFood.tags || []
  });
  $('#add-food-modal').classList.remove('active');
  renderHome();
  toast(`Added ${selectedFood.name}`);
});

// USDA Search
$('#usda-search-btn').addEventListener('click', searchUSDA);
$('#modal-usda-search').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); searchUSDA(); } });

async function searchUSDA() {
  const q = $('#modal-usda-search').value.trim();
  if (!q) return;
  const list = $('#modal-usda-list');
  list.innerHTML = '<div style="text-align:center;padding:1rem"><div class="loading-spinner"></div></div>';

  try {
    const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(q)}&pageSize=15&dataType=Survey%20(FNDDS),Foundation,SR%20Legacy`);
    const data = await res.json();
    const results = (data.foods || []).map(f => {
      const get = (name) => {
        const nut = (f.foodNutrients || []).find(n => n.nutrientName === name || (n.nutrientName && n.nutrientName.includes(name)));
        return nut ? Number(nut.value) || 0 : 0;
      };
      return {
        name: f.description,
        fdcId: f.fdcId,
        calories: get('Energy'),
        protein: get('Protein'),
        carbs: get('Carbohydrate'),
        fat: get('Total lipid'),
        fiber: get('Fiber'),
        sodium: get('Sodium')
      };
    });
    list.innerHTML = results.length === 0 ? '<p style="color:#555;font-size:.8rem;text-align:center;padding:1rem">No results</p>' :
      results.map((r, i) => `
        <div class="modal-food-item" data-usda-idx="${i}">
          <div class="modal-food-name">${r.name}</div>
          <div class="modal-food-serving">per 100g</div>
          <div class="modal-food-macros">
            <span>${Math.round(r.calories)} cal</span>
            <span>P: ${r.protein}g</span>
            <span>C: ${r.carbs}g</span>
            <span>F: ${r.fat}g</span>
          </div>
        </div>
      `).join('');

    // Store results for click handler
    list._results = results;
    $$('.modal-food-item', list).forEach(item => {
      item.addEventListener('click', async () => {
        const idx = parseInt(item.dataset.usdaIdx);
        const r = list._results[idx];
        const food = await dbAddFood({
          name: r.name, category: currentMeal === 'coffee' ? 'coffee' : currentMeal,
          serving_label: '100g', calories: r.calories, protein: r.protein,
          carbs: r.carbs, fat: r.fat, fiber: r.fiber, sodium: r.sodium,
          tags: [], is_recipe: false, usda_fdc_id: String(r.fdcId)
        });
        selectFoodToAdd(food);
        toast('Saved to library');
      });
    });
  } catch (err) {
    list.innerHTML = '<p style="color:#ef4444;font-size:.8rem;text-align:center;padding:1rem">Search failed. Try again.</p>';
  }
}

// Quick Add
$('#quick-add-form').addEventListener('submit', async e => {
  e.preventDefault();
  const entry = {
    meal: currentMeal,
    name: $('#qa-name').value.trim(),
    servings: 1,
    calories: n($('#qa-cal').value),
    protein: n($('#qa-protein').value),
    carbs: n($('#qa-carbs').value),
    fat: n($('#qa-fat').value),
    fiber: n($('#qa-fiber').value),
    sodium: n($('#qa-sodium').value),
    tags: []
  };
  if ($('#qa-save-lib').checked) {
    await dbAddFood({
      name: entry.name, category: $('#qa-category').value,
      serving_label: $('#qa-serving').value || '1 serving',
      calories: entry.calories, protein: entry.protein,
      carbs: entry.carbs, fat: entry.fat,
      fiber: entry.fiber, sodium: entry.sodium,
      tags: [], is_recipe: false
    });
  }
  await dbAddLog(entry);
  $('#add-food-modal').classList.remove('active');
  e.target.reset();
  renderHome();
  toast(`Added ${entry.name}`);
});

// ─── Stats ───────────────────────────────────────────────────
$$('.stats-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.stats-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    statsRange = btn.dataset.range;
    renderStats();
  });
});

async function renderStats() {
  const days = statsRange === 'week' ? 7 : 30;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  const entries = await dbGetLogRange(fmtDate(start), fmtDate(end));

  const byDate = {};
  entries.forEach(e => { if (!byDate[e.date]) byDate[e.date] = []; byDate[e.date].push(e); });
  const daysWithData = Object.keys(byDate).length || 1;

  const dailyTotals = Object.entries(byDate).map(([date, items]) => ({
    date,
    calories: items.reduce((s, i) => s + n(i.calories) * n(i.servings || 1), 0),
    protein: items.reduce((s, i) => s + n(i.protein) * n(i.servings || 1), 0),
    carbs: items.reduce((s, i) => s + n(i.carbs) * n(i.servings || 1), 0),
    fat: items.reduce((s, i) => s + n(i.fat) * n(i.servings || 1), 0),
    fiber: items.reduce((s, i) => s + n(i.fiber) * n(i.servings || 1), 0),
    sodium: items.reduce((s, i) => s + n(i.sodium) * n(i.servings || 1), 0)
  }));

  const avg = (field) => dailyTotals.reduce((s, d) => s + d[field], 0) / daysWithData;
  const avgCal = avg('calories'), avgProt = avg('protein'), avgCarbs = avg('carbs');
  const avgFat = avg('fat'), avgFiber = avg('fiber'), avgSodium = avg('sodium');

  const protLow = n(settings?.protein_target_low) || 94;
  const protHigh = n(settings?.protein_target_high) || 134;
  const sodiumLimit = n(settings?.sodium_limit) || 2000;
  const calHigh = n(settings?.cal_target_high) || 2000;

  const protHitDays = dailyTotals.filter(d => d.protein >= protLow && d.protein <= protHigh).length;
  const protHitRate = Math.round(protHitDays / daysWithData * 100);
  const sodiumOkDays = dailyTotals.filter(d => d.sodium <= sodiumLimit).length;
  const sodiumRate = Math.round(sodiumOkDays / daysWithData * 100);

  const foodCounts = {};
  entries.forEach(e => { foodCounts[e.name] = (foodCounts[e.name] || 0) + 1; });
  const topFoods = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  $('#stats-content').innerHTML = `
    <div class="stat-card">
      <h3>Daily Averages (${daysWithData} day${daysWithData !== 1 ? 's' : ''} with data)</h3>
      <div class="stat-row"><span class="stat-label">Calories</span><span class="stat-value">${Math.round(avgCal)}</span></div>
      <div class="stat-bar-wrap"><div class="stat-bar-bg"><div class="stat-bar-fill green" style="width:${Math.min(avgCal/calHigh*100,100)}%"></div></div></div>
      <div class="stat-row"><span class="stat-label">Protein</span><span class="stat-value">${Math.round(avgProt)}g</span></div>
      <div class="stat-bar-wrap"><div class="stat-bar-bg"><div class="stat-bar-fill green" style="width:${Math.min(avgProt/protHigh*100,100)}%"></div></div></div>
      <div class="stat-row"><span class="stat-label">Carbs</span><span class="stat-value">${Math.round(avgCarbs)}g</span></div>
      <div class="stat-row"><span class="stat-label">Fat</span><span class="stat-value">${Math.round(avgFat)}g</span></div>
      <div class="stat-row"><span class="stat-label">Fiber</span><span class="stat-value">${Math.round(avgFiber)}g</span></div>
      <div class="stat-row"><span class="stat-label">Sodium</span><span class="stat-value">${Math.round(avgSodium)}mg</span></div>
    </div>
    <div class="stat-card">
      <h3>Target Compliance</h3>
      <div class="stat-row"><span class="stat-label">Protein in range (${protLow}–${protHigh}g)</span><span class="stat-value">${protHitRate}%</span></div>
      <div class="stat-bar-wrap"><div class="stat-bar-bg"><div class="stat-bar-fill ${protHitRate >= 70 ? 'green' : protHitRate >= 40 ? 'yellow' : 'red'}" style="width:${protHitRate}%"></div></div></div>
      <div class="stat-pct">${protHitDays} of ${daysWithData} days</div>
      <div class="stat-row" style="margin-top:.5rem"><span class="stat-label">Sodium under ${sodiumLimit}mg</span><span class="stat-value">${sodiumRate}%</span></div>
      <div class="stat-bar-wrap"><div class="stat-bar-bg"><div class="stat-bar-fill ${sodiumRate >= 70 ? 'green' : sodiumRate >= 40 ? 'yellow' : 'red'}" style="width:${sodiumRate}%"></div></div></div>
      <div class="stat-pct">${sodiumOkDays} of ${daysWithData} days</div>
    </div>
    <div class="stat-card">
      <h3>Most Logged Foods</h3>
      <div class="top-foods-list">
        ${topFoods.length === 0 ? '<p style="color:#555;font-size:.8rem">No data yet</p>' :
          topFoods.map(([name, count]) => `<div class="top-food-item"><span class="top-food-name">${name}</span><span class="top-food-count">×${count}</span></div>`).join('')}
      </div>
    </div>
  `;
}

// ─── Library ─────────────────────────────────────────────────
let libCatFilter = 'all';
let libTagFilter = 'all';

function renderLibrary() {
  const catContainer = $('#category-pills');
  catContainer.innerHTML = CATEGORIES.map(c => `<button class="filter-pill ${c === libCatFilter ? 'active' : ''}" data-cat="${c}">${c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}</button>`).join('');
  $$('.filter-pill', catContainer).forEach(p => p.addEventListener('click', () => { libCatFilter = p.dataset.cat; renderLibrary(); }));

  const tagContainer = $('#tag-pills');
  tagContainer.innerHTML = TAGS.map(t => `<button class="filter-pill ${t === libTagFilter ? 'active' : ''}" data-tag="${t}">${t === 'all' ? 'All Tags' : t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join('');
  $$('.filter-pill', tagContainer).forEach(p => p.addEventListener('click', () => { libTagFilter = p.dataset.tag; renderLibrary(); }));

  renderLibraryList();
}

function renderLibraryList() {
  const search = ($('#library-search')?.value || '').toLowerCase();
  let filtered = foods;
  if (libCatFilter !== 'all') filtered = filtered.filter(f => f.category === libCatFilter);
  if (libTagFilter !== 'all') filtered = filtered.filter(f => (f.tags || []).includes(libTagFilter));
  if (search) filtered = filtered.filter(f => f.name.toLowerCase().includes(search));

  const list = $('#library-list');
  list.innerHTML = filtered.length === 0 ? '<p style="color:#555;font-size:.85rem;text-align:center;padding:2rem">No foods match</p>' :
    filtered.map(f => {
      const tags = (f.tags || []).filter(t => t);
      return `<div class="lib-food-card">
        <div class="lib-food-info">
          <div class="lib-food-name">${f.name}</div>
          <div class="lib-food-serving">${f.serving_label || '1 serving'}</div>
          <div class="lib-food-macros">
            <span>${Math.round(n(f.calories))} cal</span>
            <span>P: ${n(f.protein)}g</span>
            <span>C: ${n(f.carbs)}g</span>
            <span>F: ${n(f.fat)}g</span>
            <span>Fib: ${n(f.fiber)}g</span>
            <span>Na: ${n(f.sodium)}mg</span>
          </div>
          ${tags.length ? `<div class="lib-food-tags">${tags.map(t => `<span class="food-tag ${t}">${t}</span>`).join('')}</div>` : ''}
        </div>
        <div class="lib-food-actions">
          <button class="lib-action-btn edit" data-id="${f.id}" aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="lib-action-btn delete" data-id="${f.id}" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');

  $$('.lib-action-btn.edit', list).forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
  $$('.lib-action-btn.delete', list).forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this food from your library?')) {
        await dbDeleteFood(btn.dataset.id);
        renderLibrary();
        toast('Deleted');
      }
    });
  });
}

$('#library-search').addEventListener('input', renderLibraryList);

$('#lib-add-food').addEventListener('click', () => {
  currentMeal = 'breakfast';
  openAddModal();
  $$('.modal-tab').forEach(t => t.classList.remove('active'));
  $$('.tab-content').forEach(t => t.classList.remove('active'));
  $('.modal-tab[data-tab="quick"]').classList.add('active');
  $('#tab-quick').classList.add('active');
  $('#qa-save-lib').checked = true;
});

// Edit food modal
function openEditModal(id) {
  const food = foods.find(f => f.id === id);
  if (!food) return;
  $('#ef-id').value = food.id;
  $('#ef-name').value = food.name;
  $('#ef-cal').value = food.calories;
  $('#ef-protein').value = food.protein;
  $('#ef-carbs').value = food.carbs;
  $('#ef-fat').value = food.fat;
  $('#ef-fiber').value = food.fiber || 0;
  $('#ef-sodium').value = food.sodium || 0;
  $('#ef-category').value = food.category || 'breakfast';
  $('#ef-serving').value = food.serving_label || '';
  $('#ef-tags').value = (food.tags || []).join(', ');
  $('#edit-food-modal').classList.add('active');
}

$('#edit-modal-close').addEventListener('click', () => $('#edit-food-modal').classList.remove('active'));
$('#edit-food-modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); });

$('#edit-food-form').addEventListener('submit', async e => {
  e.preventDefault();
  await dbUpdateFood($('#ef-id').value, {
    name: $('#ef-name').value.trim(),
    calories: n($('#ef-cal').value), protein: n($('#ef-protein').value),
    carbs: n($('#ef-carbs').value), fat: n($('#ef-fat').value),
    fiber: n($('#ef-fiber').value), sodium: n($('#ef-sodium').value),
    category: $('#ef-category').value, serving_label: $('#ef-serving').value.trim(),
    tags: $('#ef-tags').value.split(',').map(t => t.trim()).filter(Boolean)
  });
  $('#edit-food-modal').classList.remove('active');
  renderLibrary();
  toast('Updated');
});

// ─── Settings ────────────────────────────────────────────────
function renderSettings() {
  if (!settings) return;
  const s = settings;
  const heightFt = s.height_in ? Math.floor(n(s.height_in) / 12) : '';
  const heightIn = s.height_in ? Math.round(n(s.height_in) % 12) : '';

  $('#settings-content').innerHTML = `
    <div class="settings-section">
      <h3>Body Stats</h3>
      <div class="setting-row"><span class="setting-label">Weight</span><input class="setting-input" data-key="weight_lbs" type="number" value="${s.weight_lbs || ''}" placeholder="lbs"></div>
      <div class="setting-row"><span class="setting-label">Height (ft)</span><input class="setting-input" data-key="height_ft" type="number" value="${heightFt}" placeholder="ft"></div>
      <div class="setting-row"><span class="setting-label">Height (in)</span><input class="setting-input" data-key="height_in_part" type="number" value="${heightIn}" placeholder="in"></div>
      <div class="setting-row"><span class="setting-label">Body Fat %</span><input class="setting-input" data-key="body_fat_pct" type="number" value="${s.body_fat_pct || ''}" placeholder="%"></div>
    </div>
    <div class="settings-section">
      <h3>Activity</h3>
      <div class="setting-row"><span class="setting-label">Avg daily steps</span><input class="setting-input" data-key="avg_steps" type="number" value="${s.avg_steps || 8000}"></div>
      <div class="setting-row"><span class="setting-label">Workouts/wk</span><input class="setting-input" data-key="workouts_per_week" type="number" value="${s.workouts_per_week || 4}"></div>
      <div class="setting-row"><span class="setting-label">Zone 2 min/wk</span><input class="setting-input" data-key="zone2_min_per_week" type="number" value="${s.zone2_min_per_week || 90}"></div>
    </div>
    <div class="settings-section">
      <h3>Mode</h3>
      <div class="mode-buttons">
        ${Object.keys(MODE_PRESETS).map(m => `<button class="mode-btn ${s.mode === m ? 'active' : ''}" data-mode="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</button>`).join('')}
      </div>
    </div>
    <div class="settings-section">
      <h3>Macro Targets</h3>
      <div class="setting-row"><span class="setting-label">Calories (low)</span><input class="setting-input" data-key="cal_target_low" type="number" value="${s.cal_target_low}"></div>
      <div class="setting-row"><span class="setting-label">Calories (high)</span><input class="setting-input" data-key="cal_target_high" type="number" value="${s.cal_target_high}"></div>
      <div class="setting-row"><span class="setting-label">Protein (low, g)</span><input class="setting-input" data-key="protein_target_low" type="number" value="${s.protein_target_low}"></div>
      <div class="setting-row"><span class="setting-label">Protein (high, g)</span><input class="setting-input" data-key="protein_target_high" type="number" value="${s.protein_target_high}"></div>
      <div class="setting-row"><span class="setting-label">Carbs (g)</span><input class="setting-input" data-key="carb_target" type="number" value="${s.carb_target}"></div>
      <div class="setting-row"><span class="setting-label">Fat (g)</span><input class="setting-input" data-key="fat_target" type="number" value="${s.fat_target}"></div>
      <div class="setting-row"><span class="setting-label">Fiber (g)</span><input class="setting-input" data-key="fiber_target" type="number" value="${s.fiber_target}"></div>
      <div class="setting-row">
        <span class="setting-label">Sodium limit (mg)<small>Genome-informed</small></span>
        <input class="setting-input" data-key="sodium_limit" type="number" value="${s.sodium_limit}">
      </div>
    </div>
    <div class="settings-section">
      <h3>Data</h3>
      <div class="settings-actions">
        <button class="btn-secondary" id="export-btn">Export JSON</button>
        <button class="btn-secondary" id="import-btn">Import JSON</button>
      </div>
      <input type="file" id="import-file" accept=".json" style="display:none">
    </div>
    <div class="settings-section">
      <h3>Account</h3>
      <div class="setting-row"><span class="setting-label">Email</span><span class="setting-email">${currentUser?.email || ''}</span></div>
      <div class="setting-row"><span class="setting-label">Storage</span><span class="sync-status ${useSupabase ? '' : 'offline'}">${useSupabase ? 'Cloud Sync' : 'Local Only'}</span></div>
      <button class="btn-danger" id="logout-btn" style="margin-top:.75rem;width:100%">Log Out</button>
    </div>
  `;

  // Mode buttons
  const container = $('#settings-content');
  $$('.mode-btn', container).forEach(btn => {
    btn.addEventListener('click', async () => {
      const preset = MODE_PRESETS[btn.dataset.mode];
      Object.assign(settings, preset, { mode: btn.dataset.mode });
      await dbSaveSettings(settings);
      renderSettings();
      renderHome();
      toast(`Mode: ${btn.dataset.mode}`);
    });
  });

  // Setting inputs
  $$('.setting-input', container).forEach(input => {
    input.addEventListener('change', async () => {
      const key = input.dataset.key;
      const val = n(input.value);
      if (key === 'height_ft') {
        const inPart = n($('.setting-input[data-key="height_in_part"]', container)?.value);
        settings.height_in = val * 12 + inPart;
      } else if (key === 'height_in_part') {
        const ft = n($('.setting-input[data-key="height_ft"]', container)?.value);
        settings.height_in = ft * 12 + val;
      } else {
        settings[key] = val;
      }
      await dbSaveSettings(settings);
      renderHome();
    });
  });

  $('#export-btn')?.addEventListener('click', () => {
    const data = { settings, foods, log: LS.get('log_' + currentUser.id) || [], water: LS.get('water_' + currentUser.id) || {} };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `macros-export-${fmtDate(new Date())}.json`; a.click();
    toast('Exported');
  });

  $('#import-btn')?.addEventListener('click', () => $('#import-file').click());
  $('#import-file')?.addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.settings) { settings = data.settings; await dbSaveSettings(settings); }
      if (data.foods) { for (const f of data.foods) { if (!foods.find(x => x.name === f.name)) await dbAddFood(f); } }
      if (data.log) LS.set('log_' + currentUser.id, data.log);
      if (data.water) LS.set('water_' + currentUser.id, data.water);
      foods = await dbGetFoods(); await loadDay(); renderSettings();
      toast('Imported');
    } catch { toast('Invalid file'); }
  });

  $('#logout-btn')?.addEventListener('click', async () => { await sb.auth.signOut(); showAuth(); });
}

// ─── Service Worker ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ─── Init ────────────────────────────────────────────────────
initAuth();
