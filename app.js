/* =========================================================
   SmartHealth AI — Main Application Logic
   Dhaka International University | Group B SDM Project
   ========================================================= */

'use strict';

// ── DOM HELPERS ──────────────────────────────────────────
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── CHART INSTANCES ──────────────────────────────────────
let hrChart, spo2Chart, tempChart, bpChart;
let ecgAnimId = null;
let heroEcgAnimId = null;

// ── PATIENT RECORDS ──────────────────────────────────────
let patients = JSON.parse(localStorage.getItem('shai_patients') || '[]');

// ── INITIAL DEMO PATIENTS ─────────────────────────────────
const DEMO_PATIENTS = [
  { name: 'MST Laboni Khatun', age: 22, hr: 76, spo2: 98, temp: 36.7, bp: 115, time: '08:30 AM' },
  { name: 'Sharmin Akter',      age: 24, hr: 88, spo2: 96, temp: 37.1, bp: 122, time: '09:05 AM' },
  { name: 'Monira Jahan Dipti', age: 25, hr: 102,spo2: 94, temp: 38.2, bp: 135, time: '09:45 AM' },
  { name: 'Rafiqul Islam',      age: 45, hr: 115,spo2: 91, temp: 39.5, bp: 158, time: '10:20 AM' },
  { name: 'Fatema Begum',       age: 60, hr: 65, spo2: 99, temp: 36.4, bp: 108, time: '11:00 AM' },
];

// ── VITAL RANGES ──────────────────────────────────────────
const RANGES = {
  hr:   { low: 60, high: 100, vLow: 40,  vHigh: 130 },
  spo2: { low: 95, high: 100, vLow: 88,  vHigh: 100 },
  temp: { low: 36.1, high: 37.2, vLow: 35.0, vHigh: 40.0 },
  bp:   { low: 90, high: 120, vLow: 70,  vHigh: 160 },
};

function getStatus(type, val) {
  const r = RANGES[type];
  if (val < r.vLow || val > r.vHigh) return { label: 'Critical',  cls: 'danger' };
  if (val < r.low  || val > r.high)  return { label: 'Warning',   cls: 'warn' };
  return { label: 'Normal', cls: 'ok' };
}

// ── NAVBAR SCROLL ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  nb.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNavLink();
});

