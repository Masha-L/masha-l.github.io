/* ===== Macros PWA — app.js ===== */
'use strict';

// ── Supabase ──
const SUPABASE_URL = 'https://xfmcweloaladfnmfvkuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbWN3ZWxvYWxhZGZubWZ2a3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzIwNDMsImV4cCI6MjA4OTU0ODA0M30.q2W-rI7wwdFMyYTiQEA301z69qiVi3OgZb8cYmGBU6I';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Constants ──
const MEALS = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'snack', name: 'Snack' },
  { id: 'dinner', name: 'Dinner' },
];

const MODES = {
  recomp:   { label:'Recomp',   cal:[1800,2000], protein:[94,134], fat:[55,65], carbs:[200,250], fiber:[25,30] },
  cutting:  { label:'Cutting',  cal:[1400,1600], protein:[110,140], fat:[40,55], carbs:[130,170], fiber:[25,30] },
  maintain: { label:'Maintenance', cal:[1900,2100], protein:[80,120], fat:[55,70], carbs:[220,270], fiber:[25,30] },
  marathon: { label:'Marathon Fueling', cal:[2200,2500], protein:[90,120], fat:[55,70], carbs:[300,380], fiber:[25,30] },
};

const SEED_FOODS = [
  {name:'Drip coffee with whole milk',calories:40,protein:2,carbs:3,fat:2,fiber:0,sodium:15,category:'coffee',tags:['quick'],serving_label:'1 cup'},
  {name:'Cold brew with whole milk',calories:80,protein:4,carbs:6,fat:4,fiber:0,sodium:26,category:'coffee',tags:['quick'],serving_label:'1 cup'},
  {name:'Large egg',calories:72,protein:6.2,carbs:0.4,fat:5,fiber:0,sodium:71,category:'breakfast',tags:['quick'],serving_label:'1 large egg'},
  {name:'Turkey sausage patty',calories:108,protein:11,carbs:1,fat:7,fiber:0,sodium:340,category:'breakfast',tags:['quick'],serving_label:'1 patty (56g)'},
  {name:'Sourdough toast',calories:96,protein:3.9,carbs:18,fat:1,fiber:1,sodium:170,category:'breakfast',tags:['quick'],serving_label:'1 slice'},
  {name:'Half avocado',calories:109,protein:1.4,carbs:6,fat:10,fiber:4.5,sodium:5,category:'ingredient',tags:['quick'],serving_label:'1/2 avocado'},
  {name:'Shredded cheese',calories:113,protein:6.4,carbs:1.5,fat:9,fiber:0,sodium:180,category:'ingredient',tags:['quick'],serving_label:'28g'},
  {name:'Flour tortilla',calories:140,protein:3.7,carbs:24,fat:3.5,fiber:1.5,sodium:330,category:'ingredient',tags:['quick'],serving_label:'1 tortilla'},
  {name:'Greek yogurt',calories:120,protein:15,carbs:11,fat:2,fiber:0,sodium:55,category:'breakfast',tags:['quick'],serving_label:'1 container'},
  {name:'Protein shake',calories:220,protein:40,carbs:12,fat:3,fiber:1,sodium:200,category:'snack',tags:['quick'],serving_label:'1 shake'},
  {name:'Grilled chicken breast',calories:280,protein:52,carbs:0,fat:6,fiber:0,sodium:120,category:'lunch',tags:['homemade'],serving_label:'6 oz'},
  {name:'Brown rice',calories:216,protein:5,carbs:45,fat:1.8,fiber:3.5,sodium:10,category:'ingredient',tags:['homemade'],serving_label:'1 cup cooked'},
  {name:'Salmon fillet',calories:350,protein:38,carbs:0,fat:21,fiber:0,sodium:75,category:'dinner',tags:['homemade'],serving_label:'6 oz'},
  {name:'Sweet potato',calories:103,protein:2.3,carbs:24,fat:0.1,fiber:3.8,sodium:41,category:'ingredient',tags:['homemade'],serving_label:'1 medium'},
  {name:'Poke bowl',calories:550,protein:35,carbs:55,fat:18,fiber:3,sodium:900,category:'lunch',tags:['takeout'],serving_label:'1 bowl'},
  {name:'Chia pudding w/ raspberries',calories:313,protein:20,carbs:32,fat:12,fiber:14,sodium:30,category:'snack',tags:['homemade'],serving_label:'1 bowl'},
  {name:'Hungryroot meal (avg)',calories:450,protein:30,carbs:40,fat:18,fiber:6,sodium:650,category:'dinner',tags:['hungryroot'],serving_label:'1 meal'},
  {name:'Oatmeal with berries',calories:280,protein:8,carbs:48,fat:6,fiber:5,sodium:10,category:'breakfast',tags:['homemade'],serving_label:'1 bowl'},
  {name:'Hummus + veggies',calories:180,protein:5,carbs:18,fat:10,fiber:4,sodium:300,category:'snack',tags:['quick'],serving_label:'1 serving'},
  {name:'Trail mix',calories:175,protein:5,carbs:15,fat:12,fiber:2,sodium:45,category:'snack',tags:['quick'],serving_label:'1/4 cup'},
];

// ── State ──
let currentUser = null;
let currentDate = todayStr();
let currentMeal = null;
let settings = { mode:'recomp', weight:130, height:64, bodyFat:25.9, steps:8000, workouts:4, zone2:120, sodiumLimit:2000 };
let library = [];   // macro_foods rows
let dayLog = [];     // macro_log rows for currentDate
let waterCups = 0;
let servingFood = null;
let servingCount = 1;

