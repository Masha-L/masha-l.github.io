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
  recomp:   { label:'Recomp',   cal:[1650,1850], protein:[120,140], fat:[50,60], carbs:[150,200], fiber:[25,30] },
  cutting:  { label:'Cutting',  cal:[1800,2000], protein:[100,120], fat:[45,60], carbs:[200,260], fiber:[25,30] },
  maintain: { label:'Maintenance', cal:[2100,2300], protein:[87,109], fat:[52,66], carbs:[250,320], fiber:[25,30] },
  marathon: { label:'Marathon Fueling', cal:[2400,2600], protein:[87,109], fat:[55,70], carbs:[320,400], fiber:[25,30] },
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

// ── Reference Foods (built-in, not saved to Supabase) ──
const REFERENCE_FOODS = [
  // Include all SEED_FOODS by spread + additional common foods
  ...SEED_FOODS,
  // Fruits
  {name:'Banana',calories:105,protein:1.3,carbs:27,fat:0.4,fiber:3.1,sodium:1,category:'snack',tags:[],serving_label:'1 medium'},
  {name:'Apple',calories:95,protein:0.5,carbs:25,fat:0.3,fiber:4.4,sodium:2,category:'snack',tags:[],serving_label:'1 medium'},
  {name:'Orange',calories:62,protein:1.2,carbs:15,fat:0.2,fiber:3.1,sodium:0,category:'snack',tags:[],serving_label:'1 medium'},
  // Grains & Carbs
  {name:'White rice',calories:206,protein:4.3,carbs:45,fat:0.4,fiber:0.6,sodium:2,category:'ingredient',tags:[],serving_label:'1 cup cooked'},
  {name:'Pasta',calories:220,protein:8,carbs:43,fat:1.3,fiber:2.5,sodium:1,category:'ingredient',tags:[],serving_label:'1 cup cooked'},
  {name:'Bread',calories:79,protein:2.7,carbs:15,fat:1,fiber:0.6,sodium:147,category:'ingredient',tags:[],serving_label:'1 slice'},
  {name:'Bagel',calories:270,protein:10,carbs:53,fat:1.5,fiber:2.3,sodium:430,category:'breakfast',tags:[],serving_label:'1 bagel'},
  {name:'Pancake',calories:86,protein:2.5,carbs:11,fat:3.5,fiber:0.5,sodium:167,category:'breakfast',tags:[],serving_label:'1 pancake (4")'},
  {name:'Waffle',calories:95,protein:2.4,carbs:13,fat:3.7,fiber:0.8,sodium:220,category:'breakfast',tags:[],serving_label:'1 waffle'},
  {name:'Muffin',calories:340,protein:5,carbs:50,fat:13,fiber:2,sodium:350,category:'breakfast',tags:[],serving_label:'1 large muffin'},
  {name:'Cereal',calories:150,protein:3,carbs:33,fat:1,fiber:3,sodium:200,category:'breakfast',tags:[],serving_label:'1 cup'},
  {name:'Granola',calories:200,protein:5,carbs:30,fat:8,fiber:3,sodium:10,category:'breakfast',tags:[],serving_label:'1/2 cup'},
  {name:'Rice cake',calories:35,protein:0.7,carbs:7.3,fat:0.3,fiber:0.4,sodium:29,category:'snack',tags:[],serving_label:'1 cake'},
  {name:'Popcorn',calories:106,protein:3,carbs:21,fat:1.2,fiber:3.6,sodium:1,category:'snack',tags:[],serving_label:'3 cups popped'},
  // Dairy & Spreads
  {name:'Cheese',calories:113,protein:7,carbs:0.4,fat:9.3,fiber:0,sodium:174,category:'ingredient',tags:[],serving_label:'1 oz'},
  {name:'Butter',calories:102,protein:0.1,carbs:0,fat:11.5,fiber:0,sodium:91,category:'ingredient',tags:[],serving_label:'1 tbsp'},
  {name:'Cream cheese',calories:99,protein:1.7,carbs:1.6,fat:9.8,fiber:0,sodium:93,category:'ingredient',tags:[],serving_label:'2 tbsp'},
  {name:'Cottage cheese',calories:110,protein:12.5,carbs:4.5,fat:4.5,fiber:0,sodium:400,category:'snack',tags:[],serving_label:'1/2 cup'},
  {name:'String cheese',calories:80,protein:7,carbs:1,fat:5,fiber:0,sodium:200,category:'snack',tags:[],serving_label:'1 stick'},
  {name:'Whole milk',calories:149,protein:8,carbs:12,fat:8,fiber:0,sodium:105,category:'ingredient',tags:[],serving_label:'1 cup'},
  {name:'2% milk',calories:122,protein:8.1,carbs:11.7,fat:4.8,fiber:0,sodium:115,category:'ingredient',tags:[],serving_label:'1 cup'},
  {name:'Skim milk',calories:83,protein:8.3,carbs:12.2,fat:0.2,fiber:0,sodium:128,category:'ingredient',tags:[],serving_label:'1 cup'},
  {name:'Oat milk',calories:120,protein:3,carbs:16,fat:5,fiber:2,sodium:100,category:'ingredient',tags:[],serving_label:'1 cup'},
  // Nut butters & Spreads
  {name:'Peanut butter',calories:188,protein:8,carbs:6,fat:16,fiber:2,sodium:136,category:'ingredient',tags:[],serving_label:'2 tbsp'},
  {name:'Almond butter',calories:196,protein:6.8,carbs:6,fat:17.8,fiber:3.3,sodium:2,category:'ingredient',tags:[],serving_label:'2 tbsp'},
  {name:'Honey',calories:64,protein:0.1,carbs:17,fat:0,fiber:0,sodium:1,category:'ingredient',tags:[],serving_label:'1 tbsp'},
  {name:'Syrup',calories:52,protein:0,carbs:13.4,fat:0,fiber:0,sodium:2,category:'ingredient',tags:[],serving_label:'1 tbsp'},
  // Proteins
  {name:'Chicken thigh',calories:230,protein:28,carbs:0,fat:13,fiber:0,sodium:85,category:'dinner',tags:[],serving_label:'1 thigh (bone-in)'},
  {name:'Ground turkey',calories:170,protein:21,carbs:0,fat:9.4,fiber:0,sodium:70,category:'dinner',tags:[],serving_label:'4 oz'},
  {name:'Ground beef',calories:287,protein:19.4,carbs:0,fat:23,fiber:0,sodium:75,category:'dinner',tags:[],serving_label:'4 oz (80/20)'},
  {name:'Steak',calories:271,protein:26,carbs:0,fat:18,fiber:0,sodium:60,category:'dinner',tags:[],serving_label:'6 oz'},
  {name:'Tuna',calories:130,protein:29,carbs:0,fat:1,fiber:0,sodium:40,category:'lunch',tags:[],serving_label:'1 can (5 oz)'},
  {name:'Shrimp',calories:84,protein:20,carbs:0.2,fat:0.3,fiber:0,sodium:119,category:'dinner',tags:[],serving_label:'4 oz'},
  {name:'Tofu',calories:94,protein:10,carbs:2.3,fat:5,fiber:0.5,sodium:9,category:'dinner',tags:[],serving_label:'1/2 cup firm'},
  // Legumes
  {name:'Black beans',calories:114,protein:7.6,carbs:20,fat:0.5,fiber:7.5,sodium:1,category:'ingredient',tags:[],serving_label:'1/2 cup'},
  {name:'Kidney beans',calories:112,protein:7.7,carbs:20,fat:0.4,fiber:5.7,sodium:1,category:'ingredient',tags:[],serving_label:'1/2 cup'},
  {name:'Lentils',calories:115,protein:9,carbs:20,fat:0.4,fiber:7.8,sodium:2,category:'ingredient',tags:[],serving_label:'1/2 cup cooked'},
  {name:'Edamame',calories:120,protein:11,carbs:9,fat:5,fiber:4,sodium:5,category:'snack',tags:[],serving_label:'1/2 cup shelled'},
  // Vegetables
  {name:'Broccoli',calories:31,protein:2.6,carbs:6,fat:0.3,fiber:2.4,sodium:30,category:'ingredient',tags:[],serving_label:'1 cup'},
  {name:'Spinach',calories:7,protein:0.9,carbs:1.1,fat:0.1,fiber:0.7,sodium:24,category:'ingredient',tags:[],serving_label:'1 cup raw'},
  {name:'Cucumber',calories:16,protein:0.7,carbs:3.6,fat:0.1,fiber:0.5,sodium:2,category:'ingredient',tags:[],serving_label:'1 cup sliced'},
  {name:'Tomato',calories:22,protein:1.1,carbs:4.8,fat:0.2,fiber:1.5,sodium:6,category:'ingredient',tags:[],serving_label:'1 medium'},
  {name:'Lettuce',calories:5,protein:0.5,carbs:1,fat:0.1,fiber:0.5,sodium:5,category:'ingredient',tags:[],serving_label:'1 cup shredded'},
  {name:'Corn',calories:88,protein:3.3,carbs:19,fat:1.4,fiber:2,sodium:1,category:'ingredient',tags:[],serving_label:'1 ear'},
  {name:'Potato',calories:163,protein:4.3,carbs:37,fat:0.2,fiber:3.8,sodium:13,category:'ingredient',tags:[],serving_label:'1 medium'},
  // Fast food / Prepared
  {name:'French fries',calories:365,protein:4,carbs:48,fat:17,fiber:4,sodium:210,category:'snack',tags:['takeout'],serving_label:'medium order'},
  {name:'Chips',calories:160,protein:2,carbs:15,fat:10,fiber:1,sodium:170,category:'snack',tags:[],serving_label:'1 oz'},
  {name:'Cookie',calories:200,protein:2,carbs:28,fat:9,fiber:1,sodium:120,category:'snack',tags:[],serving_label:'1 large cookie'},
  {name:'Ice cream',calories:207,protein:3.5,carbs:23,fat:11,fiber:0.7,sodium:80,category:'snack',tags:[],serving_label:'1/2 cup'},
  {name:'Pizza slice',calories:285,protein:12,carbs:36,fat:10,fiber:2.5,sodium:640,category:'dinner',tags:['takeout'],serving_label:'1 slice'},
  {name:'Burger',calories:540,protein:34,carbs:40,fat:27,fiber:2,sodium:790,category:'lunch',tags:['takeout'],serving_label:'1 burger'},
  {name:'Sandwich',calories:350,protein:20,carbs:35,fat:14,fiber:3,sodium:680,category:'lunch',tags:[],serving_label:'1 sandwich'},
  {name:'Wrap',calories:300,protein:15,carbs:35,fat:12,fiber:2,sodium:600,category:'lunch',tags:[],serving_label:'1 wrap'},
  {name:'Sushi roll',calories:255,protein:9,carbs:38,fat:7,fiber:1.5,sodium:500,category:'dinner',tags:[],serving_label:'6-8 pieces'},
  {name:'Ramen',calories:436,protein:17,carbs:56,fat:16,fiber:2,sodium:1800,category:'dinner',tags:['takeout'],serving_label:'1 bowl'},
  {name:'Soup',calories:150,protein:8,carbs:18,fat:5,fiber:2,sodium:800,category:'lunch',tags:[],serving_label:'1 bowl'},
  {name:'Caesar salad',calories:260,protein:9,carbs:12,fat:20,fiber:3,sodium:580,category:'lunch',tags:[],serving_label:'1 bowl'},
  {name:'Garden salad',calories:80,protein:3,carbs:10,fat:3,fiber:3,sodium:120,category:'lunch',tags:[],serving_label:'1 bowl'},
  // Drinks
  {name:'Smoothie',calories:250,protein:10,carbs:40,fat:5,fiber:4,sodium:80,category:'snack',tags:[],serving_label:'16 oz'},
  {name:'Orange juice',calories:112,protein:1.7,carbs:26,fat:0.5,fiber:0.5,sodium:2,category:'breakfast',tags:[],serving_label:'1 cup'},
  {name:'Soda',calories:140,protein:0,carbs:39,fat:0,fiber:0,sodium:45,category:'snack',tags:[],serving_label:'12 oz can'},
  {name:'Coffee black',calories:2,protein:0.3,carbs:0,fat:0,fiber:0,sodium:5,category:'coffee',tags:[],serving_label:'1 cup'},
  {name:'Tea',calories:2,protein:0,carbs:0.5,fat:0,fiber:0,sodium:7,category:'coffee',tags:[],serving_label:'1 cup'},
  {name:'Protein bar',calories:220,protein:20,carbs:25,fat:8,fiber:3,sodium:200,category:'snack',tags:[],serving_label:'1 bar'},
  {name:'Energy drink',calories:110,protein:0,carbs:28,fat:0,fiber:0,sodium:200,category:'snack',tags:[],serving_label:'8.4 oz can'},
  // Nuts & Snacks
  {name:'Almonds',calories:164,protein:6,carbs:6,fat:14,fiber:3.5,sodium:0,category:'snack',tags:[],serving_label:'1 oz (23 almonds)'},
  {name:'Walnuts',calories:185,protein:4.3,carbs:3.9,fat:18.5,fiber:1.9,sodium:1,category:'snack',tags:[],serving_label:'1 oz'},
  {name:'Cashews',calories:157,protein:5.2,carbs:8.6,fat:12.4,fiber:0.9,sodium:3,category:'snack',tags:[],serving_label:'1 oz'},
  {name:'Dark chocolate',calories:170,protein:2.2,carbs:13,fat:12,fiber:3.1,sodium:6,category:'snack',tags:[],serving_label:'1 oz'},
  // Avocado (standalone, not half)
  {name:'Avocado',calories:218,protein:2.7,carbs:12,fat:20,fiber:9,sodium:10,category:'ingredient',tags:[],serving_label:'1 whole'},
];

