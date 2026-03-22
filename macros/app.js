/* ===== Macros PWA — app.js ===== */
'use strict';

// ── Constants ──
const MEALS = [
  { id: 'coffee', name: 'Coffee', emoji: '☕' },
  { id: 'breakfast', name: 'Breakfast', emoji: '🍳' },
  { id: 'lunch', name: 'Lunch', emoji: '🥗' },
  { id: 'snack', name: 'Snack', emoji: '🍎' },
  { id: 'dinner', name: 'Dinner', emoji: '🍽️' },
];

const MODES = {
  recomp:   { label:'Recomp',   cal:[1800,2000], protein:[94,134], fat:[55,65], carbs:[200,250], fiber:[25,30] },
  cutting:  { label:'Cutting',  cal:[1400,1600], protein:[110,140], fat:[40,55], carbs:[130,170], fiber:[25,30] },
  maintain: { label:'Maintenance', cal:[1900,2100], protein:[80,120], fat:[55,70], carbs:[220,270], fiber:[25,30] },
  marathon: { label:'Marathon Fueling', cal:[2200,2500], protein:[90,120], fat:[55,70], carbs:[300,380], fiber:[25,30] },
};

const CATEGORIES = ['all','coffee','breakfast','lunch','dinner','snack','ingredient'];
const TAGS = ['homemade','quick','takeout','hungryroot'];

const RESTRICTED = ['pasta','kale','cumin','alcohol','wine','beer','vodka','tequila','rum','whiskey','bourbon','cocktail'];

const DEFAULT_LIBRARY = [
  {id:'lib_1',name:'Drip coffee with whole milk',cal:40,protein:2,carbs:3,fat:2,fiber:0,sodium:15,category:'coffee',tags:['quick']},
  {id:'lib_2',name:'Large egg',cal:72,protein:6.2,carbs:0.4,fat:5,fiber:0,sodium:71,category:'breakfast',tags:['quick']},
  {id:'lib_3',name:'Turkey sausage patty',cal:108,protein:11,carbs:1,fat:7,fiber:0,sodium:340,category:'breakfast',tags:['quick']},
  {id:'lib_4',name:'Sourdough toast',cal:96,protein:3.9,carbs:18,fat:1,fiber:1,sodium:170,category:'breakfast',tags:['quick']},
  {id:'lib_5',name:'Half avocado',cal:109,protein:1.4,carbs:6,fat:10,fiber:4.5,sodium:5,category:'ingredient',tags:[]},
  {id:'lib_6',name:'Shredded cheese 28g',cal:113,protein:6.4,carbs:1.5,fat:9,fiber:0,sodium:180,category:'ingredient',tags:[]},
  {id:'lib_7',name:'Flour tortilla',cal:140,protein:3.7,carbs:24,fat:3.5,fiber:1.5,sodium:330,category:'ingredient',tags:['quick']},
  {id:'lib_8',name:'Greek yogurt',cal:120,protein:15,carbs:11,fat:2,fiber:0,sodium:55,category:'snack',tags:['quick']},
  {id:'lib_9',name:'Protein shake',cal:220,protein:40,carbs:12,fat:3,fiber:1,sodium:200,category:'snack',tags:['quick']},
  {id:'lib_10',name:'Chicken breast grilled 6oz',cal:280,protein:52,carbs:0,fat:6,fiber:0,sodium:120,category:'dinner',tags:['homemade']},
  {id:'lib_11',name:'Brown rice 1 cup',cal:216,protein:5,carbs:45,fat:1.8,fiber:3.5,sodium:10,category:'ingredient',tags:['homemade']},
  {id:'lib_12',name:'Salmon fillet 6oz',cal:350,protein:38,carbs:0,fat:21,fiber:0,sodium:75,category:'dinner',tags:['homemade']},
  {id:'lib_13',name:'Sweet potato medium',cal:103,protein:2.3,carbs:24,fat:0.1,fiber:3.8,sodium:41,category:'ingredient',tags:['homemade']},
  {id:'lib_14',name:'Poke bowl',cal:550,protein:35,carbs:55,fat:18,fiber:3,sodium:900,category:'lunch',tags:['takeout']},
];

// ── State ──
let currentDate = todayStr();
let currentMeal = null; // meal id for add-food modal
let servingFood = null;
let editingFoodId = null;
let statsPeriod = 'week';

