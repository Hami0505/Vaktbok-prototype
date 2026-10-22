const { calcShift, checkRest, monthSummary, toCSV } = require('./logic.js');
let ok = 0, fail = 0;
const eq = (name, a, b) => { const pass = Math.abs(a - b) < 0.01; pass ? ok++ : fail++; console.log((pass ? 'OK  ' : 'FEIL') + ' ' + name + ' → ' + a.toFixed(2) + ' (forventet ' + b + ')'); };
const emp = { id: 'a', rate: 250, eveAdd: 50, wkdAdd: 60 };

// Dagvakt onsdag 08–16, 30 min pause
let c = calcShift({ date: '2026-10-21', start: '08:00', end: '16:00', breakMin: 30 }, emp);
eq('Dagvakt timer', c.hours, 7.5); eq('Dagvakt kveld', c.eveH, 0); eq('Dagvakt lønn', c.pay, 1875);

// Kveldsvakt onsdag 15–23, ingen pause → 6 kveldstimer
c = calcShift({ date: '2026-10-21', start: '15:00', end: '23:00', breakMin: 0 }, emp);
eq('Kveld timer', c.hours, 8); eq('Kveld tillegg-timer', c.eveH, 6); eq('Kveld lønn', c.pay, 8*250 + 6*50);

// Nattevakt fredag 22 → lørdag 08 (over midnatt + inn i helg)
c = calcShift({ date: '2026-10-23', start: '22:00', end: '08:00', breakMin: 0 }, emp);
eq('Natt timer', c.hours, 10); eq('Natt kveld/natt', c.eveH, 8); eq('Natt helg', c.wkdH, 8);

// Pause lengre enn vakta skal ikke gi negative timer
c = calcShift({ date: '2026-10-21', start: '10:00', end: '11:00', breakMin: 999 }, emp);
eq('Pause > vakt', c.hours, 0);

// Hviletid: slutt 23:00, start 07:00 neste dag = 8 t → varsel
let w = checkRest([
  { id: 1, date: '2026-10-21', start: '15:00', end: '23:00' },
  { id: 2, date: '2026-10-22', start: '07:00', end: '15:00' },
  { id: 3, date: '2026-10-23', start: '07:00', end: '15:00' },
]);
eq('Hviletid-varsel finnes', w[2] ? 1 : 0, 1); eq('Gap', w[2].gap, 8); eq('Ingen varsel med 16 t hvile', w[3] ? 1 : 0, 0);

// Overlapp mellom to arbeidsgivere
w = checkRest([
  { id: 1, date: '2026-10-21', start: '08:00', end: '16:00' },
  { id: 2, date: '2026-10-21', start: '15:00', end: '20:00' },
]);
eq('Overlapp oppdaget', w[2] && w[2].type === 'overlap' ? 1 : 0, 1);

// Månedssum filtrerer på måned
const s = monthSummary([
  { id: 1, employerId: 'a', date: '2026-10-21', start: '08:00', end: '16:00', breakMin: 0 },
  { id: 2, employerId: 'a', date: '2026-11-02', start: '08:00', end: '16:00', breakMin: 0 },
], [emp], '2026-10');
eq('Månedssum timer', s.total.hours, 8); eq('Månedssum antall', s.total.count, 1);

// CSV escaper anførselstegn
const csv = toCSV([{ id: 1, employerId: 'a', date: '2026-10-21', start: '08:00', end: '16:00', note: 'sa "hei"' }], [{ ...emp, name: 'Test' }], '2026-10');
eq('CSV escaping', csv.includes('"sa ""hei"""') ? 1 : 0, 1);

console.log(`\n${ok} bestått, ${fail} feilet`);
process.exit(fail ? 1 : 0);
