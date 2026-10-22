// Vaktbok – ren logikk (ingen DOM). Brukes av index.html og testene.
const MIN = 60000, HOUR = 3600000;
const RULES = { eveStart: 17, eveEnd: 6, minRestH: 11 };

function parseShift(s) {
  const [y, m, d] = s.date.split('-').map(Number);
  const [sh, sm] = s.start.split(':').map(Number);
  const [eh, em] = s.end.split(':').map(Number);
  const start = new Date(y, m - 1, d, sh, sm);
  let end = new Date(y, m - 1, d, eh, em);
  if (end <= start) end = new Date(y, m - 1, d + 1, eh, em); // over midnatt
  return { start, end };
}

function calcShift(s, emp, rules = RULES) {
  const { start, end } = parseShift(s);
  const gross = (end - start) / MIN;
  const brk = Math.min(Math.max(Number(s.breakMin) || 0, 0), gross);
  const worked = gross - brk;
  let eve = 0, wkd = 0;
  for (let t = start.getTime(); t < end.getTime(); t += MIN) {
    const dt = new Date(t), h = dt.getHours(), wd = dt.getDay();
    if (wd === 0 || wd === 6) wkd++;
    if (h >= rules.eveStart || h < rules.eveEnd) eve++;
  }
  const f = gross ? worked / gross : 0; // pausen trekkes forholdsmessig
  const hours = worked / 60, eveH = (eve * f) / 60, wkdH = (wkd * f) / 60;
  const e = emp || {};
  const pay = hours * (Number(e.rate) || 0) + eveH * (Number(e.eveAdd) || 0) + wkdH * (Number(e.wkdAdd) || 0);
  return { start, end, hours, eveH, wkdH, pay };
}

function checkRest(shifts, minRestH = RULES.minRestH) {
  const list = shifts.map(s => ({ s, ...parseShift(s) })).sort((a, b) => a.start - b.start);
  const warn = {};
  let prev = null;
  for (const cur of list) {
    if (prev) {
      const gap = (cur.start - prev.end) / HOUR;
      if (gap < 0) warn[cur.s.id] = { type: 'overlap', with: prev.s.id, gap };
      else if (gap < minRestH) warn[cur.s.id] = { type: 'rest', with: prev.s.id, gap };
    }
    if (!prev || cur.end > prev.end) prev = cur;
  }
  return warn;
}

function monthSummary(shifts, employers, ym) {
  const byEmp = {};
  let total = { hours: 0, eveH: 0, wkdH: 0, pay: 0, count: 0 };
  for (const s of shifts.filter(x => x.date.startsWith(ym))) {
    const emp = employers.find(e => e.id === s.employerId);
    const c = calcShift(s, emp);
    const k = s.employerId;
    byEmp[k] = byEmp[k] || { hours: 0, eveH: 0, wkdH: 0, pay: 0, count: 0 };
    for (const o of [byEmp[k], total]) {
      o.hours += c.hours; o.eveH += c.eveH; o.wkdH += c.wkdH; o.pay += c.pay; o.count++;
    }
  }
  return { byEmp, total };
}

function toCSV(shifts, employers, ym) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['Dato', 'Arbeidsgiver', 'Start', 'Slutt', 'Pause (min)', 'Timer', 'Kveld/natt-timer', 'Helgetimer', 'Estimert lønn', 'Notat']];
  for (const s of shifts.filter(x => x.date.startsWith(ym)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))) {
    const emp = employers.find(e => e.id === s.employerId);
    const c = calcShift(s, emp);
    rows.push([s.date, emp ? emp.name : '', s.start, s.end, s.breakMin || 0,
      c.hours.toFixed(2), c.eveH.toFixed(2), c.wkdH.toFixed(2), c.pay.toFixed(0), s.note || '']);
  }
  return rows.map(r => r.map(q).join(';')).join('\n');
}

if (typeof module !== 'undefined') module.exports = { parseShift, calcShift, checkRest, monthSummary, toCSV, RULES };