// ── Storage helpers ──
function todayStr(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dateObj(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function formatDate(s){
  const d=dateObj(s);
  const now=new Date(); const t=todayStr();
  const yd=new Date(now); yd.setDate(yd.getDate()-1);
  const ydStr=`${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
  if(s===t) return 'Today';
  if(s===ydStr) return 'Yesterday';
  return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}
function shiftDate(s,n){ const d=dateObj(s); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function getSettings(){
  const def={mode:'recomp',weight:130,height:64,bodyFat:25.9,steps:8000,workouts:4,zone2:120,sodiumLimit:2000,customTargets:null};
  try{ return {...def,...JSON.parse(localStorage.getItem('macros_settings'))}; }catch(e){ return def; }
}
function saveSettings(s){ localStorage.setItem('macros_settings',JSON.stringify(s)); }

function getTargets(){
  const s=getSettings();
  if(s.customTargets) return s.customTargets;
  return MODES[s.mode] || MODES.recomp;
}

function getDayData(date){
  try{ return JSON.parse(localStorage.getItem('macros_day_'+date)) || {meals:{},water:0}; }catch(e){ return {meals:{},water:0}; }
}
function saveDayData(date,data){ localStorage.setItem('macros_day_'+date,JSON.stringify(data)); }

function getLibrary(){
  const stored=localStorage.getItem('macros_library');
  if(!stored){
    localStorage.setItem('macros_library',JSON.stringify(DEFAULT_LIBRARY));
    return [...DEFAULT_LIBRARY];
  }
  try{ return JSON.parse(stored); }catch(e){ return [...DEFAULT_LIBRARY]; }
}
function saveLibrary(lib){ localStorage.setItem('macros_library',JSON.stringify(lib)); }

// ── Macro math ──
function sumMeals(dayData){
  const totals={cal:0,protein:0,carbs:0,fat:0,fiber:0,sodium:0};
  for(const mealId of Object.keys(dayData.meals||{})){
    for(const item of dayData.meals[mealId]||[]){
      totals.cal+=item.cal||0;
      totals.protein+=item.protein||0;
      totals.carbs+=item.carbs||0;
      totals.fat+=item.fat||0;
      totals.fiber+=item.fiber||0;
      totals.sodium+=item.sodium||0;
    }
  }
  return totals;
}
function mealSum(items){
  const t={cal:0,protein:0,carbs:0,fat:0,fiber:0,sodium:0};
  for(const i of items||[]){t.cal+=i.cal||0;t.protein+=i.protein||0;t.carbs+=i.carbs||0;t.fat+=i.fat||0;t.fiber+=i.fiber||0;t.sodium+=i.sodium||0;}
  return t;
}

// ══════════════════════════════════
// GAUGE DRAWING
// ══════════════════════════════════
function drawGauge(canvas,value,range,color,bgColor='#222',lineWidth=12){
  const ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const w=canvas.width; const h=canvas.height;
  canvas.width=w*dpr; canvas.height=h*dpr;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  ctx.scale(dpr,dpr);

  const cx=w/2; const cy=h-8;
  const r=Math.min(cx,cy)-lineWidth/2-2;
  const startAngle=Math.PI;
  const endAngle=2*Math.PI;
  const mid=(range[0]+range[1])/2;
  const pct=Math.min(value/mid,2);

  // background arc
  ctx.beginPath();
  ctx.arc(cx,cy,r,startAngle,endAngle);
  ctx.strokeStyle=bgColor;
  ctx.lineWidth=lineWidth;
  ctx.lineCap='round';
  ctx.stroke();

  // range zone
  const rStart=startAngle+(range[0]/mid/2)*Math.PI;
  const rEnd=startAngle+(Math.min(range[1]/mid,2)/2)*Math.PI;
  ctx.beginPath();
  ctx.arc(cx,cy,r,rStart,Math.min(rEnd,endAngle));
  ctx.strokeStyle='rgba(74,222,128,0.12)';
  ctx.lineWidth=lineWidth;
  ctx.lineCap='round';
  ctx.stroke();

  // value arc
  const valAngle=startAngle+Math.min(pct/2,1)*Math.PI;
  let arcColor=color;
  if(value>range[1]*1.1) arcColor='#ef4444';
  else if(value>range[1]) arcColor='#f59e0b';
  else if(value>=range[0]) arcColor='#4ade80';
  else arcColor=color;

  if(value>0){
    ctx.beginPath();
    ctx.arc(cx,cy,r,startAngle,valAngle);
    ctx.strokeStyle=arcColor;
    ctx.lineWidth=lineWidth;
    ctx.lineCap='round';
    ctx.stroke();
  }
}

let gaugeAnimFrame=null;
let gaugeAnimStart=null;
let gaugeTargetVals=null;
let gaugePrevVals={cal:0,protein:0,carbs:0,fat:0,fiber:0};

function animateGauges(targetVals,duration=600){
  if(gaugeAnimFrame) cancelAnimationFrame(gaugeAnimFrame);
  gaugeTargetVals=targetVals;
  gaugeAnimStart=performance.now();
  const startVals={...gaugePrevVals};

  function step(ts){
    const elapsed=ts-gaugeAnimStart;
    const t=Math.min(elapsed/duration,1);
    const ease=t<0.5?2*t*t:(1-Math.pow(-2*t+2,2)/2); // easeInOutQuad

    const cur={};
    for(const k of ['cal','protein','carbs','fat','fiber']){
      cur[k]=startVals[k]+(targetVals[k]-startVals[k])*ease;
    }
    renderGaugesAt(cur);
    if(t<1) gaugeAnimFrame=requestAnimationFrame(step);
    else gaugePrevVals={...targetVals};
  }
  gaugeAnimFrame=requestAnimationFrame(step);
}

function renderGaugesAt(vals){
  const targets=getTargets();
  // Calorie gauge
  const calCanvas=document.getElementById('calorie-gauge');
  drawGauge(calCanvas,vals.cal,targets.cal,'#4ade80','#1a1a1a',14);
  document.getElementById('cal-current').textContent=Math.round(vals.cal);
  document.getElementById('cal-target').textContent=`${targets.cal[0]} – ${targets.cal[1]}`;

  // Mini gauges
  const macros=['protein','carbs','fat','fiber'];
  const colors=['#4ade80','#3b82f6','#f59e0b','#a78bfa'];
  document.querySelectorAll('.mini-gauge').forEach((el,i)=>{
    const canvas=el.querySelector('canvas');
    const macro=macros[i];
    const range=targets[macro];
    drawGauge(canvas,vals[macro],range,colors[i],'#1a1a1a',8);
    el.querySelector('.mini-val').textContent=Math.round(vals[macro])+'g';
  });
}

// ══════════════════════════════════
// PAGE NAVIGATION
// ══════════════════════════════════
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const page=btn.dataset.page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+page).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(page==='stats') renderStats();
    if(page==='library') renderLibrary();
    if(page==='settings') renderSettings();
  });
});

// ══════════════════════════════════
// HOME PAGE
// ══════════════════════════════════
function renderHome(){
  // Date
  document.getElementById('date-display').textContent=formatDate(currentDate);
  document.getElementById('mode-badge').textContent=getTargets().label || MODES[getSettings().mode]?.label || 'Recomp';

  const dayData=getDayData(currentDate);
  const totals=sumMeals(dayData);
  const targets=getTargets();
  const settings=getSettings();

  // Animate gauges
  animateGauges(totals);

  // Sodium bar
  const sodiumLimit=settings.sodiumLimit||2000;
  const sodiumPct=Math.min(totals.sodium/sodiumLimit*100,100);
  const sodiumFill=document.getElementById('sodium-fill');
  sodiumFill.style.width=sodiumPct+'%';
  sodiumFill.className='sodium-fill';
  if(totals.sodium>sodiumLimit) sodiumFill.classList.add('danger');
  else if(totals.sodium>sodiumLimit*0.8) sodiumFill.classList.add('warn');
  document.getElementById('sodium-val').textContent=`${Math.round(totals.sodium)} / ${sodiumLimit}mg`;
  const warn=document.getElementById('sodium-warning');
  if(totals.sodium>sodiumLimit) warn.classList.remove('hidden');
  else warn.classList.add('hidden');

  // Water
  renderWater(dayData);

  // Meals
  renderMeals(dayData);
}

function renderWater(dayData){
  const cups=document.getElementById('water-cups');
  cups.innerHTML='';
  const count=dayData.water||0;
  for(let i=0;i<8;i++){
    const c=document.createElement('div');
    c.className='water-cup'+(i<count?' filled':'');
    c.addEventListener('click',()=>{
      const dd=getDayData(currentDate);
      dd.water=i<(dd.water||0)?i:i+1;
      saveDayData(currentDate,dd);
      renderWater(dd);
    });
    cups.appendChild(c);
  }
  document.getElementById('water-count').textContent=`${count} / 8`;
}

function renderMeals(dayData){
  const container=document.getElementById('meals-section');
  container.innerHTML='';
  for(const meal of MEALS){
    const items=dayData.meals?.[meal.id]||[];
    const ms=mealSum(items);
    const card=document.createElement('div');
    card.className='meal-card';

    const header=document.createElement('div');
    header.className='meal-header';
    header.innerHTML=`
      <div class="meal-title"><span class="meal-emoji">${meal.emoji}</span>${meal.name}</div>
      <div class="meal-cals">
        <span>${ms.cal?Math.round(ms.cal)+' cal':''}</span>
        <button class="meal-add-btn" data-meal="${meal.id}">+</button>
      </div>
    `;
    card.appendChild(header);

    const itemsDiv=document.createElement('div');
    itemsDiv.className='meal-items';
    itemsDiv.style.display=items.length?'block':'none';

    if(items.length===0){
      itemsDiv.innerHTML='<div class="meal-empty">No items yet</div>';
      itemsDiv.style.display='none';
    } else {
      items.forEach((item,idx)=>{
        const row=document.createElement('div');
        row.className='meal-item';
        const sodiumClass=(item.sodium||0)>500?'hi-sodium':'';
        row.innerHTML=`
          <div class="meal-item-info">
            <div class="meal-item-name">${item.name}</div>
            <div class="meal-item-macros">P:${r1(item.protein)}g C:${r1(item.carbs)}g F:${r1(item.fat)}g Fib:${r1(item.fiber)}g <span class="${sodiumClass}">Na:${Math.round(item.sodium||0)}mg</span></div>
          </div>
          <div class="meal-item-cal">${Math.round(item.cal)}</div>
          <button class="meal-item-remove" data-meal="${meal.id}" data-idx="${idx}">&times;</button>
        `;
        itemsDiv.appendChild(row);
      });
    }
    card.appendChild(itemsDiv);

    // Toggle expand
    header.addEventListener('click',(e)=>{
      if(e.target.closest('.meal-add-btn')) return;
      itemsDiv.style.display=itemsDiv.style.display==='none'?'block':'none';
    });

    container.appendChild(card);
  }

  // Add food buttons
  container.querySelectorAll('.meal-add-btn').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      currentMeal=btn.dataset.meal;
      openAddFoodModal();
    });
  });

  // Remove food buttons
  container.querySelectorAll('.meal-item-remove').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const dd=getDayData(currentDate);
      const mealId=btn.dataset.meal;
      const idx=parseInt(btn.dataset.idx);
      if(dd.meals[mealId]) dd.meals[mealId].splice(idx,1);
      saveDayData(currentDate,dd);
      renderHome();
    });
  });
}

function r1(v){ return Math.round((v||0)*10)/10; }

// Date navigation
document.getElementById('prev-day').addEventListener('click',()=>{ currentDate=shiftDate(currentDate,-1); gaugePrevVals={cal:0,protein:0,carbs:0,fat:0,fiber:0}; renderHome(); });
document.getElementById('next-day').addEventListener('click',()=>{ currentDate=shiftDate(currentDate,1); gaugePrevVals={cal:0,protein:0,carbs:0,fat:0,fiber:0}; renderHome(); });

// ══════════════════════════════════
// ADD FOOD MODAL
// ══════════════════════════════════
const addModal=document.getElementById('add-food-modal');
const servingModal=document.getElementById('serving-modal');

function openAddFoodModal(){
  const mealName=MEALS.find(m=>m.id===currentMeal)?.name||'Meal';
  document.getElementById('modal-meal-title').textContent='Add to '+mealName;
  addModal.classList.remove('hidden');
  renderModalLibrary();
  // Reset tabs
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.modal-tab[data-tab="library"]').classList.add('active');
  document.querySelectorAll('.modal-tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tab-library').classList.add('active');
  document.getElementById('modal-lib-search').value='';
  document.getElementById('usda-search-input').value='';
  document.getElementById('usda-results').innerHTML='';
}

document.getElementById('modal-close').addEventListener('click',()=>addModal.classList.add('hidden'));
addModal.addEventListener('click',(e)=>{ if(e.target===addModal) addModal.classList.add('hidden'); });

// Modal tabs
document.querySelectorAll('.modal-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.modal-tab-content').forEach(c=>c.classList.remove('active'));
    document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
  });
});

function renderModalLibrary(filter=''){
  const lib=getLibrary();
  const list=document.getElementById('modal-lib-list');
  const f=filter.toLowerCase();
  const filtered=lib.filter(item=>{
    if(f && !item.name.toLowerCase().includes(f)) return false;
    return true;
  });
  list.innerHTML='';
  for(const item of filtered){
    const sodiumClass=(item.sodium||0)>500?'hi-sodium':'';
    const el=document.createElement('div');
    el.className='modal-food-item';
    el.innerHTML=`
      <div class="food-info">
        <div class="food-name">${item.name}</div>
        <div class="food-macros">${Math.round(item.cal)} cal · P:${r1(item.protein)}g C:${r1(item.carbs)}g F:${r1(item.fat)}g <span class="${sodiumClass}">Na:${Math.round(item.sodium||0)}mg</span></div>
      </div>
      <div class="food-add">+</div>
    `;
    el.addEventListener('click',()=>openServingModal(item));
    list.appendChild(el);
  }
  if(filtered.length===0) list.innerHTML='<div class="usda-loading">No foods found</div>';
}

document.getElementById('modal-lib-search').addEventListener('input',(e)=>renderModalLibrary(e.target.value));

// ── Serving modal ──
function openServingModal(food){
  servingFood={...food};
  document.getElementById('serving-food-name').textContent=food.name;
  document.getElementById('serving-amount').value='1';
  updateServingPreview();
  servingModal.classList.remove('hidden');
}

function updateServingPreview(){
  const amt=parseFloat(document.getElementById('serving-amount').value)||1;
  const f=servingFood;
  document.getElementById('serving-preview').textContent=
    `${Math.round(f.cal*amt)} cal · P:${r1(f.protein*amt)}g C:${r1(f.carbs*amt)}g F:${r1(f.fat*amt)}g Na:${Math.round((f.sodium||0)*amt)}mg`;
}

document.getElementById('serving-amount').addEventListener('input',updateServingPreview);
document.getElementById('serving-minus').addEventListener('click',()=>{
  const inp=document.getElementById('serving-amount');
  inp.value=Math.max(0.25,parseFloat(inp.value)-0.25);
  updateServingPreview();
});
document.getElementById('serving-plus').addEventListener('click',()=>{
  const inp=document.getElementById('serving-amount');
  inp.value=parseFloat(inp.value)+0.25;
  updateServingPreview();
});
document.getElementById('serving-modal-close').addEventListener('click',()=>servingModal.classList.add('hidden'));
servingModal.addEventListener('click',(e)=>{ if(e.target===servingModal) servingModal.classList.add('hidden'); });

document.getElementById('serving-confirm').addEventListener('click',()=>{
  const amt=parseFloat(document.getElementById('serving-amount').value)||1;
  const f=servingFood;
  addFoodToMeal({
    name:f.name+(amt!==1?` (×${amt})`:''),
    cal:r1(f.cal*amt),protein:r1(f.protein*amt),carbs:r1(f.carbs*amt),
    fat:r1(f.fat*amt),fiber:r1(f.fiber*amt),sodium:Math.round((f.sodium||0)*amt)
  });
  servingModal.classList.add('hidden');
  addModal.classList.add('hidden');
});

function addFoodToMeal(food){
  const dd=getDayData(currentDate);
  if(!dd.meals) dd.meals={};
  if(!dd.meals[currentMeal]) dd.meals[currentMeal]=[];
  dd.meals[currentMeal].push(food);
  saveDayData(currentDate,dd);
  renderHome();
}

// ── Quick Add ──
document.getElementById('qa-add').addEventListener('click',()=>{
  const name=document.getElementById('qa-name').value.trim();
  if(!name) return;
  addFoodToMeal({
    name,
    cal:parseFloat(document.getElementById('qa-cal').value)||0,
    protein:parseFloat(document.getElementById('qa-protein').value)||0,
    carbs:parseFloat(document.getElementById('qa-carbs').value)||0,
    fat:parseFloat(document.getElementById('qa-fat').value)||0,
    fiber:parseFloat(document.getElementById('qa-fiber').value)||0,
    sodium:parseFloat(document.getElementById('qa-sodium').value)||0,
  });
  addModal.classList.add('hidden');
  // Clear fields
  ['qa-name','qa-cal','qa-protein','qa-carbs','qa-fat','qa-fiber','qa-sodium'].forEach(id=>document.getElementById(id).value='');
});

// ── USDA Search ──
document.getElementById('usda-search-btn').addEventListener('click',searchUSDA);
document.getElementById('usda-search-input').addEventListener('keydown',(e)=>{ if(e.key==='Enter') searchUSDA(); });

async function searchUSDA(){
  const query=document.getElementById('usda-search-input').value.trim();
  if(!query) return;
  const results=document.getElementById('usda-results');
  results.innerHTML='<div class="usda-loading">Searching...</div>';

  try{
    const resp=await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(query)}&pageSize=15&dataType=Foundation,SR%20Legacy`);
    const data=await resp.json();

    if(!data.foods||data.foods.length===0){
      results.innerHTML='<div class="usda-loading">No results found</div>';
      return;
    }

    // Filter restricted foods
    const filtered=data.foods.filter(f=>{
      const desc=f.description.toLowerCase();
      return !RESTRICTED.some(r=>desc.includes(r));
    });

    results.innerHTML='';
    for(const food of filtered.slice(0,12)){
      const nutrients=food.foodNutrients||[];
      const get=(id)=>nutrients.find(n=>n.nutrientId===id)?.value||0;
      const cal=get(1008);
      const protein=get(1003);
      const fat=get(1004);
      const carbs=get(1005);
      const fiber=get(1079);
      const sodium=get(1093);

      const sodiumClass=sodium>500?'hi-sodium':'';
      const el=document.createElement('div');
      el.className='modal-food-item';
      el.innerHTML=`
        <div class="food-info">
          <div class="food-name">${titleCase(food.description)}</div>
          <div class="food-macros">${Math.round(cal)} cal/100g · P:${r1(protein)}g C:${r1(carbs)}g F:${r1(fat)}g <span class="${sodiumClass}">Na:${Math.round(sodium)}mg</span></div>
        </div>
        <div class="food-add">+</div>
      `;
      el.addEventListener('click',()=>{
        openServingModal({
          name:titleCase(food.description),
          cal:Math.round(cal),protein:r1(protein),carbs:r1(carbs),
          fat:r1(fat),fiber:r1(fiber),sodium:Math.round(sodium)
        });
      });
      results.appendChild(el);
    }
    if(filtered.length===0) results.innerHTML='<div class="usda-loading">No matching results (some filtered)</div>';
  }catch(e){
    results.innerHTML='<div class="usda-loading">Search failed. Try again.</div>';
  }
}

