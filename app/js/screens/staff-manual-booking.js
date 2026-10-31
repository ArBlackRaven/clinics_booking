/* ============================================================
   staff-manual-booking.js — receptionist books for a walk-in
   patient: clinic -> doctor -> day -> timeline (nothing
   selected by default) -> name/phone -> save.
   Route: #/staff-book
   ============================================================ */

App.screens.staffbook = (function () {
  'use strict';

  var st = { clinicId: 'family', doctorId: null, date: null, time: null };

  function doctorsOf(clinicId) {
    return DATA.doctors.filter(function (d) { return d.clinicId === clinicId; });
  }
  function firstDoctorDay(doctorId) {
    var days = U.nextDays(14).filter(function (ds) { return DATA.getBaseSlots(doctorId, ds).length > 0; });
    return days[0] || null;
  }

  function render() {
    // ensure defaults
    if (!st.doctorId || !doctorsOf(st.clinicId).some(function (d) { return d.id === st.doctorId; })) {
      st.doctorId = doctorsOf(st.clinicId)[0].id;
      st.date = firstDoctorDay(st.doctorId);
      st.time = null;
    }
    if (!st.date) st.date = firstDoctorDay(st.doctorId);

    var clinicTabs = DATA.clinics.map(function (c) {
      return '<button type="button" class="seg-tab' + (c.id === st.clinicId ? ' seg-tab--on' : '') + '" data-clinic="' + c.id + '">' + U.esc(c.name.replace('عيادة ', '')) + '</button>';
    }).join('');

    var docSel = doctorsOf(st.clinicId).map(function (d) {
      return '<option value="' + d.id + '"' + (d.id === st.doctorId ? ' selected' : '') + '>' + U.esc(d.name) + '</option>';
    }).join('');

    var days = U.nextDays(14).filter(function (ds) { return DATA.getBaseSlots(st.doctorId, ds).length > 0; });
    var dayBtns = days.map(function (ds) {
      return '<button type="button" class="day-btn' + (ds === st.date ? ' day-btn--on' : '') + ' ml-2 last:ml-0" data-date="' + ds + '">' +
        '<span class="day-btn__dow">' + (ds === DATA.todayStr() ? 'النهاردة' : U.dowName(ds)) + '</span>' +
        '<span class="day-btn__num">' + U.dayNum(ds) + '</span>' +
        '<span class="day-btn__mon">' + U.monthName(ds) + '</span></button>';
    }).join('');

    return '' +
      U.header('حجز يدوي للمرضى', { rightIcon: 'edit_calendar' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<p class="text-sm text-text-muted mb-4">للمريض اللي جي العيادة من غير حجز أونلاين. اختار الوقت يدوياً من الشريط الزمني.</p>' +

        '<div class="seg-tabs mb-4">' + clinicTabs + '</div>' +

        '<label class="label" for="doc">الطبيب</label>' +
        '<select id="doc" class="input mb-4" style="min-height:52px">' + docSel + '</select>' +

        '<div class="flex overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">' + dayBtns + '</div>' +

        '<div id="tl"></div>' +

        '<hr class="divider" />' +

        '<label class="label" for="pname">اسم المريض</label>' +
        '<input id="pname" class="input mb-3" type="text" placeholder="مثال: فاتن عبد الحميد علي" />' +
        '<label class="label" for="pphone">رقم الموبايل</label>' +
        '<input id="pphone" class="input" type="tel" inputmode="numeric" maxlength="11" placeholder="01xxxxxxxxx" dir="ltr" />' +
        '<p id="err" class="field-error hidden"></p>' +
      '</main>' +
      '<div class="action-bar">' +
        U.primaryBtn('تأكيد الحجز اليدوي', 'id="save" disabled') +
      '</div>';
  }

  function init() {
    var tlHost = document.getElementById('tl');
    var btn = document.getElementById('save');
    var err = document.getElementById('err');

    function refreshSave() { btn.disabled = !(st.date && st.time); }

    var timeline = Timeline.create(tlHost, {
      doctorId: st.doctorId,
      date: st.date,
      selected: null, // nothing selected by default
      onChange: function (t) { st.time = t; refreshSave(); }
    });

    // live-refresh slot availability (e.g. patient booking in the other tab)
    function onExternalChange(e) {
      if (e.key && e.key.indexOf('clinics.bookings') !== 0) return;
      timeline.refresh();
      if (!st.time) refreshSave();
    }
    window.addEventListener('storage', onExternalChange);

    document.querySelectorAll('.seg-tab').forEach(function (el) {
      el.addEventListener('click', function () {
        st.clinicId = el.dataset.clinic;
        st.doctorId = doctorsOf(st.clinicId)[0].id;
        st.date = firstDoctorDay(st.doctorId);
        Router.render();
      });
    });

    document.getElementById('doc').addEventListener('change', function (e) {
      st.doctorId = e.target.value;
      var ok = U.nextDays(14).filter(function (ds) { return DATA.getBaseSlots(st.doctorId, ds).length > 0; });
      if (ok.indexOf(st.date) === -1) st.date = ok[0];
      Router.render();
    });

    document.querySelectorAll('[data-date]').forEach(function (el) {
      el.addEventListener('click', function () {
        st.date = el.dataset.date;
        document.querySelectorAll('[data-date]').forEach(function (b) { b.classList.remove('day-btn--on'); });
        el.classList.add('day-btn--on');
        timeline.setDate(el.dataset.date); // resets selection to none
        refreshSave();
      });
    });

    btn.addEventListener('click', function () {
      err.classList.add('hidden');
      var name = (document.getElementById('pname').value || '').trim();
      var phone = (document.getElementById('pphone').value || '').replace(/\D/g, '');
      function fail(m) { err.textContent = m; err.classList.remove('hidden'); }
      if (name.length < 3) { fail('اكتب اسم المريض كامل.'); return; }
      if (!/^01[0125]\d{8}$/.test(phone)) { fail('رقم موبايل مصري غير صحيح.'); return; }
      if (!st.time) { fail('من فضلك اختار وقت من الشريط الزمني.'); return; }

      var slots = Store.getSlots(st.doctorId, st.date);
      var s = slots.find(function (x) { return x.time === st.time; });
      if (!s || !s.available) { fail('الوقت ده بقى محجوز، اختار وقت تاني.'); return; }

      var b = Store.addBooking({
        clinicId: st.clinicId,
        doctorId: st.doctorId,
        date: st.date,
        time: st.time,
        patientName: name,
        phone: phone,
        source: 'staff',
        status: 'coming'
      });
      st.time = null;
      U.toast('تم الحجز اليدوي', 'كود الحجز: ' + b.code + ' — بلّغ المريض بالكود.');
      Router.go('staff');
    });
  }

  return { render: render, init: init };
})();