// ── Helpers ──
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dateObj(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }
function formatDate(s) {
  const t = todayStr();
  if (s === t) return 'Today';
  const yd = new Date(); yd.setDate(yd.getDate()-1);
  const ydStr = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
  if (s === ydStr) return 'Yesterday';
  return dateObj(s).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
function shiftDate(s, n) {
  const d = dateObj(s); d.setDate(d.getDate()+n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function r1(v) { return Math.round((v||0)*10)/10; }
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function getTargets() {
  return MODES[settings.mode] || MODES.recomp;
}

// ══════════════════════════════════
// SVG GAUGE HELPERS
// ══════════════════════════════════
// Main calorie arc path length
const CAL_ARC_PATH = 'M 20 110 A 80 80 0 0 1 180 110';
const CAL_ARC_LENGTH = Math.PI * 80; // ~251.3

// Mini gauge arc path length
const MINI_ARC_PATH = 'M 6 36 A 24 24 0 0 1 54 36';
const MINI_ARC_LENGTH = Math.PI * 24; // ~75.4

function setArc(pathEl, fraction, totalLength) {
  const f = Math.max(0, Math.min(fraction, 1));
  const filled = f * totalLength;
  pathEl.setAttribute('stroke-dasharray', `${filled} ${totalLength}`);
}

function getArcColor(value, range) {
  if (value > range[1] * 1.1) return '#ef4444';
  if (value > range[1]) return '#f59e0b';
  if (value >= range[0]) return '#4ade80';
  return '#10b981';
}

// ══════════════════════════════════
// RENDER GAUGES
// ══════════════════════════════════
function renderGauges(totals) {
  const targets = getTargets();

  // Calorie gauge
  const calMid = (targets.cal[0] + targets.cal[1]) / 2;
  const calFrac = totals.cal / (calMid * 2);
  const calArc = document.getElementById('cal-arc');
  setArc(calArc, calFrac, CAL_ARC_LENGTH);
  calArc.setAttribute('stroke', getArcColor(totals.cal, targets.cal));

  document.getElementById('cal-eaten').textContent = Math.round(totals.cal);

  // Range labels on the SVG
  const calLow = document.getElementById('cal-low-label');
  const calHigh = document.getElementById('cal-high-label');
  if (calLow) { calLow.textContent = targets.cal[0]; calLow.setAttribute('x', '28'); calLow.setAttribute('y', '100'); }
  if (calHigh) { calHigh.textContent = targets.cal[1]; calHigh.setAttribute('x', '152'); calHigh.setAttribute('y', '100'); }

  // Mini gauges
  const macroKeys = ['protein', 'carbs', 'fat', 'fiber'];
  const macroColors = ['#10b981', '#3b82f6', '#f59e0b', '#a78bfa'];
  const gaugeEls = document.querySelectorAll('.mini-gauge');

  gaugeEls.forEach((el, i) => {
    const key = macroKeys[i];
    const range = targets[key];
    const mid = (range[0] + range[1]) / 2;
    const frac = totals[key] / (mid * 2);
    const arc = el.querySelector('.mini-arc');
    setArc(arc, frac, MINI_ARC_LENGTH);
    arc.setAttribute('stroke', getArcColor(totals[key], range));

    el.querySelector('.mini-value').textContent = Math.round(totals[key]) + 'g';
    el.querySelector('.mini-target').textContent = `${Math.round(totals[key])} / ${range[1]}g`;
  });
}

// ══════════════════════════════════
// DATA FUNCTIONS (Supabase + localStorage fallback)
// ══════════════════════════════════
async function loadSettings() {
  if (!currentUser) return;
  const { data } = await sb.from('macro_settings').select('*').eq('user_id', currentUser.id).single();
  if (data) {
    settings = {
      mode: data.mode || 'recomp',
      weight: data.weight_lbs || 130,
      height: data.height_in || 64,
      bodyFat: data.body_fat_pct || 25.9,
      steps: data.avg_steps || 8000,
      workouts: data.workouts_per_week || 4,
      zone2: data.zone2_min_per_week || 120,
      sodiumLimit: data.sodium_limit || 2000,
    };
  }
}

async function saveSettingsToDb() {
  if (!currentUser) return;
  const row = {
    user_id: currentUser.id,
    mode: settings.mode,
    weight_lbs: settings.weight,
    height_in: settings.height,
    body_fat_pct: settings.bodyFat,
    avg_steps: settings.steps,
    workouts_per_week: settings.workouts,
    zone2_min_per_week: settings.zone2,
    sodium_limit: settings.sodiumLimit,
    updated_at: new Date().toISOString(),
  };
  await sb.from('macro_settings').upsert(row, { onConflict: 'user_id' });
}

async function loadLibrary() {
  if (!currentUser) return;
  const { data } = await sb.from('macro_foods').select('*').eq('user_id', currentUser.id).order('name');
  library = data || [];
}

async function seedLibrary() {
  if (!currentUser || library.length > 0) return;
  const rows = SEED_FOODS.map(f => ({
    user_id: currentUser.id,
    name: f.name,
    category: f.category,
    tags: f.tags,
    serving_label: f.serving_label,
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    fiber: f.fiber,
    sodium: f.sodium,
  }));
  await sb.from('macro_foods').insert(rows);
  await loadLibrary();
}

async function loadDayLog(date) {
  if (!currentUser) return;
  const { data } = await sb.from('macro_log').select('*').eq('user_id', currentUser.id).eq('date', date).order('created_at');
  dayLog = data || [];
}

async function loadWater(date) {
  if (!currentUser) return;
  const { data } = await sb.from('macro_water').select('*').eq('user_id', currentUser.id).eq('date', date).single();
  waterCups = data?.cups || 0;
}

async function saveWater(date, cups) {
  if (!currentUser) return;
  await sb.from('macro_water').upsert({
    user_id: currentUser.id,
    date: date,
    cups: cups,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' });
}

async function addLogEntry(meal, food, servings) {
  if (!currentUser) return;
  const entry = {
    user_id: currentUser.id,
    date: currentDate,
    meal: meal,
    food_id: food.id || null,
    name: food.name,
    servings: servings,
    calories: food.calories * servings,
    protein: food.protein * servings,
    carbs: food.carbs * servings,
    fat: food.fat * servings,
    fiber: (food.fiber || 0) * servings,
    sodium: (food.sodium || 0) * servings,
  };
  const { error } = await sb.from('macro_log').insert(entry);
  if (error) { toast('Error saving — try again'); console.error(error); return; }
  await loadDayLog(currentDate);
  renderHome();
  toast(`Added ${food.name}`);
}

async function removeLogEntry(id) {
  await sb.from('macro_log').delete().eq('id', id);
  await loadDayLog(currentDate);
  renderHome();
}

async function addFoodToLibrary(food) {
  if (!currentUser) return null;
  const row = {
    user_id: currentUser.id,
    name: food.name,
    category: food.category || 'ingredient',
    tags: food.tags || [],
    serving_label: food.serving_label || '1 serving',
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber || 0,
    sodium: food.sodium || 0,
  };
  const { data, error } = await sb.from('macro_foods').insert(row).select().single();
  if (error) { toast('Error saving food'); console.error(error); return null; }
  await loadLibrary();
  return data;
}

async function updateFoodInLibrary(id, updates) {
  await sb.from('macro_foods').update(updates).eq('id', id);
  await loadLibrary();
}

async function deleteFoodFromLibrary(id) {
  await sb.from('macro_foods').delete().eq('id', id);
  await loadLibrary();
  renderLibrary();
}

// ══════════════════════════════════
// COMPUTE TOTALS
// ══════════════════════════════════
function computeTotals() {
  const t = { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
  for (const entry of dayLog) {
    t.cal += entry.calories || 0;
    t.protein += entry.protein || 0;
    t.carbs += entry.carbs || 0;
    t.fat += entry.fat || 0;
    t.fiber += entry.fiber || 0;
    t.sodium += entry.sodium || 0;
  }
  return t;
}

function mealEntries(mealId) {
  return dayLog.filter(e => e.meal === mealId);
}

function mealTotal(mealId) {
  const entries = mealEntries(mealId);
  const t = { cal: 0, protein: 0 };
  for (const e of entries) { t.cal += e.calories || 0; t.protein += e.protein || 0; }
  return t;
}

// ══════════════════════════════════
// HOME PAGE
// ══════════════════════════════════
function renderHome() {
  document.getElementById('date-display').textContent = formatDate(currentDate);
  const modeCfg = getTargets();
  const badge = document.getElementById('mode-badge');
  badge.textContent = modeCfg.label || MODES[settings.mode]?.label || 'Recomp';
  badge.className = 'mode-badge';
  
  const totals = computeTotals();

  // Over range check
  if (totals.cal > getTargets().cal[1]) badge.classList.add('over');

  // Gauges
  renderGauges(totals);

  // Sodium
  const sodiumPct = Math.min((totals.sodium / settings.sodiumLimit) * 100, 100);
  const sodiumBar = document.getElementById('sodium-bar');
  sodiumBar.style.width = sodiumPct + '%';
  sodiumBar.className = 'sodium-bar-fill';
  if (totals.sodium > settings.sodiumLimit) sodiumBar.classList.add('danger');
  else if (totals.sodium > settings.sodiumLimit * 0.8) sodiumBar.classList.add('warn');
  document.getElementById('sodium-value').textContent = `${Math.round(totals.sodium)} / ${settings.sodiumLimit}mg`;
  document.getElementById('sodium-warning').style.display = totals.sodium > settings.sodiumLimit ? 'flex' : 'none';

  // Water
  renderWater();

  // Meals
  renderMeals();
}

function renderWater() {
  const container = document.getElementById('water-cups');
  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const cup = document.createElement('div');
    cup.className = 'water-cup' + (i < waterCups ? ' filled' : '');
    cup.textContent = '💧';
    cup.addEventListener('click', async () => {
      waterCups = (i < waterCups) ? i : i + 1;
      await saveWater(currentDate, waterCups);
      renderWater();
    });
    container.appendChild(cup);
  }
  document.getElementById('water-count').textContent = `${waterCups} cups`;
}

function renderMeals() {
  const container = document.getElementById('meals-section');
  container.innerHTML = '';

  for (const meal of MEALS) {
    const items = mealEntries(meal.id);
    const mt = mealTotal(meal.id);

    const card = document.createElement('div');
    card.className = 'meal-card';

    // Header
    const header = document.createElement('div');
    header.className = 'meal-header';
    header.innerHTML = `
      <div class="meal-header-left">
        <span class="meal-name">${meal.name}</span>
        <span class="meal-total">${items.length ? Math.round(mt.cal) + ' cal · P: ' + Math.round(mt.protein) + 'g' : ''}</span>
      </div>
      <button class="meal-add-btn" data-meal="${meal.id}">+</button>
    `;
    card.appendChild(header);

    // Items
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'meal-items';

    if (items.length === 0) {
      itemsDiv.innerHTML = '<div class="meal-empty">Tap + to add food</div>';
    } else {
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'meal-item';
        const hiSodium = (item.sodium || 0) > 500;
        row.innerHTML = `
          <div class="meal-item-info">
            <div class="meal-item-name">${item.name}</div>
            <div class="meal-item-macros">
              <span>${Math.round(item.calories)} cal</span>
              <span>P:${r1(item.protein)}g</span>
              <span>C:${r1(item.carbs)}g</span>
              <span>F:${r1(item.fat)}g</span>
              <span>Fib:${r1(item.fiber)}g</span>
              <span style="${hiSodium?'color:#f59e0b':''}">Na:${Math.round(item.sodium||0)}mg</span>
            </div>
          </div>
          <button class="meal-item-remove" data-id="${item.id}">&times;</button>
        `;
        itemsDiv.appendChild(row);
      });
    }
    card.appendChild(itemsDiv);

    // Toggle collapse
    header.addEventListener('click', (e) => {
      if (e.target.closest('.meal-add-btn')) return;
      itemsDiv.style.display = itemsDiv.style.display === 'none' ? 'block' : 'none';
    });

    container.appendChild(card);
  }

  // Add food button handlers
  container.querySelectorAll('.meal-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMeal = btn.dataset.meal;
      openAddModal();
    });
  });

  // Remove handlers
  container.querySelectorAll('.meal-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeLogEntry(btn.dataset.id));
  });
}