function titleCase(s){
  return s.toLowerCase().split(/[\s,]+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ').replace(/\s+/g,' ').trim();
}

// ══════════════════════════════════
// STATS PAGE
// ══════════════════════════════════
document.querySelectorAll('.stats-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.stats-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    statsPeriod=btn.dataset.period;
    renderStats();
  });
});

function renderStats(){
  const container=document.getElementById('stats-content');
  const days=statsPeriod==='week'?7:30;
  const today=todayStr();
  const targets=getTargets();
  const settings=getSettings();

  let totalDays=0;
  const sums={cal:0,protein:0,carbs:0,fat:0,fiber:0,sodium:0};
  let proteinHits=0;
  let sodiumCompliant=0;
  const foodCounts={};

  for(let i=0;i<days;i++){
    const d=shiftDate(today,-i);
    const dd=getDayData(d);
    const t=sumMeals(dd);
    if(t.cal===0&&i>0) continue; // skip empty non-today
    totalDays++;
    for(const k of Object.keys(sums)) sums[k]+=t[k];
    if(t.protein>=targets.protein[0]&&t.protein<=targets.protein[1]) proteinHits++;
    if(t.sodium<=(settings.sodiumLimit||2000)) sodiumCompliant++;

    // Count foods
    for(const mealItems of Object.values(dd.meals||{})){
      for(const item of mealItems||[]){
        const key=item.name.replace(/\s*\(×[\d.]+\)/,'');
        foodCounts[key]=(foodCounts[key]||0)+1;
      }
    }
  }

  if(totalDays===0){
    container.innerHTML='<div class="stat-empty">No data yet. Start logging meals!</div>';
    return;
  }

  const avg={};
  for(const k of Object.keys(sums)) avg[k]=sums[k]/totalDays;

  const topFoods=Object.entries(foodCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const proteinPct=Math.round(proteinHits/totalDays*100);
  const sodiumPct=Math.round(sodiumCompliant/totalDays*100);

  container.innerHTML=`
    <div class="stat-card">
      <h3>Average Daily Macros (${totalDays} day${totalDays>1?'s':''})</h3>
      ${statBarHTML('Calories',avg.cal,targets.cal,'#4ade80')}
      ${statBarHTML('Protein',avg.protein,targets.protein,'#4ade80')}
      ${statBarHTML('Carbs',avg.carbs,targets.carbs,'#3b82f6')}
      ${statBarHTML('Fat',avg.fat,targets.fat,'#f59e0b')}
      ${statBarHTML('Fiber',avg.fiber,targets.fiber,'#a78bfa')}
    </div>
    <div class="stat-card">
      <h3>Compliance</h3>
      <div class="stat-row">
        <span class="stat-label">Protein target hit rate</span>
        <span class="stat-value ${proteinPct>=70?'good':proteinPct>=40?'warn':'bad'}">${proteinPct}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Sodium under limit</span>
        <span class="stat-value ${sodiumPct>=80?'good':sodiumPct>=50?'warn':'bad'}">${sodiumPct}%</span>
      </div>
    </div>
    ${topFoods.length?`
    <div class="stat-card">
      <h3>Top Foods</h3>
      ${topFoods.map(([name,count])=>`
        <div class="stat-row">
          <span class="stat-label">${name}</span>
          <span class="stat-value">${count}×</span>
        </div>
      `).join('')}
    </div>`:''}
  `;
}

function statBarHTML(label,value,range,color){
  const mid=(range[0]+range[1])/2;
  const pct=Math.min(value/mid*50,100);
  const unit=label==='Calories'?'':'g';
  return `
    <div class="stat-bar-row">
      <div class="stat-bar-label">
        <span>${label}</span>
        <span>${Math.round(value)}${unit} / ${range[0]}–${range[1]}${unit}</span>
      </div>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>
  `;
}

// ══════════════════════════════════
// LIBRARY PAGE
// ══════════════════════════════════
let libCatFilter='all';
let libTagFilter=null;

function renderLibrary(){
  // Category filters
  const catDiv=document.getElementById('library-cat-filters');
  catDiv.innerHTML=CATEGORIES.map(c=>
    `<button class="filter-btn${c===libCatFilter?' active':''}" data-cat="${c}">${c==='all'?'All':capitalize(c)}</button>`
  ).join('');
  catDiv.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      libCatFilter=btn.dataset.cat;
      renderLibrary();
    });
  });

  // Tag filters
  const tagDiv=document.getElementById('library-tag-filters');
  tagDiv.innerHTML=TAGS.map(t=>
    `<button class="filter-btn${t===libTagFilter?' active':''}" data-tag="${t}">${capitalize(t)}</button>`
  ).join('');
  tagDiv.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      libTagFilter=libTagFilter===btn.dataset.tag?null:btn.dataset.tag;
      renderLibrary();
    });
  });

  const search=(document.getElementById('library-search').value||'').toLowerCase();
  const lib=getLibrary();
  const filtered=lib.filter(item=>{
    if(search && !item.name.toLowerCase().includes(search)) return false;
    if(libCatFilter!=='all' && item.category!==libCatFilter) return false;
    if(libTagFilter && !(item.tags||[]).includes(libTagFilter)) return false;
    return true;
  });

  const list=document.getElementById('library-list');
  list.innerHTML='';
  for(const item of filtered){
    const sodiumClass=(item.sodium||0)>500?'hi-sodium':'';
    const el=document.createElement('div');
    el.className='library-item';
    el.innerHTML=`
      <div class="lib-info">
        <div class="lib-name">${item.name}</div>
        <div class="lib-macros">P:${r1(item.protein)}g C:${r1(item.carbs)}g F:${r1(item.fat)}g Fib:${r1(item.fiber)}g <span class="${sodiumClass}">Na:${Math.round(item.sodium||0)}mg</span></div>
        ${(item.tags||[]).length?`<div class="lib-tags">${item.tags.map(t=>`<span class="lib-tag">${t}</span>`).join('')}</div>`:''}
      </div>
      <span class="lib-cal">${Math.round(item.cal)}</span>
    `;
    el.addEventListener('click',()=>openEditFoodModal(item));
    list.appendChild(el);
  }
  if(filtered.length===0) list.innerHTML='<div class="stat-empty">No foods match filters</div>';
}