function updateActiveNavLink() {
  const sections = ['home','features','dashboard','ai-analysis','patients','about'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 160) current = id;
  });
  $$('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// ── HAMBURGER MENU ────────────────────────────────────────
$('hamburger').addEventListener('click', () => {
  $('navLinks').classList.toggle('open');
});
$$('.nav-link').forEach(a => {
  a.addEventListener('click', () => $('navLinks').classList.remove('open'));
});

// ── HERO CTA BUTTON ───────────────────────────────────────
['heroCta', 'openMonitorBtn'].forEach(id => {
  $(id) && $(id).addEventListener('click', () => {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── SLIDER SYNC ───────────────────────────────────────────
function syncSliders() {
  const pairs = [
    ['heartRateSlider', 'heartRate'],
    ['spo2Slider',      'spo2'],
    ['temperatureSlider','temperature'],
    ['bpSlider',        'bloodPressure'],
  ];
  pairs.forEach(([sliderId, inputId]) => {
    const slider = $(sliderId), input = $(inputId);
    slider.addEventListener('input', () => { input.value = slider.value; });
    input.addEventListener('input', () => { slider.value = input.value; });
  });
}
syncSliders();

// ── AUTO-FILL SIMULATE ────────────────────────────────────
$('autoFillBtn').addEventListener('click', () => {
  const names = ['Ahmed Hossain', 'Rima Sultana', 'Kabir Islam', 'Nusrat Jahan', 'Tariq Rahman'];
  $('patientName').value = names[Math.floor(Math.random() * names.length)];
  $('patientAge').value  = Math.floor(Math.random() * 55) + 18;

  const scenarios = [
    { hr: 75,  spo2: 98, temp: 36.6, bp: 115 },  // healthy
    { hr: 105, spo2: 95, temp: 37.8, bp: 130 },  // mild warning
    { hr: 125, spo2: 91, temp: 39.2, bp: 155 },  // warning
    { hr: 140, spo2: 87, temp: 40.1, bp: 170 },  // critical
  ];
  const s = scenarios[Math.floor(Math.random() * scenarios.length)];
  $('heartRate').value = s.hr;        $('heartRateSlider').value = s.hr;
  $('spo2').value      = s.spo2;      $('spo2Slider').value      = s.spo2;
  $('temperature').value = s.temp;   $('temperatureSlider').value = s.temp;
  $('bloodPressure').value = s.bp;   $('bpSlider').value          = s.bp;
});

// ── RESET FORM ────────────────────────────────────────────
$('resetBtn').addEventListener('click', () => {
  ['patientName','patientAge'].forEach(id => { $(id).value = ''; });
  $('heartRate').value = 75;      $('heartRateSlider').value = 75;
  $('spo2').value      = 98;      $('spo2Slider').value      = 98;
  $('temperature').value = 36.6; $('temperatureSlider').value = 36.6;
  $('bloodPressure').value = 120; $('bpSlider').value         = 120;
  $('vitalsMonitor').style.display = 'none';
  $('aiWaiting').style.display = 'block';
  $('aiResult').style.display  = 'none';
  stopEcg();
});

// ── ADD PATIENT (scroll to form) ──────────────────────────
$('addPatientBtn').addEventListener('click', () => {
  document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
});

// ── ANALYZE BUTTON ────────────────────────────────────────
$('analyzeBtn').addEventListener('click', () => {
  const hr   = parseFloat($('heartRate').value);
  const spo2 = parseFloat($('spo2').value);
  const temp = parseFloat($('temperature').value);
  const bp   = parseFloat($('bloodPressure').value);
  const name = $('patientName').value.trim() || 'Anonymous Patient';
  const age  = $('patientAge').value || '--';

  if (!hr || !spo2 || !temp || !bp) {
    showModal('⚠️', 'Missing Data', 'Please fill in all vital signs before analyzing.');
    return;
  }

  // Show monitor
  $('vitalsMonitor').style.display = 'block';
  $('vitalsMonitor').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Slight delay for scroll then animate
  setTimeout(() => {
    updateMonitorCards(hr, spo2, temp, bp);
    runAiAnalysis({ name, age, hr, spo2, temp, bp });
    startEcg(hr);
    savePatient({ name, age, hr, spo2, temp, bp });
    renderPatientsTable();
  }, 400);
});

// ── MONITOR CARDS ─────────────────────────────────────────
function updateMonitorCards(hr, spo2, temp, bp) {
  const hrSt   = getStatus('hr',   hr);
  const spo2St = getStatus('spo2', spo2);
  const tempSt = getStatus('temp', temp);
  const bpSt   = getStatus('bp',   bp);

  $('mc-hr').textContent   = hr;
  $('mc-spo2').textContent = spo2;
  $('mc-temp').textContent = temp;
  $('mc-bp').textContent   = bp;

  function setStatus(elId, st) {
    const el = $(elId);
    el.textContent = st.label;
    el.className = `mc-status status-${st.cls}`;
  }
  setStatus('mc-hr-status',   hrSt);
  setStatus('mc-spo2-status', spo2St);
  setStatus('mc-temp-status', tempSt);
  setStatus('mc-bp-status',   bpSt);

  buildMiniChart('hrChart',   generateSparkData(hr, 10, 5), '#ef4444', 30, 200);
  buildMiniChart('spo2Chart', generateSparkData(spo2, 3, 1), '#3b82f6', 70, 100);
  buildMiniChart('tempChart', generateSparkData(temp, 0.4, 0.1), '#f97316', 34, 42);
  buildMiniChart('bpChart',   generateSparkData(bp, 10, 4), '#a855f7', 60, 200);
}

function generateSparkData(base, spread, noise, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const t  = i / (count - 1);
    const wv = Math.sin(t * Math.PI * 2.5) * spread * .6;
    const nr = (Math.random() - .5) * noise;
    return base + wv + nr;
  });
}

function buildMiniChart(canvasId, data, color, yMin, yMax) {
  const ctx = $(canvasId).getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 60);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '00');

  const existing = Chart.getChart(canvasId);
  if (existing) existing.destroy();

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 2,
        fill: true,
        backgroundColor: grad,
        tension: 0.4,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      scales: {
        x: { display: false },
        y: { display: false, min: yMin, max: yMax },
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    }
  });
}