// Date nav
document.getElementById('prev-day').addEventListener('click', async () => {
  currentDate = shiftDate(currentDate, -1);
  await loadDayLog(currentDate);
  await loadWater(currentDate);
  renderHome();
});
document.getElementById('next-day').addEventListener('click', async () => {
  currentDate = shiftDate(currentDate, 1);
  await loadDayLog(currentDate);
  await loadWater(currentDate);
  renderHome();
});

// Water add button
document.getElementById('water-add').addEventListener('click', async () => {
  if (waterCups < 8) {
    waterCups++;
    await saveWater(currentDate, waterCups);
    renderWater();
  }
});

// ══════════════════════════════════
// ADD FOOD MODAL
// ══════════════════════════════════
const addModal = document.getElementById('add-food-modal');

function openAddModal() {
  addModal.classList.add('active');
  renderModalLibrary();
  // Reset tabs
  document.querySelectorAll('#add-food-modal .modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('#add-food-modal .modal-tab[data-tab="library"]').classList.add('active');
  document.querySelectorAll('#add-food-modal .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-library').classList.add('active');
  document.getElementById('modal-lib-search').value = '';
  document.getElementById('modal-usda-search').value = '';
  document.getElementById('modal-usda-list').innerHTML = '';
  document.getElementById('servings-row').style.display = 'none';
  servingFood = null;
  servingCount = 1;
}

function closeAddModal() { addModal.classList.remove('active'); }
document.getElementById('modal-close').addEventListener('click', closeAddModal);
addModal.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });

// Modal tabs
document.querySelectorAll('#add-food-modal .modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#add-food-modal .modal-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('#add-food-modal .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    document.getElementById('servings-row').style.display = 'none';
  });
});

function renderModalLibrary(filter) {
  const q = (filter || document.getElementById('modal-lib-search').value || '').toLowerCase();
  const list = document.getElementById('modal-lib-list');
  const filtered = library.filter(f => !q || f.name.toLowerCase().includes(q));
  list.innerHTML = '';
  if (filtered.length === 0) {
    list.innerHTML = '<div class="meal-empty">No foods found</div>';
    return;
  }
  filtered.forEach(f => {
    const item = document.createElement('div');
    item.className = 'modal-food-item';
    item.innerHTML = `
      <div class="modal-food-name">${f.name}</div>
      <div class="modal-food-serving">${f.serving_label || '1 serving'}</div>
      <div class="modal-food-macros">
        <span>${f.calories} cal</span>
        <span>P:${r1(f.protein)}g</span>
        <span>C:${r1(f.carbs)}g</span>
        <span>F:${r1(f.fat)}g</span>
      </div>
    `;
    item.addEventListener('click', () => showServings(f));
    list.appendChild(item);
  });
}

document.getElementById('modal-lib-search').addEventListener('input', (e) => renderModalLibrary(e.target.value));

