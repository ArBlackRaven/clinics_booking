/* ============================================================
   data.js — all mock data in one place (clinics, doctors,
   slot generation rules, seed bookings).
   Exposed as window.DATA
   ============================================================ */

window.DATA = (function () {
  'use strict';

  // ---- 3 clinics with different specialties (Egyptian context) ----
  var clinics = [
    {
      id: 'family',
      name: 'عيادة طب الأسرة',
      desc: 'الرعاية الأولية، الفحوصات الدورية، ومتابعة الأمراض المزمنة',
      icon: 'family_restroom',
      address: '١٢ شارع مصطفى النحاس، مدينة نصر، القاهرة',
      days: [0, 1, 2, 3, 4],        // Sun..Thu (Egyptian week)
      openHour: 10,                  // 10:00
      closeHour: 18,                 // last slot starts before 18:00
      roomPrefix: 'العيادة رقم ١٠'
    },
    {
      id: 'eye',
      name: 'عيادة الرمد والعيون',
      desc: 'كشف النظر، مياه بيضاء، وفحوصات قاع العين',
      icon: 'visibility',
      address: '٤٥ شارع التسعين الشمالي، التجمع الخامس، القاهرة',
      days: [1, 2, 3, 4, 5],        // Mon..Fri
      openHour: 11,
      closeHour: 19,
      roomPrefix: 'العيادة رقم ٢٠'
    },
    {
      id: 'dental',
      name: 'عيادة الأسنان',
      desc: 'تنظيف، حشو، خلع، وتركيب الأطقم والتقويم',
      icon: 'dentistry',
      address: '٨ شارع الهرم أمام محطة الطوارئ، الجيزة',
      days: [0, 1, 2, 3, 5],        // Sun..Wed + Fri
      openHour: 12,
      closeHour: 20,
      roomPrefix: 'العيادة رقم ٣٠'
    }
  ];

  // ---- Doctors (Egyptian names, fees in Egyptian pounds ج.م) ----
  // availabilityDays: day-of-week numbers the doctor works
  var doctors = [
    // طب الأسرة
    { id: 'dr-hany',   clinicId: 'family', name: 'د. هاني عبد الرحمن شلبي',  specialty: 'استشاري طب الأسرة والمجتمع', fee: 150, avatar: null, availabilityDays: [0, 1, 2, 3, 4] },
    { id: 'dr-mona',   clinicId: 'family', name: 'د. منى إبراهيم فؤاد',      specialty: 'أخصائية أولى طب الأسرة',     fee: 120, avatar: null, availabilityDays: [0, 2, 3, 4] },
    { id: 'dr-tarek',  clinicId: 'family', name: 'د. طارق محمود الجندي',     specialty: 'طبيب مقيم - الفحص الشامل',   fee: 100, avatar: null, availabilityDays: [1, 2, 3, 4] },
    // الرمد
    { id: 'dr-reem',   clinicId: 'eye',    name: 'د. ريم أحمد الديب',        specialty: 'استشاري رمد وشبكية',         fee: 200, avatar: null, availabilityDays: [1, 2, 3, 4, 5] },
    { id: 'dr-amr',    clinicId: 'eye',    name: 'د. عمرو سيد زكي',          specialty: 'أخصائي عمليات المياه البيضاء', fee: 250, avatar: null, availabilityDays: [1, 3, 5] },
    // أسنان
    { id: 'dr-salma',  clinicId: 'dental', name: 'د. سلمى حسن عبدالقادر',    specialty: 'أخصائية علاج الجذور والتجميل', fee: 180, avatar: null, availabilityDays: [0, 1, 2, 3] },
    { id: 'dr-mostafa',clinicId: 'dental', name: 'د. مصطفى كامل العسال',     specialty: 'استشاري تركيبات وتقويم',      fee: 220, avatar: null, availabilityDays: [0, 2, 3, 5] },
    { id: 'dr-nada',   clinicId: 'dental', name: 'د. نده علي شعبان',         specialty: 'طبيبة أسنان عامة',            fee: 130, avatar: null, availabilityDays: [1, 2, 3, 5] }
  ];

  // ---- Slot model ----
  // Slots are every 30 minutes between openHour and closeHour.
  // A deterministic pseudo-random pattern marks some slots as "booked"
  // so the timeline shows gray blocks even without user actions.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }

  // Returns array of {time:'HH:MM', status:'available'|'blocked'} for a doctor+date
  function getBaseSlots(doctorId, dateStr) {
    var doc = doctors.find(function (d) { return d.id === doctorId; });
    if (!doc) return [];
    var clinic = clinics.find(function (c) { return c.id === doc.clinicId; });
    var d = new Date(dateStr + 'T00:00:00');
    if (clinic.days.indexOf(d.getDay()) === -1) return [];
    if (doc.availabilityDays.indexOf(d.getDay()) === -1) return [];

    var slots = [];
    for (var h = clinic.openHour; h < clinic.closeHour; h++) {
      for (var m = 0; m < 60; m += 30) {
        var t = pad2(h) + ':' + pad2(m);
        var key = doctorId + '|' + dateStr + '|' + t;
        // ~30% of base slots pre-blocked deterministically
        var blocked = (hash(key) % 100) < 30;
        // lunch break 14:00-14:30 always blocked
        if (t === '14:00') blocked = true;
        slots.push({ time: t, status: blocked ? 'blocked' : 'available' });
      }
    }
    return slots;
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // ---- Seed bookings so staff schedule isn't empty on first run ----
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function tomorrowStr(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + (offsetDays || 1));
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // find a valid (doctor,date,time) triple for seeding
  function seedSlot(doctorId, preferOffset) {
    for (var i = 0; i < 14; i++) {
      var ds = tomorrowStr(preferOffset + i);
      var base = getBaseSlots(doctorId, ds);
      var free = base.filter(function (s) { return s.status === 'available'; });
      if (free.length) return { date: ds, time: free[(i + 3) % free.length].time };
    }
    return null;
  }

  function buildSeeds() {
    var seeds = [];
    var used = {}; // doctor|date|time uniqueness guard
    var plans = [
      { doctorId: 'dr-hany',    patientName: 'أحمد محمد السيد',   phone: '01012345678', status: 'arrived' },
      { doctorId: 'dr-mona',    patientName: 'منى عبد الله حسن',  phone: '01123456789', status: 'coming'  },
      { doctorId: 'dr-reem',    patientName: 'ياسر على إمام',     phone: '01234567890', status: 'done'    },
      { doctorId: 'dr-salma',   patientName: 'هدى مصطفى سالم',    phone: '01098765432', status: 'coming'  },
      { doctorId: 'dr-tarek',   patientName: 'كريم سامى فريد',    phone: '01187654321', status: 'coming'  }
    ];
    plans.forEach(function (p, pi) {
      var doc = doctors.find(function (d) { return d.id === p.doctorId; });
      // prefer TODAY so the staff schedule shows content immediately;
      // fall back to the next working day of this doctor.
      var daysToTry = [todayStr()];
      for (var i = 1; i <= 14; i++) daysToTry.push(tomorrowStr(i));
      for (var k = 0; k < daysToTry.length; k++) {
        var ds = daysToTry[k];
        var free = getBaseSlots(p.doctorId, ds).filter(function (s) { return s.status === 'available'; });
        var picked = null;
        for (var f = 0; f < free.length; f++) {
          var key = p.doctorId + '|' + ds + '|' + free[f].time;
          if (!used[key]) { picked = free[f]; used[key] = true; break; }
        }
        if (picked) {
          seeds.push({
            id: 'seed-' + p.doctorId + '-' + ds + '-' + picked.time,
            code: String(100000 + (hash('SEEDCODE-' + p.doctorId + ds + picked.time) % 900000)),
            clinicId: doc.clinicId,
            doctorId: p.doctorId,
            date: ds,
            time: picked.time,
            patientName: p.patientName,
            phone: p.phone,
            status: p.status,
            source: 'seed',
            createdAt: Date.now()
          });
          break;
        }
      }
    });
    return seeds;
  }

  // Human-readable 6-digit booking code derived from a string
  function genCode(seedStr) {
    var n = hash(seedStr + '|' + Math.floor(Date.now() / 86400000));
    return String(100000 + (n % 900000));
  }

  return {
    clinics: clinics,
    doctors: doctors,
    getBaseSlots: getBaseSlots,
    buildSeeds: buildSeeds,
    genCode: genCode,
    todayStr: todayStr,
    tomorrowStr: tomorrowStr,
    pad2: pad2,
    hash: hash
  };
})();