document.getElementById('library-search').addEventListener('input',()=>renderLibrary());

// ── Add custom food ──
document.getElementById('add-custom-btn').addEventListener('click',()=>{
  editingFoodId=null;
  document.getElementById('ef-name').value='';
  ['ef-cal','ef-protein','ef-carbs','ef-fat','ef-fiber','ef-sodium'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ef-category').value='breakfast';
  renderEditTags([]);
  document.getElementById('ef-delete').style.display='none';
  document.querySelector('#edit-food-modal .modal-header h2').textContent='Add Custom Food';
  document.getElementById('edit-food-modal').classList.remove('hidden');
});

function openEditFoodModal(item){
  editingFoodId=item.id;
  document.getElementById('ef-name').value=item.name;
  document.getElementById('ef-cal').value=item.cal;
  document.getElementById('ef-protein').value=item.protein;
  document.getElementById('ef-carbs').value=item.carbs;
  document.getElementById('ef-fat').value=item.fat;
  document.getElementById('ef-fiber').value=item.fiber||0;
  document.getElementById('ef-sodium').value=item.sodium||0;
  document.getElementById('ef-category').value=item.category||'breakfast';
  renderEditTags(item.tags||[]);
  document.getElementById('ef-delete').style.display='';
  document.querySelector('#edit-food-modal .modal-header h2').textContent='Edit Food';
  document.getElementById('edit-food-modal').classList.remove('hidden');
}

function renderEditTags(selected){
  const div=document.getElementById('ef-tags');
  div.innerHTML=TAGS.map(t=>{
    const checked=selected.includes(t);
    return `<label class="${checked?'checked':''}"><input type="checkbox" value="${t}" ${checked?'checked':''}>${capitalize(t)}</label>`;
  }).join('');
  div.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('change',()=>{
      inp.parentElement.classList.toggle('checked',inp.checked);
    });
  });
}