// USDA search
document.getElementById('usda-search-btn').addEventListener('click', async () => {
  const q = document.getElementById('modal-usda-search').value.trim();
  if (!q) return;
  const list = document.getElementById('modal-usda-list');
  list.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const resp = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(q)}&pageSize=10&dataType=Survey%20(FNDDS),SR%20Legacy,Foundation`);
    const data = await resp.json();
    list.innerHTML = '';
    if (!data.foods || data.foods.length === 0) {
      list.innerHTML = '<div class="meal-empty">No results</div>';
      return;
    }
    data.foods.forEach(f => {
      const nuts = {};
      (f.foodNutrients || []).forEach(n => { nuts[n.nutrientName] = n.value; });
      const food = {
        name: f.description,
        calories: Math.round(nuts['Energy'] || 0),
        protein: r1(nuts['Protein'] || 0),
        carbs: r1(nuts['Carbohydrate, by difference'] || 0),
        fat: r1(nuts['Total lipid (fat)'] || 0),
        fiber: r1(nuts['Fiber, total dietary'] || 0),
        sodium: Math.round(nuts['Sodium, Na'] || 0),
        serving_label: '100g',
        category: currentMeal || 'ingredient',
        tags: [],
        usda_fdc_id: String(f.fdcId),
      };
      const item = document.createElement('div');
      item.className = 'modal-food-item';
      item.innerHTML = `
        <div class="modal-food-name">${food.name}</div>
        <div class="modal-food-serving">per 100g</div>
        <div class="modal-food-macros">
          <span>${food.calories} cal</span>
          <span>P:${food.protein}g</span>
          <span>C:${food.carbs}g</span>
          <span>F:${food.fat}g</span>
          <span>Na:${food.sodium}mg</span>
        </div>
      `;
      item.addEventListener('click', () => showServings(food));
      list.appendChild(item);
    });
  } catch (err) {
    list.innerHTML = '<div class="meal-empty">Search failed — try again</div>';
  }
});

// Enter key for USDA search
document.getElementById('modal-usda-search').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('usda-search-btn').click(); }
});

// Servings selector
function showServings(food) {
  servingFood = food;
  servingCount = 1;
  const row = document.getElementById('servings-row');
  row.style.display = 'flex';
  document.getElementById('serv-count').textContent = '1';
}

document.getElementById('serv-minus').addEventListener('click', () => {
  if (servingCount > 0.5) { servingCount = Math.round((servingCount - 0.5) * 10) / 10; }
  document.getElementById('serv-count').textContent = servingCount;
});
document.getElementById('serv-plus').addEventListener('click', () => {
  servingCount = Math.round((servingCount + 0.5) * 10) / 10;
  document.getElementById('serv-count').textContent = servingCount;
});
document.getElementById('serv-confirm').addEventListener('click', async () => {
  if (!servingFood || !currentMeal) return;
  // If from USDA (no id), save to library first
  if (!servingFood.id && servingFood.usda_fdc_id) {
    const saved = await addFoodToLibrary(servingFood);
    if (saved) servingFood = saved;
  }
  await addLogEntry(currentMeal, servingFood, servingCount);
  closeAddModal();
});

// Quick add form
document.getElementById('quick-add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const food = {
    name: document.getElementById('qa-name').value.trim(),
    calories: parseFloat(document.getElementById('qa-cal').value) || 0,
    protein: parseFloat(document.getElementById('qa-protein').value) || 0,
    carbs: parseFloat(document.getElementById('qa-carbs').value) || 0,
    fat: parseFloat(document.getElementById('qa-fat').value) || 0,
    fiber: parseFloat(document.getElementById('qa-fiber').value) || 0,
    sodium: parseFloat(document.getElementById('qa-sodium').value) || 0,
    category: document.getElementById('qa-category').value,
    serving_label: document.getElementById('qa-serving').value || '1 serving',
    tags: [],
  };
  if (!food.name) return;

  const saveToLib = document.getElementById('qa-save-lib').checked;
  if (saveToLib) {
    const saved = await addFoodToLibrary(food);
    if (saved) food.id = saved.id;
  }

  await addLogEntry(currentMeal, food, 1);
  closeAddModal();
  e.target.reset();
});

// ══════════════════════════════════
// EDIT FOOD MODAL
// ══════════════════════════════════
const editModal = document.getElementById('edit-food-modal');

function openEditModal(food) {
  editModal.classList.add('active');
  document.getElementById('ef-id').value = food.id;
  document.getElementById('ef-name').value = food.name;
  document.getElementById('ef-cal').value = food.calories;
  document.getElementById('ef-protein').value = food.protein;
  document.getElementById('ef-carbs').value = food.carbs;
  document.getElementById('ef-fat').value = food.fat;
  document.getElementById('ef-fiber').value = food.fiber || 0;
  document.getElementById('ef-sodium').value = food.sodium || 0;
  document.getElementById('ef-category').value = food.category || 'ingredient';
  document.getElementById('ef-serving').value = food.serving_label || '1 serving';
  document.getElementById('ef-tags').value = (food.tags || []).join(', ');
}

document.getElementById('edit-modal-close').addEventListener('click', () => editModal.classList.remove('active'));
editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.classList.remove('active'); });

document.getElementById('edit-food-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('ef-id').value;
  const updates = {
    name: document.getElementById('ef-name').value.trim(),
    calories: parseFloat(document.getElementById('ef-cal').value) || 0,
    protein: parseFloat(document.getElementById('ef-protein').value) || 0,
    carbs: parseFloat(document.getElementById('ef-carbs').value) || 0,
    fat: parseFloat(document.getElementById('ef-fat').value) || 0,
    fiber: parseFloat(document.getElementById('ef-fiber').value) || 0,
    sodium: parseFloat(document.getElementById('ef-sodium').value) || 0,
    category: document.getElementById('ef-category').value,
    serving_label: document.getElementById('ef-serving').value || '1 serving',
    tags: document.getElementById('ef-tags').value.split(',').map(t => t.trim()).filter(Boolean),
  };
  await updateFoodInLibrary(id, updates);
  editModal.classList.remove('active');
  renderLibrary();
  toast('Food updated');
});

// ══════════════════════════════════
// FORGOT PASSWORD MODAL
// ══════════════════════════════════
document.getElementById('auth-forgot').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('forgot-modal').classList.add('active');
});
document.getElementById('forgot-close').addEventListener('click', () => document.getElementById('forgot-modal').classList.remove('active'));
document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  const { error } = await sb.auth.resetPasswordForEmail(email);
  document.getElementById('forgot-msg').textContent = error ? error.message : 'Reset link sent — check your email';
});

// ══════════════════════════════════
// STATS PAGE
// ══════════════════════════════════
async function renderStats() {
  const content = document.getElementById('stats-content');
  content.innerHTML = '<div style="text-align:center;padding:2rem;"><div class="loading-spinner"></div></div>';

  const range = statsPeriod === 'week' ? 7 : 30;
  const dates = [];
  for (let i = 0; i < range; i++) {
    dates.push(shiftDate(todayStr(), -i));
  }

  // Load all log entries for date range
  const { data: logs } = await sb.from('macro_log')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('date', dates[dates.length - 1])
    .lte('date', dates[0])
    .order('date');

  const entries = logs || [];
  const targets = getTargets();

  // Group by date
  const byDate = {};
  entries.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  const daysTracked = Object.keys(byDate).length;

  // Averages
  const avg = { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
  let proteinHitDays = 0;
  let sodiumGoodDays = 0;

  Object.values(byDate).forEach(dayEntries => {
    const dt = { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
    dayEntries.forEach(e => {
      dt.cal += e.calories || 0;
      dt.protein += e.protein || 0;
      dt.carbs += e.carbs || 0;
      dt.fat += e.fat || 0;
      dt.fiber += e.fiber || 0;
      dt.sodium += e.sodium || 0;
    });
    avg.cal += dt.cal;
    avg.protein += dt.protein;
    avg.carbs += dt.carbs;
    avg.fat += dt.fat;
    avg.fiber += dt.fiber;
    avg.sodium += dt.sodium;
    if (dt.protein >= targets.protein[0] && dt.protein <= targets.protein[1]) proteinHitDays++;
    if (dt.sodium <= settings.sodiumLimit) sodiumGoodDays++;
  });

  if (daysTracked > 0) {
    avg.cal = Math.round(avg.cal / daysTracked);
    avg.protein = Math.round(avg.protein / daysTracked);
    avg.carbs = Math.round(avg.carbs / daysTracked);
    avg.fat = Math.round(avg.fat / daysTracked);
    avg.fiber = Math.round(avg.fiber / daysTracked);
    avg.sodium = Math.round(avg.sodium / daysTracked);
  }

  // Top foods
  const foodCounts = {};
  entries.forEach(e => { foodCounts[e.name] = (foodCounts[e.name] || 0) + 1; });
  const topFoods = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const startDate = dateObj(dates[dates.length-1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = dateObj(dates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const proteinPct = daysTracked ? Math.round(proteinHitDays / daysTracked * 100) : 0;
  const sodiumPct = daysTracked ? Math.round(sodiumGoodDays / daysTracked * 100) : 0;

  content.innerHTML = `
    <div class="stat-card">
      <h3>${startDate} – ${endDate}</h3>
      <div class="stat-row"><span class="stat-label">${daysTracked} days tracked</span></div>
      <div class="stat-row"><span class="stat-label">Avg Calories</span><span class="stat-value">${avg.cal}</span></div>
      <div class="stat-row"><span class="stat-label">Avg Protein</span><span class="stat-value">${avg.protein}g</span></div>
      <div class="stat-row"><span class="stat-label">Avg Carbs</span><span class="stat-value">${avg.carbs}g</span></div>
      <div class="stat-row"><span class="stat-label">Avg Fat</span><span class="stat-value">${avg.fat}g</span></div>
      <div class="stat-row"><span class="stat-label">Avg Fiber</span><span class="stat-value">${avg.fiber}g</span></div>
      <div class="stat-row"><span class="stat-label">Avg Sodium</span><span class="stat-value">${avg.sodium}mg</span></div>
    </div>
    <div class="stat-card">
      <h3>Targets</h3>
      <div class="stat-bar-wrap">
        <div class="stat-row"><span class="stat-label">Protein in range (${targets.protein[0]}-${targets.protein[1]}g)</span><span class="stat-value">${proteinPct}%</span></div>
        <div class="stat-bar-bg"><div class="stat-bar-fill ${proteinPct >= 70 ? 'green' : proteinPct >= 40 ? 'yellow' : 'red'}" style="width:${proteinPct}%"></div></div>
      </div>
      <div class="stat-bar-wrap" style="margin-top:.75rem">
        <div class="stat-row"><span class="stat-label">Sodium under ${settings.sodiumLimit}mg</span><span class="stat-value">${sodiumPct}%</span></div>
        <div class="stat-bar-bg"><div class="stat-bar-fill ${sodiumPct >= 70 ? 'green' : sodiumPct >= 40 ? 'yellow' : 'red'}" style="width:${sodiumPct}%"></div></div>
      </div>
    </div>
    <div class="stat-card">
      <h3>Top Foods</h3>
      <div class="top-foods-list">
        ${topFoods.length ? topFoods.map(([name, count]) => `
          <div class="top-food-item"><span class="top-food-name">${name}</span><span class="top-food-count">&times;${count}</span></div>
        `).join('') : '<div class="meal-empty">No data yet</div>'}
      </div>
    </div>
  `;
}

let statsPeriod = 'week';
document.querySelectorAll('.stats-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stats-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    statsPeriod = btn.dataset.range;
    renderStats();
  });
});

// ══════════════════════════════════
// LIBRARY PAGE
// ══════════════════════════════════
let libCategory = 'all';
let libTag = null;

function renderLibrary() {
  // Category pills
  const catPills = document.getElementById('category-pills');
  catPills.innerHTML = '';
  ['all', 'coffee', 'breakfast', 'lunch', 'dinner', 'snack', 'ingredient'].forEach(cat => {
    const pill = document.createElement('span');
    pill.className = 'filter-pill' + (libCategory === cat ? ' active' : '');
    pill.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    pill.addEventListener('click', () => { libCategory = cat; renderLibrary(); });
    catPills.appendChild(pill);
  });

  // Tag pills
  const tagPills = document.getElementById('tag-pills');
  tagPills.innerHTML = '';
  [null, 'homemade', 'quick', 'takeout', 'hungryroot'].forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'filter-pill' + (libTag === tag ? ' active' : '');
    pill.textContent = tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : 'All Tags';
    pill.addEventListener('click', () => { libTag = tag; renderLibrary(); });
    tagPills.appendChild(pill);
  });

  // Filter foods
  const q = document.getElementById('library-search').value.toLowerCase();
  let filtered = [...library];
  if (libCategory !== 'all') filtered = filtered.filter(f => f.category === libCategory);
  if (libTag) filtered = filtered.filter(f => (f.tags || []).includes(libTag));
  if (q) filtered = filtered.filter(f => f.name.toLowerCase().includes(q));

  const list = document.getElementById('library-list');
  list.innerHTML = '';
  if (filtered.length === 0) {
    list.innerHTML = '<div class="meal-empty" style="padding:2rem;text-align:center">No foods found</div>';
    return;
  }

  filtered.forEach(f => {
    const card = document.createElement('div');
    card.className = 'lib-food-card';
    const tagsHtml = (f.tags || []).map(t => `<span class="food-tag ${t}">${t}</span>`).join('');
    card.innerHTML = `
      <div class="lib-food-info">
        <div class="lib-food-name">${f.name}</div>
        <div class="lib-food-serving">${f.serving_label || '1 serving'}</div>
        <div class="lib-food-macros">
          <span>${f.calories} cal</span>
          <span>P:${r1(f.protein)}g</span>
          <span>C:${r1(f.carbs)}g</span>
          <span>F:${r1(f.fat)}g</span>
          <span>Na:${Math.round(f.sodium||0)}mg</span>
        </div>
        <div class="lib-food-tags">${tagsHtml}</div>
      </div>
      <div class="lib-food-actions">
        <button class="lib-action-btn edit-btn" data-id="${f.id}" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
        </button>
        <button class="lib-action-btn delete lib-delete-btn" data-id="${f.id}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    `;
    list.appendChild(card);
  });

  // Edit handlers
  list.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const food = library.find(f => f.id === btn.dataset.id);
      if (food) openEditModal(food);
    });
  });

  // Delete handlers
  list.querySelectorAll('.lib-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this food?')) deleteFoodFromLibrary(btn.dataset.id);
    });
  });
}