// ── ECG ANIMATION ─────────────────────────────────────────
function startEcg(heartRate) {
  const canvas = $('ecgCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth || 900;
  canvas.height = 110;

  const bpm     = heartRate || 72;
  const period  = (60 / bpm) * 1000; // ms
  const speed   = 2.5;
  let   offset  = 0;
  let   lastTs  = null;

  function ecgPoint(x) {
    const t = ((x % (canvas.width)) / canvas.width) * period;
    const tMod = t % period;
    const norm  = tMod / period;
    // PQRST wave simulation
    if (norm < 0.12)  return Math.sin(norm * Math.PI / 0.12) * 6;   // P wave
    if (norm < 0.22)  return 0;                                       // PR segment
    if (norm < 0.24)  return -10;                                      // Q
    if (norm < 0.26)  return 38;                                       // R (spike)
    if (norm < 0.28)  return -8;                                       // S
    if (norm < 0.42)  return Math.sin((norm - 0.28) * Math.PI / 0.14) * 9; // T wave
    return 0;                                                          // TP segment
  }

  function draw(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    offset += speed * (dt / 16.67);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
    ctx.strokeStyle = 'rgba(59,130,246,.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 22) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // ECG line
    const midY = canvas.height / 2;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0,   'rgba(16,185,129,0)');
    grad.addColorStop(0.5, 'rgba(16,185,129,1)');
    grad.addColorStop(1,   'rgba(16,185,129,0)');

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur  = 8;

    for (let x = 0; x <= canvas.width; x++) {
      const px = (x - offset % canvas.width + canvas.width) % canvas.width;
      const y  = midY - ecgPoint(px) * ((canvas.height * 0.38) / 38);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ecgAnimId = requestAnimationFrame(draw);
  }

  stopEcg();
  ecgAnimId = requestAnimationFrame(draw);
}

function stopEcg() {
  if (ecgAnimId) { cancelAnimationFrame(ecgAnimId); ecgAnimId = null; }
}

// ── HERO MINI ECG ─────────────────────────────────────────
function startHeroEcg() {
  const canvas = $('heroEcgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.parentElement.offsetWidth || 300;
  canvas.height = 50;

  let offset = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const midY = canvas.height / 2;
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur  = 5;

    for (let x = 0; x < canvas.width; x++) {
      const px   = (x - offset % canvas.width + canvas.width) % canvas.width;
      const norm = (px / canvas.width) % 1;
      let y = midY;
      if (norm < 0.1)  y = midY - Math.sin(norm * Math.PI / .1) * 5;
      if (norm > .22 && norm < .24) y = midY + 8;
      if (norm > .24 && norm < .26) y = midY - 28;
      if (norm > .26 && norm < .28) y = midY + 6;
      if (norm > .30 && norm < .40) y = midY - Math.sin((norm - .30) * Math.PI / .10) * 7;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    offset += 2;
    heroEcgAnimId = requestAnimationFrame(draw);
  }
  if (heroEcgAnimId) cancelAnimationFrame(heroEcgAnimId);
  heroEcgAnimId = requestAnimationFrame(draw);
}

// ── HERO VITALS ANIMATION ─────────────────────────────────
function animateHeroVitals() {
  function wiggle(base, range) {
    return (base + (Math.random() - .5) * range).toFixed(1);
  }
  setInterval(() => {
    $('heroHR').textContent   = Math.round(parseFloat(wiggle(72, 6)));
    $('heroSpO2').textContent = Math.max(96, Math.round(parseFloat(wiggle(98, 2))));
    $('heroTemp').textContent = parseFloat(wiggle(36.6, 0.3)).toFixed(1);
  }, 2000);
}

// ── AI ANALYSIS ENGINE ────────────────────────────────────
function runAiAnalysis({ name, age, hr, spo2, temp, bp }) {
  const hrSt   = getStatus('hr',   hr);
  const spo2St = getStatus('spo2', spo2);
  const tempSt = getStatus('temp', temp);
  const bpSt   = getStatus('bp',   bp);

  // Risk score 0–100
  let risk = 0;
  if (hrSt.cls   === 'warn')   risk += 15;
  if (hrSt.cls   === 'danger') risk += 35;
  if (spo2St.cls === 'warn')   risk += 20;
  if (spo2St.cls === 'danger') risk += 40;
  if (tempSt.cls === 'warn')   risk += 15;
  if (tempSt.cls === 'danger') risk += 30;
  if (bpSt.cls   === 'warn')   risk += 10;
  if (bpSt.cls   === 'danger') risk += 25;
  risk = Math.min(risk, 100);

  let overallLabel, overallCls;
  if (risk === 0)       { overallLabel = '✅ Healthy';  overallCls = 'badge-healthy'; }
  else if (risk <= 35)  { overallLabel = '⚠️ Warning';  overallCls = 'badge-warning'; }
  else                  { overallLabel = '🚨 Critical'; overallCls = 'badge-critical'; }

  const riskColor = risk === 0 ? '#10b981' : risk <= 35 ? '#f97316' : '#ef4444';

  // Build diagnosis items
  const diagItems = [
    { icon: '♥',  name: 'Heart Rate',   val: `${hr} bpm`,  st: hrSt   },
    { icon: '◎',  name: 'SpO₂',         val: `${spo2}%`,   st: spo2St },
    { icon: '🌡', name: 'Temperature',  val: `${temp}°C`,  st: tempSt },
    { icon: '🩺', name: 'Blood Pressure',val: `${bp} mmHg`, st: bpSt   },
  ];

  const stColor = { ok: '#10b981', warn: '#f97316', danger: '#ef4444' };
  const stBg    = { ok: 'rgba(16,185,129,.15)', warn: 'rgba(249,115,22,.15)', danger: 'rgba(239,68,68,.15)' };

  $('aiDiagnosisGrid').innerHTML = diagItems.map(d => `
    <div class="ai-diag-item">
      <div class="ai-diag-icon">${d.icon}</div>
      <div class="ai-diag-name">${d.name}</div>
      <div class="ai-diag-val" style="color:${stColor[d.st.cls]}">${d.val}</div>
      <div class="ai-diag-status" style="background:${stBg[d.st.cls]};color:${stColor[d.st.cls]}">${d.st.label}</div>
    </div>
  `).join('');

  // Recommendations
  const recs = buildRecommendations({ hr, spo2, temp, bp, hrSt, spo2St, tempSt, bpSt });
  $('aiRecommendation').innerHTML = `
    <h4>💡 AI Recommendations</h4>
    <ul>${recs.map(r => `<li>${r}</li>`).join('')}</ul>
  `;

  // Show result
  $('aiPatientName').textContent = `Patient: ${name} (Age: ${age})`;
  $('aiTimestamp').textContent   = `Analysis Time: ${new Date().toLocaleString()}`;
  const badge = $('aiOverallBadge');
  badge.textContent  = overallLabel;
  badge.className    = `ai-overall-badge ${overallCls}`;

  $('aiWaiting').style.display = 'none';
  $('aiResult').style.display  = 'block';

  // Animate risk bar
  const fill = $('aiRiskFill');
  fill.style.background = `linear-gradient(90deg, ${riskColor}, ${riskColor}aa)`;
  setTimeout(() => { fill.style.width = risk + '%'; }, 100);
  $('aiRiskLabel').textContent = `Risk Score: ${risk}/100`;

  // Scroll to analysis
  setTimeout(() => {
    document.getElementById('ai-analysis').scrollIntoView({ behavior: 'smooth' });
  }, 500);

  // Critical alert
  if (risk > 50) {
    setTimeout(() => {
      showModal('🚨', 'Critical Alert!', `Patient ${name} has critical vital signs. Immediate medical attention is recommended!`);
    }, 1200);
  }
}

function buildRecommendations({ hr, spo2, temp, bp, hrSt, spo2St, tempSt, bpSt }) {
  const recs = [];
  if (hrSt.cls === 'ok' && spo2St.cls === 'ok' && tempSt.cls === 'ok' && bpSt.cls === 'ok') {
    recs.push('All vitals are within normal range. Continue maintaining a healthy lifestyle.');
    recs.push('Stay hydrated and exercise regularly to keep your vitals optimal.');
    recs.push('Schedule regular check-ups every 6 months as preventive care.');
    return recs;
  }
  if (hrSt.cls !== 'ok') {
    if (hr < 60) recs.push('Low heart rate (Bradycardia) detected. Consult a cardiologist.');
    else         recs.push(`Elevated heart rate (${hr} bpm) detected. Rest and avoid strenuous activity. If persistent, seek medical attention.`);
  }
  if (spo2St.cls !== 'ok') {
    if (spo2 < 95) recs.push(`Low oxygen saturation (${spo2}%). Immediate deep breathing exercises. Seek emergency care if below 90%.`);
  }
  if (tempSt.cls !== 'ok') {
    if (temp > 37.5)  recs.push(`Elevated temperature (${temp}°C). Take antipyretics, rest, and consult a doctor if fever persists over 24 hours.`);
    else if (temp < 36.1) recs.push(`Low body temperature (${temp}°C). Keep warm and hydrated. Seek medical help if persisting.`);
  }
  if (bpSt.cls !== 'ok') {
    if (bp > 120) recs.push(`High blood pressure (${bp} mmHg). Reduce sodium intake, avoid stress, and consult a physician.`);
    else          recs.push(`Low blood pressure (${bp} mmHg). Increase fluid intake and move slowly. Consult a doctor.`);
  }
  recs.push('Schedule an in-person medical consultation for a comprehensive evaluation.');
  return recs;
}

// ── PRINT REPORT ──────────────────────────────────────────
$('printReportBtn').addEventListener('click', () => { window.print(); });

// ── PATIENTS TABLE ────────────────────────────────────────
function savePatient(p) {
  p.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  patients.unshift(p);
  if (patients.length > 50) patients.pop();
  localStorage.setItem('shai_patients', JSON.stringify(patients));
}

function renderPatientsTable(filter = '') {
  const tbody  = $('patientsTbody');
  const all    = patients.length ? patients : DEMO_PATIENTS;
  const filtered = filter
    ? all.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : all;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--clr-text-muted)">No patients found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => {
    const hrSt   = getStatus('hr',   p.hr);
    const spo2St = getStatus('spo2', p.spo2);
    const tempSt = getStatus('temp', p.temp);
    const bpSt   = getStatus('bp',   p.bp);

    const worst = [hrSt, spo2St, tempSt, bpSt].reduce((acc, s) => {
      if (s.cls === 'danger') return 'danger';
      if (s.cls === 'warn' && acc !== 'danger') return 'warn';
      return acc;
    }, 'ok');
    const pillCls = worst === 'ok' ? 'pill-healthy' : worst === 'warn' ? 'pill-warning' : 'pill-critical';
    const pillLbl = worst === 'ok' ? '✅ Healthy'   : worst === 'warn' ? '⚠️ Warning'   : '🚨 Critical';

    const hrClr   = { ok:'#10b981', warn:'#f97316', danger:'#ef4444' }[hrSt.cls];
    const spo2Clr = { ok:'#10b981', warn:'#f97316', danger:'#ef4444' }[spo2St.cls];
    const tempClr = { ok:'#10b981', warn:'#f97316', danger:'#ef4444' }[tempSt.cls];
    const bpClr   = { ok:'#10b981', warn:'#f97316', danger:'#ef4444' }[bpSt.cls];

    return `
      <tr>
        <td>${i + 1}</td>
        <td style="font-weight:600;color:var(--clr-text)">${p.name}</td>
        <td>${p.age}</td>
        <td style="color:${hrClr};font-weight:600">${p.hr} bpm</td>
        <td style="color:${spo2Clr};font-weight:600">${p.spo2}%</td>
        <td style="color:${tempClr};font-weight:600">${p.temp}°C</td>
        <td style="color:${bpClr};font-weight:600">${p.bp} mmHg</td>
        <td><span class="status-pill ${pillCls}">${pillLbl}</span></td>
        <td>${p.time}</td>
      </tr>
    `;
  }).join('');
}