document.getElementById('edit-modal-close').addEventListener('click',()=>document.getElementById('edit-food-modal').classList.add('hidden'));
document.getElementById('edit-food-modal').addEventListener('click',(e)=>{ if(e.target.id==='edit-food-modal') e.target.classList.add('hidden'); });

document.getElementById('ef-save').addEventListener('click',()=>{
  const lib=getLibrary();
  const tags=[...document.getElementById('ef-tags').querySelectorAll('input:checked')].map(i=>i.value);
  const food={
    id:editingFoodId||'lib_'+Date.now(),
    name:document.getElementById('ef-name').value.trim(),
    cal:parseFloat(document.getElementById('ef-cal').value)||0,
    protein:parseFloat(document.getElementById('ef-protein').value)||0,
    carbs:parseFloat(document.getElementById('ef-carbs').value)||0,
    fat:parseFloat(document.getElementById('ef-fat').value)||0,
    fiber:parseFloat(document.getElementById('ef-fiber').value)||0,
    sodium:parseFloat(document.getElementById('ef-sodium').value)||0,
    category:document.getElementById('ef-category').value,
    tags,
  };
  if(!food.name) return;
  if(editingFoodId){
    const idx=lib.findIndex(i=>i.id===editingFoodId);
    if(idx>=0) lib[idx]=food;
  } else {
    lib.push(food);
  }
  saveLibrary(lib);
  document.getElementById('edit-food-modal').classList.add('hidden');
  renderLibrary();
});