document.getElementById('library-search').addEventListener('input', () => renderLibrary());

// Add food to library button
document.getElementById('lib-add-food').addEventListener('click', () => {
  currentMeal = null;
  openAddModal();
  // Switch to quick add tab
  document.querySelectorAll('#add-food-modal .modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('#add-food-modal .modal-tab[data-tab="quick"]').classList.add('active');
  document.querySelectorAll('#add-food-modal .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-quick').classList.add('active');
  document.getElementById('qa-save-lib').checked = true;
});

// ══════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════
function renderSettings() {
  const content = document.getElementById('settings-content');
  const email = currentUser?.email || '';
  const t = getTargets();

  content.innerHTML = `
    <div class="settings-section">
      <h3>Body Stats</h3>
      <div class="setting-row">
        <span class="setting-label">Weight</span>
        <div><input type="number" class="setting-input" id="s-weight" value="${settings.weight}"> lbs</div>
      </div>
      <div class="setting-row">
        <span class="setting-label">Height</span>
        <div><input type="number" class="setting-input" id="s-height" value="${settings.height}" style="width:60px"> in</div>
      </div>
      <div class="setting-row">
        <span class="setting-label">Body Fat</span>
        <div><input type="number" class="setting-input" id="s-bf" value="${settings.bodyFat}" step="0.1"> %</div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Activity</h3>
      <div class="setting-row">
        <span class="setting-label">Avg Daily Steps</span>
        <input type="number" class="setting-input" id="s-steps" value="${settings.steps}">
      </div>
      <div class="setting-row">
        <span class="setting-label">Workouts / Week</span>
        <input type="number" class="setting-input" id="s-workouts" value="${settings.workouts}">
      </div>
      <div class="setting-row">
        <span class="setting-label">Zone 2 Min / Week</span>
        <input type="number" class="setting-input" id="s-zone2" value="${settings.zone2}">
      </div>
    </div>

    <div class="settings-section">
      <h3>Mode</h3>
      <div class="mode-buttons">
        ${Object.entries(MODES).map(([key, m]) => `
          <button class="mode-btn ${settings.mode === key ? 'active' : ''}" data-mode="${key}">${m.label}</button>
        `).join('')}
      </div>
    </div>

    <div class="settings-section">
      <h3>Macro Targets (${MODES[settings.mode]?.label || 'Recomp'})</h3>
      <div class="stat-row"><span class="stat-label">Calories</span><span class="stat-value">${t.cal[0]} – ${t.cal[1]}</span></div>
      <div class="stat-row"><span class="stat-label">Protein</span><span class="stat-value">${t.protein[0]} – ${t.protein[1]}g</span></div>
      <div class="stat-row"><span class="stat-label">Carbs</span><span class="stat-value">${t.carbs[0]} – ${t.carbs[1]}g</span></div>
      <div class="stat-row"><span class="stat-label">Fat</span><span class="stat-value">${t.fat[0]} – ${t.fat[1]}g</span></div>
      <div class="stat-row"><span class="stat-label">Fiber</span><span class="stat-value">${t.fiber[0]} – ${t.fiber[1]}g</span></div>
    </div>

    <div class="settings-section">
      <h3>Sodium Limit <small style="color:#ef4444;font-size:.6rem">Genome: ACE DD + ADD1</small></h3>
      <div class="setting-row">
        <span class="setting-label">Daily Max<br><small>Salt-sensitive genotype</small></span>
        <div><input type="number" class="setting-input" id="s-sodium" value="${settings.sodiumLimit}"> mg</div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Account</h3>
      <div class="setting-row">
        <span class="setting-label">Email</span>
        <span class="setting-email">${email}</span>
      </div>
      <div class="settings-actions">
        <button class="btn-secondary" id="s-export">Export Data</button>
        <button class="btn-danger" id="s-logout">Log Out</button>
      </div>
    </div>
  `;

  // Mode buttons
  content.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      settings.mode = btn.dataset.mode;
      await saveSettingsToDb();
      renderSettings();
      renderHome();
    });
  });

  // Setting input changes
  const saveSettingDebounced = debounce(async () => {
    settings.weight = parseFloat(document.getElementById('s-weight')?.value) || settings.weight;
    settings.height = parseFloat(document.getElementById('s-height')?.value) || settings.height;
    settings.bodyFat = parseFloat(document.getElementById('s-bf')?.value) || settings.bodyFat;
    settings.steps = parseFloat(document.getElementById('s-steps')?.value) || settings.steps;
    settings.workouts = parseFloat(document.getElementById('s-workouts')?.value) || settings.workouts;
    settings.zone2 = parseFloat(document.getElementById('s-zone2')?.value) || settings.zone2;
    settings.sodiumLimit = parseFloat(document.getElementById('s-sodium')?.value) || settings.sodiumLimit;
    await saveSettingsToDb();
  }, 800);

  content.querySelectorAll('.setting-input').forEach(input => {
    input.addEventListener('input', saveSettingDebounced);
  });

  // Logout
  content.querySelector('#s-logout')?.addEventListener('click', async () => {
    await sb.auth.signOut();
    showAuth();
  });

  // Export
  content.querySelector('#s-export')?.addEventListener('click', async () => {
    const { data: foods } = await sb.from('macro_foods').select('*').eq('user_id', currentUser.id);
    const { data: logs } = await sb.from('macro_log').select('*').eq('user_id', currentUser.id);
    const { data: water } = await sb.from('macro_water').select('*').eq('user_id', currentUser.id);
    const exported = { settings, foods, logs, water, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `macros-export-${todayStr()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('Data exported');
  });
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// ══════════════════════════════════
// NAV
// ══════════════════════════════════
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (page === 'stats') renderStats();
    if (page === 'library') renderLibrary();
    if (page === 'settings') renderSettings();
  });
});

// ══════════════════════════════════
// AUTH
// ══════════════════════════════════
let isSignUp = false;
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');

document.getElementById('auth-toggle-link').addEventListener('click', (e) => {
  e.preventDefault();
  isSignUp = !isSignUp;
  document.getElementById('auth-submit').textContent = isSignUp ? 'Sign Up' : 'Log In';
  document.getElementById('auth-toggle-text').textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
  document.getElementById('auth-toggle-link').textContent = isSignUp ? 'Log In' : 'Sign Up';
  authError.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  authError.textContent = '';
  document.getElementById('auth-submit').disabled = true;

  try {
    let result;
    if (isSignUp) {
      result = await sb.auth.signUp({ email, password });
    } else {
      result = await sb.auth.signInWithPassword({ email, password });
    }
    if (result.error) throw result.error;
    // Session will be picked up by onAuthStateChange
  } catch (err) {
    authError.textContent = err.message || 'Auth failed';
  }
  document.getElementById('auth-submit').disabled = false;
});

function showAuth() {
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('app-screen').classList.remove('active');
  currentUser = null;
}

async function showApp(user) {
  currentUser = user;
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');

  // Load data
  await loadSettings();
  await loadLibrary();

  // First time? Seed library + create settings
  if (library.length === 0) {
    await seedLibrary();
    await saveSettingsToDb();
    toast('Welcome! Your food library has been set up.');
  }

  await loadDayLog(currentDate);
  await loadWater(currentDate);
  renderHome();
}

// Auth state listener
sb.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    showApp(session.user);
  } else {
    showAuth();
  }
});

// Check existing session on load
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    showApp(session.user);
  } else {
    showAuth();
  }
})();

// ══════════════════════════════════
// SERVICE WORKER
// ══════════════════════════════════
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