// ── Food Description Parser ──
const QUANTITY_WORDS = {
  'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'half': 0.5, 'quarter': 0.25, 'couple': 2, 'few': 3, 'some': 1,
};

const SIZE_MULTIPLIERS = {
  'large': 1.25, 'big': 1.25, 'extra large': 1.5, 'xl': 1.5,
  'small': 0.75, 'mini': 0.5, 'tiny': 0.5,
  'double': 2, 'triple': 3,
};

// Unit words we strip when matching food names
const UNIT_WORDS = ['cup', 'cups', 'slice', 'slices', 'piece', 'pieces', 'bowl', 'bowls',
  'serving', 'servings', 'scoop', 'scoops', 'tbsp', 'tablespoon', 'tablespoons',
  'tsp', 'teaspoon', 'teaspoons', 'oz', 'ounce', 'ounces', 'can', 'cans',
  'glass', 'glasses', 'plate', 'plates', 'handful', 'handfuls', 'bag', 'bags'];

function singularize(word) {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && !word.endsWith('ses') && !word.endsWith('ces')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function parseDescribedFood(input) {
  // Split by delimiters
  const segments = input
    .split(/\s*(?:,|\band\b|\bwith\b|\bplus\b|\+)\s*/i)
    .map(s => s.trim())
    .filter(Boolean);

  return segments.map(seg => parseSegment(seg));
}

function parseSegment(segment) {
  const words = segment.toLowerCase().split(/\s+/);
  let quantity = 1;
  let sizeMultiplier = 1;
  let foodWords = [];
  let i = 0;

  // Extract numeric quantity at start
  if (words[0] && /^\d+(\.\d+)?$/.test(words[0])) {
    quantity = parseFloat(words[0]);
    i = 1;
  } else if (words[0] && QUANTITY_WORDS[words[0]] !== undefined) {
    quantity = QUANTITY_WORDS[words[0]];
    i = 1;
  }

  // Check for "and a half" pattern
  if (words[i] === 'and' && words[i+1] === 'a' && words[i+2] === 'half') {
    quantity += 0.5;
    i += 3;
  }

  // Extract size modifier
  if (words[i] && SIZE_MULTIPLIERS[words[i]]) {
    sizeMultiplier = SIZE_MULTIPLIERS[words[i]];
    i++;
  }
  // Check two-word size ("extra large")
  if (i >= 2 && SIZE_MULTIPLIERS[words[i-2] + ' ' + words[i-1]]) {
    sizeMultiplier = SIZE_MULTIPLIERS[words[i-2] + ' ' + words[i-1]];
  }

  // Remaining words are the food name — strip unit words
  foodWords = words.slice(i).filter(w => !UNIT_WORDS.includes(w) && w !== 'of');

  const foodQuery = foodWords.join(' ').trim();
  if (!foodQuery) return { original: segment, quantity, sizeMultiplier, match: null, confidence: 'unknown' };

  // Match against reference foods + library
  const allFoods = [...REFERENCE_FOODS, ...library];
  const result = matchFood(foodQuery, allFoods);

  return {
    original: segment,
    quantity,
    sizeMultiplier,
    ...result,
  };
}

function matchFood(query, foods) {
  const q = query.toLowerCase();
  const qSingular = singularize(q);
  const qWords = q.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;
  let confidence = 'unknown';

  for (const food of foods) {
    const name = food.name.toLowerCase();
    const nameSingular = singularize(name);
    let score = 0;

    // Exact match
    if (name === q || nameSingular === qSingular) {
      score = 100;
    }
    // Name contains query or query contains name
    else if (name.includes(q) || q.includes(name)) {
      score = 80;
    }
    // Singular forms match partially
    else if (nameSingular.includes(qSingular) || qSingular.includes(nameSingular)) {
      score = 70;
    }
    // Word-level matching
    else {
      const nameWords = name.split(/\s+/);
      const matchedWords = qWords.filter(w => 
        nameWords.some(nw => nw === w || singularize(nw) === singularize(w) || nw.startsWith(w) || w.startsWith(nw))
      );
      if (matchedWords.length > 0) {
        score = (matchedWords.length / Math.max(qWords.length, nameWords.length)) * 60;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = food;
    }
  }

  if (bestScore >= 70) confidence = 'exact';
  else if (bestScore >= 30) confidence = 'fuzzy';
  else confidence = 'unknown';

  return { match: bestMatch, confidence, matchScore: bestScore };
}

// ── State ──
let currentUser = null;
let currentDate = todayStr();
let currentMeal = null;
let settings = { mode:'recomp', weight:148, height:68.5, bodyFat:25.9, steps:8000, workouts:4, zone2:120, sodiumLimit:2000, goalWeight:130, activityFactor:1.55 };
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

function getMiniGaugeColor(value, range) {
  if (value > range[1] * 1.1) return '#ef4444';    // red — over 110% of high target
  if (value >= range[0]) return '#4ade80';          // green — in range
  if (value < range[0] * 0.8) return '#f59e0b';    // yellow — under 80% of low target
  return '#10b981';                                 // teal — approaching range (80-100%)
}

function getCalArcColor(value, range) {
  if (value > range[1] * 1.1) return '#ef4444';
  if (value > range[1]) return '#f59e0b';
  if (value >= range[0]) return '#4ade80';
  return '#10b981';
}

// Get point on arc for tick marks
function arcPoint(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ══════════════════════════════════
// RENDER GAUGES
// ══════════════════════════════════
function renderGauges(totals) {
  const targets = getTargets();
  const svg = document.getElementById('calorie-gauge');

  // Calorie gauge — arc goes from 180° (left) to 0° (right)
  const calMax = targets.cal[1] * 1.3; // max displayable
  const calFrac = Math.min(totals.cal / calMax, 1);
  const calArc = document.getElementById('cal-arc');
  setArc(calArc, calFrac, CAL_ARC_LENGTH);
  calArc.setAttribute('stroke', getCalArcColor(totals.cal, targets.cal));

  document.getElementById('cal-eaten').textContent = Math.round(totals.cal);

  // Remove old ticks
  svg.querySelectorAll('.tick-group').forEach(el => el.remove());

  // Add tick marks for low and high targets
  const tickGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  tickGroup.classList.add('tick-group');
  const cx = 100, cy = 110, r = 80;

  [targets.cal[0], targets.cal[1]].forEach((val, idx) => {
    const frac = val / calMax;
    const angle = 180 - (frac * 180); // 180° = left, 0° = right
    const outerPt = arcPoint(cx, cy, r + 10, angle);
    const innerPt = arcPoint(cx, cy, r - 10, angle);
    const labelPt = arcPoint(cx, cy, r + 20, angle);

    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', innerPt.x);
    tick.setAttribute('y1', innerPt.y);
    tick.setAttribute('x2', outerPt.x);
    tick.setAttribute('y2', outerPt.y);
    tick.setAttribute('stroke', '#888');
    tick.setAttribute('stroke-width', '1.5');
    tickGroup.appendChild(tick);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelPt.x);
    label.setAttribute('y', labelPt.y);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', '#888');
    label.setAttribute('font-size', '8');
    label.textContent = val;
    tickGroup.appendChild(label);
  });

  svg.appendChild(tickGroup);

  // Hide old range text labels
  const calLow = document.getElementById('cal-low-label');
  const calHigh = document.getElementById('cal-high-label');
  if (calLow) calLow.textContent = '';
  if (calHigh) calHigh.textContent = '';

  // Mini gauges with color coding
  const macroKeys = ['protein', 'carbs', 'fat', 'fiber'];
  const gaugeEls = document.querySelectorAll('.mini-gauge');

  gaugeEls.forEach((el, i) => {
    const key = macroKeys[i];
    const range = targets[key];
    const max = range[1] * 1.3;
    const frac = Math.min(totals[key] / max, 1);
    const arc = el.querySelector('.mini-arc');
    setArc(arc, frac, MINI_ARC_LENGTH);
    const color = getMiniGaugeColor(totals[key], range);
    arc.setAttribute('stroke', color);

    const valueEl = el.querySelector('.mini-value');
    valueEl.textContent = Math.round(totals[key]) + 'g';
    valueEl.style.color = color;

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
      goalWeight: 130,
      activityFactor: 1.55,
    };
  }
  // Load goal_weight and activity_factor from localStorage (fallback since DB may not have columns)
  const lsGoal = localStorage.getItem('macros_goal_weight');
  const lsAF = localStorage.getItem('macros_activity_factor');
  if (lsGoal) settings.goalWeight = parseFloat(lsGoal);
  if (lsAF) settings.activityFactor = parseFloat(lsAF);
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
  const proteinGap = isProteinGap();

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
        const pClass = proteinGap ? ' protein-highlight' : '';
        row.innerHTML = `
          <div class="meal-item-info">
            <div class="meal-item-name">${item.name}</div>
            <div class="meal-item-macros">
              <span>${Math.round(item.calories)} cal</span>
              <span class="${pClass}">P:${r1(item.protein)}g</span>
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

// Reset Day button
document.getElementById('reset-day-btn').addEventListener('click', async () => {
  if (!confirm('Clear all food logged for today? This cannot be undone.')) return;
  if (!currentUser) return;
  const { error } = await sb.from('macro_log').delete().eq('user_id', currentUser.id).eq('date', currentDate);
  if (error) { toast('Error resetting day'); console.error(error); return; }
  dayLog = [];
  renderHome();
  toast('Day cleared');
});

// ══════════════════════════════════
// ADD FOOD MODAL
// ══════════════════════════════════
const addModal = document.getElementById('add-food-modal');

function openAddModal() {
  addModal.classList.add('active');

  // Auto-filter by meal category
  modalCatFilter = currentMeal || 'all';

  // Reset tabs
  document.querySelectorAll('#add-food-modal .modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('#add-food-modal .modal-tab[data-tab="library"]').classList.add('active');
  document.querySelectorAll('#add-food-modal .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-library').classList.add('active');
  document.getElementById('modal-lib-search').value = '';
  document.getElementById('modal-usda-search').value = '';
  document.getElementById('modal-usda-list').innerHTML = '';
  document.getElementById('describe-input').value = '';
  document.getElementById('describe-results').innerHTML = '';
  document.getElementById('describe-log-btn').style.display = 'none';
  describeResults = [];
  document.getElementById('servings-row').style.display = 'none';
  servingFood = null;
  servingCount = 1;

  // Update modal title to show meal
  const mealName = MEALS.find(m => m.id === currentMeal)?.name;
  document.getElementById('modal-title').textContent = mealName ? `Add to ${mealName}` : 'Add Food';

  renderModalCategoryPills();
  renderModalLibrary();
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

// Internal raw score for sorting
function scoreFoodRaw(food) {
  const totals = computeTotals();
  const targets = getTargets();
  let score = 0;

  const proteinGap = targets.protein[1] - totals.protein;
  if (proteinGap > 0 && food.protein > 0) {
    score += (food.protein / proteinGap) * 50;
  }

  const calRemaining = targets.cal[1] - totals.cal;
  if (calRemaining > 0) {
    if (food.calories <= calRemaining) score += 10;
    else score -= 20;
  } else {
    score -= 30;
  }

  const sodiumPct = totals.sodium / settings.sodiumLimit;
  if (sodiumPct > 0.7 && food.sodium > 300) score -= 15;

  if (totals.fiber < targets.fiber[0] && food.fiber > 2) score += 5;

  return score;
}

// 0-10 display score for badges
function scoreFood(food) {
  const totals = computeTotals();
  const targets = getTargets();
  let score = 5; // baseline

  // Protein gap fill (0-3 points)
  const proteinGap = targets.protein[1] - totals.protein;
  if (proteinGap > 0 && food.protein > 0) {
    score += Math.min(3, (food.protein / proteinGap) * 3);
  } else if (proteinGap <= 0 && food.protein > 20) {
    score -= 1; // already have enough protein
  }

  // Calorie budget (0-3 points)
  const calRemaining = targets.cal[1] - totals.cal;
  if (calRemaining > 0) {
    if (food.calories <= calRemaining * 0.5) score += 3;
    else if (food.calories <= calRemaining) score += 1.5;
    else score -= 3;
  } else {
    score -= 4; // over budget
  }

  // Sodium risk (-2 to +1)
  const sodiumPct = totals.sodium / settings.sodiumLimit;
  if (sodiumPct > 0.7 && food.sodium > 300) score -= 2;
  else if (food.sodium < 100) score += 0.5;

  // Fiber bonus
  if (totals.fiber < targets.fiber[0] && food.fiber > 2) score += 1;

  return Math.max(0, Math.min(10, Math.round(score)));
}

function getScoreClass(score) {
  if (score >= 8) return 'score-green';
  if (score >= 4) return 'score-yellow';
  return 'score-red';
}

let modalCatFilter = 'all';

function renderModalCategoryPills() {
  const container = document.getElementById('modal-cat-pills');
  if (!container) return;
  container.innerHTML = '';
  const cats = ['all', 'coffee', 'breakfast', 'lunch', 'dinner', 'snack', 'ingredient'];
  cats.forEach(cat => {
    const pill = document.createElement('span');
    pill.className = 'modal-cat-pill' + (modalCatFilter === cat ? ' active' : '');
    pill.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    pill.addEventListener('click', () => { modalCatFilter = cat; renderModalCategoryPills(); renderModalLibrary(); });
    container.appendChild(pill);
  });
}

function isProteinGap() {
  const totals = computeTotals();
  const targets = getTargets();
  return totals.protein < targets.protein[0];
}

function renderModalLibrary(filter) {
  const q = (filter || document.getElementById('modal-lib-search').value || '').toLowerCase();
  const list = document.getElementById('modal-lib-list');
  let filtered = library.filter(f => !q || f.name.toLowerCase().includes(q));

  // Category filter
  if (modalCatFilter !== 'all') {
    filtered = filtered.filter(f => f.category === modalCatFilter);
  }

  // Smart sort: prioritize by what's missing in today's macros
  filtered = filtered.map(f => ({ ...f, _score: scoreFoodRaw(f), _displayScore: scoreFood(f) }))
    .sort((a, b) => b._score - a._score);

  list.innerHTML = '';
  if (filtered.length === 0) {
    list.innerHTML = '<div class="meal-empty">No foods found</div>';
    return;
  }

  // Show gap hint at top
  const totals = computeTotals();
  const targets = getTargets();
  const proteinLeft = Math.max(0, Math.round(targets.protein[0] - totals.protein));
  const calLeft = Math.max(0, Math.round(targets.cal[0] - totals.cal));
  const proteinIsGap = isProteinGap();

  if (proteinLeft > 0 || calLeft > 0) {
    const hint = document.createElement('div');
    hint.className = 'modal-gap-hint';
    const parts = [];
    if (proteinLeft > 0) parts.push(`${proteinLeft}g protein`);
    if (calLeft > 0) parts.push(`${calLeft} cal`);
    hint.innerHTML = `Still need: ${parts.join(', ')}${proteinIsGap ? ' <span class="protein-gap-badge">protein priority</span>' : ''}`;
    list.appendChild(hint);
  }

  filtered.forEach(f => {
    const item = document.createElement('div');
    item.className = 'modal-food-item';
    const ds = f._displayScore;
    const scoreClass = getScoreClass(ds);
    const proteinClass = proteinIsGap && f.protein >= 10 ? ' protein-highlight' : '';
    item.innerHTML = `
      <div class="modal-food-name">${f.name}</div>
      <div class="modal-food-serving">${f.serving_label || '1 serving'}</div>
      <div class="modal-food-macros">
        <span>${f.calories} cal</span>
        <span class="${proteinClass}">P:${r1(f.protein)}g</span>
        <span>C:${r1(f.carbs)}g</span>
        <span>F:${r1(f.fat)}g</span>
      </div>
      <div class="score-badge ${scoreClass}">${ds}</div>
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
      const ds = scoreFood(food);
      const sc = getScoreClass(ds);
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
        <div class="score-badge ${sc}">${ds}</div>
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
// DESCRIBE TAB
// ══════════════════════════════════
let describeResults = []; // parsed results for logging

document.getElementById('describe-estimate-btn').addEventListener('click', () => {
  const input = document.getElementById('describe-input').value.trim();
  if (!input) return;
  describeResults = parseDescribedFood(input);
  renderDescribeResults();
});

// Allow Enter key (but Shift+Enter for newline)
document.getElementById('describe-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('describe-estimate-btn').click();
  }
});

function renderDescribeResults() {
  const container = document.getElementById('describe-results');
  const logBtn = document.getElementById('describe-log-btn');
  container.innerHTML = '';

  if (describeResults.length === 0) {
    logBtn.style.display = 'none';
    return;
  }

  const hasMatches = describeResults.some(r => r.match);
  logBtn.style.display = hasMatches ? 'block' : 'none';

  describeResults.forEach((result, idx) => {
    const card = document.createElement('div');
    card.className = `describe-result-card confidence-${result.confidence}`;

    if (result.match) {
      const food = result.match;
      const qty = result.quantity;
      const sizeMult = result.sizeMultiplier || 1;
      const totalMult = qty * sizeMult;
      const cal = Math.round(food.calories * totalMult);
      const prot = r1(food.protein * totalMult);
      const carbs = r1(food.carbs * totalMult);
      const fat = r1(food.fat * totalMult);
      const fiber = r1((food.fiber || 0) * totalMult);
      const sodium = Math.round((food.sodium || 0) * totalMult);

      const confLabel = result.confidence === 'exact' ? 'Matched' : 'Fuzzy match';
      const confClass = result.confidence;
      const sizeNote = sizeMult !== 1 ? ` (${Object.entries(SIZE_MULTIPLIERS).find(([k,v]) => v === sizeMult)?.[0] || sizeMult + 'x'})` : '';

      card.innerHTML = `
        <div class="describe-result-header">
          <span class="describe-result-name">${food.name}</span>
          <span class="describe-result-qty">${qty}x${sizeNote}</span>
        </div>
        <div class="describe-result-macros">
          <span>${cal} cal</span>
          <span>P:${prot}g</span>
          <span>C:${carbs}g</span>
          <span>F:${fat}g</span>
          <span>Fib:${fiber}g</span>
          <span>Na:${sodium}mg</span>
        </div>
        <span class="describe-confidence-tag ${confClass}">${confLabel}</span>
        <div class="describe-edit-row">
          <div><label>Qty</label><input type="number" step="0.5" min="0.5" value="${qty}" data-idx="${idx}" data-field="quantity"></div>
          <div><label>Cal</label><input type="number" value="${cal}" data-idx="${idx}" data-field="calories"></div>
          <div><label>P</label><input type="number" step="0.1" value="${prot}" data-idx="${idx}" data-field="protein"></div>
          <div><label>C</label><input type="number" step="0.1" value="${carbs}" data-idx="${idx}" data-field="carbs"></div>
          <div><label>F</label><input type="number" step="0.1" value="${fat}" data-idx="${idx}" data-field="fat"></div>
        </div>
      `;

      // Handle quantity changes to recalculate macros
      const qtyInput = card.querySelector('[data-field="quantity"]');
      qtyInput.addEventListener('change', () => {
        describeResults[idx].quantity = parseFloat(qtyInput.value) || 1;
        renderDescribeResults();
      });
    } else {
      card.innerHTML = `
        <div class="describe-result-header">
          <span class="describe-result-name">"${result.original}"</span>
        </div>
        <span class="describe-confidence-tag unknown">Not found</span>
        <span class="describe-unknown-link" data-idx="${idx}">Add manually &rarr;</span>
      `;

      card.querySelector('.describe-unknown-link').addEventListener('click', () => {
        // Switch to Quick Add tab with the name pre-filled
        document.querySelectorAll('#add-food-modal .modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('#add-food-modal .modal-tab[data-tab="quick"]').classList.add('active');
        document.querySelectorAll('#add-food-modal .tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-quick').classList.add('active');
        document.getElementById('qa-name').value = result.original;
        document.getElementById('qa-name').focus();
      });
    }

    container.appendChild(card);
  });
}

document.getElementById('describe-log-btn').addEventListener('click', async () => {
  if (!currentMeal) { toast('Select a meal first'); return; }

  let logged = 0;
  for (const result of describeResults) {
    if (!result.match) continue;
    const food = result.match;
    const qty = result.quantity;
    const sizeMult = result.sizeMultiplier || 1;

    // Check if user edited the macros directly
    const idx = describeResults.indexOf(result);
    const card = document.querySelectorAll('.describe-result-card')[idx];
    let finalFood;

    if (card) {
      const calInput = card.querySelector('[data-field="calories"]');
      const protInput = card.querySelector('[data-field="protein"]');
      const carbInput = card.querySelector('[data-field="carbs"]');
      const fatInput = card.querySelector('[data-field="fat"]');

      if (calInput) {
        // Use edited values directly (already multiplied)
        finalFood = {
          ...food,
          calories: parseFloat(calInput.value) || 0,
          protein: parseFloat(protInput.value) || 0,
          carbs: parseFloat(carbInput.value) || 0,
          fat: parseFloat(fatInput.value) || 0,
          fiber: (food.fiber || 0) * qty * sizeMult,
          sodium: (food.sodium || 0) * qty * sizeMult,
        };
        await addLogEntry(currentMeal, finalFood, 1);
        logged++;
        continue;
      }
    }

    // Fallback: use computed values
    finalFood = { ...food };
    await addLogEntry(currentMeal, finalFood, qty * sizeMult);
    logged++;
  }

  if (logged > 0) {
    toast(`Logged ${logged} item${logged > 1 ? 's' : ''}`);
    document.getElementById('describe-input').value = '';
    document.getElementById('describe-results').innerHTML = '';
    document.getElementById('describe-log-btn').style.display = 'none';
    describeResults = [];
    closeAddModal();
  }
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
function computeBMR() {
  const weightKg = settings.weight * 0.453592;
  const leanMassKg = weightKg * (1 - settings.bodyFat / 100);
  const bmr = 370 + (21.6 * leanMassKg);
  return { weightKg: r1(weightKg), leanMassKg: r1(leanMassKg), bmr: Math.round(bmr) };
}

function computeTDEE() {
  const { bmr } = computeBMR();
  return Math.round(bmr * settings.activityFactor);
}

function lbsToKg(lbs) { return r1(lbs * 0.453592); }
function kgToLbs(kg) { return r1(kg / 0.453592); }
function inToCm(inches) { return r1(inches * 2.54); }
function cmToIn(cm) { return r1(cm / 2.54); }

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary (desk job, little exercise)' },
  { value: 1.375, label: 'Light (1-3 days/week)' },
  { value: 1.55, label: 'Moderate (3-5 days/week)' },
  { value: 1.725, label: 'Active (6-7 days/week)' },
  { value: 1.9, label: 'Very Active (2x/day, physical job)' },
];

function renderSettings() {
  const content = document.getElementById('settings-content');
  const email = currentUser?.email || '';
  const t = getTargets();
  const { weightKg, leanMassKg, bmr } = computeBMR();
  const tdee = computeTDEE();
  const goalWeightKg = lbsToKg(settings.goalWeight);
  const weightDiff = r1(settings.weight - settings.goalWeight);
  const heightCm = inToCm(settings.height);

  // Estimate weeks to goal at current deficit
  const dailyDeficit = tdee - ((t.cal[0] + t.cal[1]) / 2);
  const lbsToLose = Math.max(0, weightDiff);
  const weeksToGoal = dailyDeficit > 0 && lbsToLose > 0 ? Math.round((lbsToLose * 3500) / (dailyDeficit * 7)) : 0;

  const afLabel = ACTIVITY_LEVELS.find(a => a.value === settings.activityFactor)?.label || `Custom (${settings.activityFactor})`;

  content.innerHTML = `
    <div class="settings-section">
      <h3>Body Stats</h3>
      <div class="setting-row">
        <span class="setting-label">Weight</span>
        <div class="dual-input">
          <input type="number" class="setting-input" id="s-weight-lbs" value="${settings.weight}" step="0.1"> <span class="unit-label">lbs</span>
          <input type="number" class="setting-input" id="s-weight-kg" value="${weightKg}" step="0.1"> <span class="unit-label">kg</span>
        </div>
      </div>
      <div class="setting-row">
        <span class="setting-label">Height</span>
        <div class="dual-input">
          <input type="number" class="setting-input" id="s-height-in" value="${settings.height}" step="0.5" style="width:60px"> <span class="unit-label">in</span>
          <input type="number" class="setting-input" id="s-height-cm" value="${heightCm}" step="0.1" style="width:60px"> <span class="unit-label">cm</span>
        </div>
      </div>
      <div class="setting-row">
        <span class="setting-label">Body Fat</span>
        <div><input type="number" class="setting-input" id="s-bf" value="${settings.bodyFat}" step="0.1"> <span class="unit-label">%</span></div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Goal Weight</h3>
      <div class="setting-row">
        <span class="setting-label">Goal</span>
        <div class="dual-input">
          <input type="number" class="setting-input" id="s-goal-lbs" value="${settings.goalWeight}" step="0.1"> <span class="unit-label">lbs</span>
          <input type="number" class="setting-input" id="s-goal-kg" value="${goalWeightKg}" step="0.1"> <span class="unit-label">kg</span>
        </div>
      </div>
      <div class="goal-progress-card">
        <div class="goal-progress-text">
          Current: <strong>${settings.weight} lbs</strong> &rarr; Goal: <strong>${settings.goalWeight} lbs</strong>
          ${weightDiff > 0 ? `<span class="goal-diff">(${weightDiff} lbs to lose)</span>` : weightDiff < 0 ? `<span class="goal-diff gain">(${Math.abs(weightDiff)} lbs to gain)</span>` : `<span class="goal-diff at-goal">At goal!</span>`}
        </div>
        ${weeksToGoal > 0 ? `<div class="goal-eta">~${weeksToGoal} weeks at current deficit (${Math.round(dailyDeficit)} cal/day)</div>` : ''}
      </div>
    </div>

    <div class="settings-section">
      <h3>TDEE Breakdown</h3>
      <div class="formula-card">
        <div class="formula-title">Katch-McArdle BMR</div>
        <div class="formula-equation">BMR = 370 + (21.6 &times; lean mass kg)</div>
        <div class="formula-steps">
          <div class="formula-step">
            <span>Weight</span>
            <span>${settings.weight} lbs &rarr; ${weightKg} kg</span>
          </div>
          <div class="formula-step">
            <span>Body Fat</span>
            <span>${settings.bodyFat}%</span>
          </div>
          <div class="formula-step">
            <span>Lean Mass</span>
            <span>${weightKg} &times; ${r1(1 - settings.bodyFat/100)} = <strong>${leanMassKg} kg</strong></span>
          </div>
          <div class="formula-step highlight">
            <span>BMR</span>
            <span>370 + (21.6 &times; ${leanMassKg}) = <strong>${bmr} cal/day</strong></span>
          </div>
        </div>
      </div>
      <div class="setting-row" style="margin-top:.75rem">
        <span class="setting-label">Activity Factor</span>
        <select class="setting-select" id="s-activity-factor">
          ${ACTIVITY_LEVELS.map(a => `<option value="${a.value}" ${settings.activityFactor === a.value ? 'selected' : ''}>${a.label}</option>`).join('')}
        </select>
      </div>
      <div class="tdee-result">
        <div class="tdee-equation">${bmr} <span class="tdee-op">&times;</span> ${settings.activityFactor} <span class="tdee-op">=</span> <strong>${tdee} cal/day</strong></div>
        <div class="tdee-labels">
          <span>BMR</span>
          <span>Activity</span>
          <span>TDEE</span>
        </div>
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
      <h3>Macro Targets <small class="settings-mode-label">${MODES[settings.mode]?.label || 'Recomp'}</small></h3>
      <div class="macro-target-row">
        <div class="stat-row"><span class="stat-label">Calories</span><span class="stat-value">${t.cal[0]} &ndash; ${t.cal[1]}</span></div>
      </div>
      <div class="macro-target-row">
        <div class="stat-row"><span class="stat-label">Protein</span><span class="stat-value">${t.protein[0]} &ndash; ${t.protein[1]}g</span></div>
        <div class="macro-explanation">1g per lb goal weight for muscle preservation during cut</div>
      </div>
      <div class="macro-target-row">
        <div class="stat-row"><span class="stat-label">Fat</span><span class="stat-value">${t.fat[0]} &ndash; ${t.fat[1]}g</span></div>
        <div class="macro-explanation">0.35-0.45g per lb bodyweight for hormone health</div>
      </div>
      <div class="macro-target-row">
        <div class="stat-row"><span class="stat-label">Carbs</span><span class="stat-value">${t.carbs[0]} &ndash; ${t.carbs[1]}g</span></div>
        <div class="macro-explanation">Remaining calories &mdash; important for marathon training</div>
      </div>
      <div class="macro-target-row">
        <div class="stat-row"><span class="stat-label">Fiber</span><span class="stat-value">${t.fiber[0]} &ndash; ${t.fiber[1]}g</span></div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Sodium Limit <small class="genome-tag">Genome: ACE DD + ADD1</small></h3>
      <div class="setting-row">
        <span class="setting-label">Daily Max<br><small>Salt-sensitive genotype</small></span>
        <div><input type="number" class="setting-input" id="s-sodium" value="${settings.sodiumLimit}"> <span class="unit-label">mg</span></div>
      </div>
      <div class="macro-explanation" style="margin-top:.25rem">Genome: ACE DD + ADD1 &mdash; salt-sensitive genotype</div>
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

  // Dual-unit weight conversions
  const wLbs = document.getElementById('s-weight-lbs');
  const wKg = document.getElementById('s-weight-kg');
  if (wLbs && wKg) {
    wLbs.addEventListener('input', () => {
      const v = parseFloat(wLbs.value);
      if (!isNaN(v)) { wKg.value = lbsToKg(v); settings.weight = v; }
    });
    wKg.addEventListener('input', () => {
      const v = parseFloat(wKg.value);
      if (!isNaN(v)) { const lbs = kgToLbs(v); wLbs.value = lbs; settings.weight = lbs; }
    });
  }

  // Dual-unit height conversions
  const hIn = document.getElementById('s-height-in');
  const hCm = document.getElementById('s-height-cm');
  if (hIn && hCm) {
    hIn.addEventListener('input', () => {
      const v = parseFloat(hIn.value);
      if (!isNaN(v)) { hCm.value = inToCm(v); settings.height = v; }
    });
    hCm.addEventListener('input', () => {
      const v = parseFloat(hCm.value);
      if (!isNaN(v)) { const inches = cmToIn(v); hIn.value = inches; settings.height = inches; }
    });
  }

  // Dual-unit goal weight conversions
  const gLbs = document.getElementById('s-goal-lbs');
  const gKg = document.getElementById('s-goal-kg');
  if (gLbs && gKg) {
    gLbs.addEventListener('input', () => {
      const v = parseFloat(gLbs.value);
      if (!isNaN(v)) { gKg.value = lbsToKg(v); settings.goalWeight = v; localStorage.setItem('macros_goal_weight', v); }
    });
    gKg.addEventListener('input', () => {
      const v = parseFloat(gKg.value);
      if (!isNaN(v)) { const lbs = kgToLbs(v); gLbs.value = lbs; settings.goalWeight = lbs; localStorage.setItem('macros_goal_weight', lbs); }
    });
  }

  // Activity factor dropdown
  const afSelect = document.getElementById('s-activity-factor');
  if (afSelect) {
    afSelect.addEventListener('change', () => {
      settings.activityFactor = parseFloat(afSelect.value);
      localStorage.setItem('macros_activity_factor', settings.activityFactor);
      renderSettings(); // re-render to update TDEE
    });
  }

  // Setting input changes (debounced save + re-render for formula updates)
  const saveSettingDebounced = debounce(async () => {
    settings.weight = parseFloat(document.getElementById('s-weight-lbs')?.value) || settings.weight;
    settings.height = parseFloat(document.getElementById('s-height-in')?.value) || settings.height;
    settings.bodyFat = parseFloat(document.getElementById('s-bf')?.value) || settings.bodyFat;
    settings.steps = parseFloat(document.getElementById('s-steps')?.value) || settings.steps;
    settings.workouts = parseFloat(document.getElementById('s-workouts')?.value) || settings.workouts;
    settings.zone2 = parseFloat(document.getElementById('s-zone2')?.value) || settings.zone2;
    settings.sodiumLimit = parseFloat(document.getElementById('s-sodium')?.value) || settings.sodiumLimit;
    settings.goalWeight = parseFloat(document.getElementById('s-goal-lbs')?.value) || settings.goalWeight;
    localStorage.setItem('macros_goal_weight', settings.goalWeight);
    localStorage.setItem('macros_activity_factor', settings.activityFactor);
    await saveSettingsToDb();
  }, 800);

  // Re-render TDEE section when body stats change (with a longer debounce)
  const reRenderDebounced = debounce(() => renderSettings(), 1200);

  content.querySelectorAll('.setting-input').forEach(input => {
    input.addEventListener('input', saveSettingDebounced);
    // For body stat inputs that affect BMR/TDEE, also schedule a re-render
    if (['s-weight-lbs','s-weight-kg','s-bf','s-goal-lbs','s-goal-kg'].includes(input.id)) {
      input.addEventListener('input', reRenderDebounced);
    }
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