document.getElementById('ef-delete').addEventListener('click',()=>{
  if(!editingFoodId) return;
  if(!confirm('Delete this food?')) return;
  const lib=getLibrary().filter(i=>i.id!==editingFoodId);
  saveLibrary(lib);
  document.getElementById('edit-food-modal').classList.add('hidden');
  renderLibrary();
});

// ══════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════
function renderSettings(){
  const s=getSettings();
  const targets=getTargets();
  const container=document.getElementById('settings-content');

  container.innerHTML=`
    <div class="setting-group">
      <h3>Body Stats</h3>
      <div class="setting-row"><label>Weight (lbs)</label><input type="number" id="set-weight" value="${s.weight}" min="50" max="500"></div>
      <div class="setting-row"><label>Height (inches)</label><input type="number" id="set-height" value="${s.height}" min="48" max="84"></div>
      <div class="setting-row"><label>Body Fat %</label><input type="number" id="set-bf" value="${s.bodyFat}" min="5" max="50" step="0.1"></div>
    </div>
    <div class="setting-group">
      <h3>Activity</h3>
      <div class="setting-row"><label>Avg daily steps</label><input type="number" id="set-steps" value="${s.steps}" min="0" max="50000" step="500"></div>
      <div class="setting-row"><label>Workouts / week</label><input type="number" id="set-workouts" value="${s.workouts}" min="0" max="14"></div>
      <div class="setting-row"><label>Zone 2 min / week</label><input type="number" id="set-zone2" value="${s.zone2}" min="0" max="600"></div>
    </div>
    <div class="setting-group">
      <h3>Mode</h3>
      <div class="mode-selector">
        ${Object.entries(MODES).map(([k,v])=>
          `<button class="mode-opt${k===s.mode?' active':''}" data-mode="${k}">${v.label}</button>`
        ).join('')}
      </div>
    </div>
    <div class="setting-group">
      <h3>Macro Targets</h3>
      <div class="setting-row"><label>Calories</label><span style="color:var(--text2)">${targets.cal[0]} – ${targets.cal[1]}</span></div>
      <div class="setting-row"><label>Protein (g)</label><span style="color:var(--text2)">${targets.protein[0]} – ${targets.protein[1]}</span></div>
      <div class="setting-row"><label>Carbs (g)</label><span style="color:var(--text2)">${targets.carbs[0]} – ${targets.carbs[1]}</span></div>
      <div class="setting-row"><label>Fat (g)</label><span style="color:var(--text2)">${targets.fat[0]} – ${targets.fat[1]}</span></div>
      <div class="setting-row"><label>Fiber (g)</label><span style="color:var(--text2)">${targets.fiber[0]} – ${targets.fiber[1]}</span></div>
    </div>
    <div class="setting-group">
      <h3>Sodium</h3>
      <div class="setting-row"><label>Daily limit (mg)</label><input type="number" id="set-sodium" value="${s.sodiumLimit||2000}" min="500" max="5000" step="100"></div>
      <p style="font-size:12px;color:var(--text3);margin-top:8px">Salt-sensitive genotype (ACE DD + ADD1). Default limit: 2000mg.</p>
    </div>
    <div class="setting-group">
      <h3>Data</h3>
      <div class="export-btns">
        <button class="btn-outline" id="set-export">Export JSON</button>
        <button class="btn-outline" id="set-import">Import JSON</button>
      </div>
      <input type="file" id="import-file" accept=".json" style="display:none">
    </div>
  `;

  // Bind settings
  const bindNum=(id,key)=>{
    document.getElementById(id).addEventListener('change',(e)=>{
      const ss=getSettings();
      ss[key]=parseFloat(e.target.value)||0;
      saveSettings(ss);
    });
  };
  bindNum('set-weight','weight');
  bindNum('set-height','height');
  bindNum('set-bf','bodyFat');
  bindNum('set-steps','steps');
  bindNum('set-workouts','workouts');
  bindNum('set-zone2','zone2');
  bindNum('set-sodium','sodiumLimit');

  // Mode selector
  container.querySelectorAll('.mode-opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const ss=getSettings();
      ss.mode=btn.dataset.mode;
      ss.customTargets=null;
      saveSettings(ss);
      renderSettings();
      renderHome();
    });
  });

  // Export
  document.getElementById('set-export').addEventListener('click',()=>{
    const allData={settings:getSettings(),library:getLibrary(),days:{}};
    for(let i=0;i<365;i++){
      const d=shiftDate(todayStr(),-i);
      const dd=getDayData(d);
      if(dd.meals&&Object.keys(dd.meals).length>0) allData.days[d]=dd;
    }
    const blob=new Blob([JSON.stringify(allData,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='macros-backup-'+todayStr()+'.json';
    a.click();
  });

  // Import
  document.getElementById('set-import').addEventListener('click',()=>document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change',(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.settings) saveSettings(data.settings);
        if(data.library) saveLibrary(data.library);
        if(data.days){
          for(const [date,dd] of Object.entries(data.days)) saveDayData(date,dd);
        }
        alert('Data imported successfully!');
        renderHome();
        renderSettings();
      }catch(err){
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  });
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

// ══════════════════════════════════
// SERVICE WORKER REGISTRATION
// ══════════════════════════════════
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
renderHome();