// Search patients
$('patientSearch').addEventListener('input', e => {
  renderPatientsTable(e.target.value);
});

// ── MODAL ─────────────────────────────────────────────────
function showModal(icon, title, msg) {
  $('modalIcon').textContent  = icon;
  $('modalTitle').textContent = title;
  $('modalMsg').textContent   = msg;
  $('alertModal').style.display = 'flex';
}
$('modalClose').addEventListener('click', () => {
  $('alertModal').style.display = 'none';
});
$('alertModal').addEventListener('click', e => {
  if (e.target === $('alertModal')) $('alertModal').style.display = 'none';
});

// ── SCROLL ANIMATIONS ─────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate-in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  $$('.feature-card, .pipeline-step, .team-card, .highlight').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPatientsTable();
  startHeroEcg();
  animateHeroVitals();
  initScrollAnimations();
});

// Handle window resize for ECG canvas
window.addEventListener('resize', () => {
  const ecgCanvas = $('ecgCanvas');
  if (ecgCanvas && ecgCanvas.style.display !== 'none') {
    ecgCanvas.width = ecgCanvas.offsetWidth || 900;
  }
  const heroCanvas = $('heroEcgCanvas');
  if (heroCanvas) {
    heroCanvas.width = heroCanvas.parentElement.offsetWidth || 300;
  }
});
