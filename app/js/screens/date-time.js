/* ============================================================
   date-time.js — step 3: day selector + timeline picker
   Route: #/datetime
   ============================================================ */

App.screens.datetime = (function () {
  'use strict';

  function render() {
    var draft = Store.getDraft();
    var doc = DATA.doctors.find(function (d) { return d.id === draft.doctorId; });
    if (!doc) return U.header('تحديد المعاد') + '<main class="p-5"><p>اختر طبيب أولاً.</p></main>';
    var clinic = DATA.clinics.find(function (c) { return c.id === doc.clinicId; });

    // days: next 10 days where the doctor has slots
    var days = U.nextDays(10).filter(function (ds) {
      return DATA.getBaseSlots(doc.id, ds).length > 0;
    });
    var selectedDate = draft.date || days[0] || null;

    var dayBtns = days.map(function (ds) {
      var on = ds === selectedDate;
      return '' +
        '<button type="button" class="day-btn' + (on ? ' day-btn--on' : '') + ' ml-2.5 last:ml-0" data-date="' + ds + '">' +
          '<span class="day-btn__dow">' + U.dowName(ds) + '</span>' +
          '<span class="day-btn__num">' + U.dayNum(ds) + '</span>' +
          '<span class="day-btn__mon">' + U.monthName(ds) + '</span>' +
        '</button>';
    }).join('');

    return '' +
      U.header('تحديد التاريخ والوقت', { rightIcon: 'calendar_today' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<div class="text-xs font-semibold text-brand mb-1">الخطوة ٣ من ٤ · ' + U.esc(clinic.name) + ' · ' + U.esc(doc.name) + '</div>' +
        '<h1 class="text-2xl font-bold mb-4">اختار اليوم والتوقيت</h1>' +

        '<div class="mb-2 row-between">' +
          '<span class="text-sm font-semibold">الأيام المتاحة</span>' +
          '<span class="text-xs text-text-muted">اسحب لعرض المزيد</span>' +
        '</div>' +
        '<div class="flex overflow-x-auto no-scrollbar pb-1 mb-5 -mx-4 px-4" id="days">' + dayBtns + '</div>' +

        '<div id="tl"></div>' +

        '<div class="mt-4 flex items-center gap-4 text-xs text-text-muted">' +
          '<span class="flex items-center gap-1.5"><span class="inline-block w-4 h-2.5 rounded" style="background:var(--brand)"></span> متاح</span>' +
          '<span class="flex items-center gap-1.5"><span class="inline-block w-4 h-2.5 rounded" style="background:#DDE2E5"></span> محجوز</span>' +
          '<span class="flex items-center gap-1.5"><span class="inline-block w-4 h-2.5 rounded" style="background:#B45309;opacity:.5"></span> الوقت الحالي</span>' +
        '</div>' +

        '<hr class="divider" />' +

        '<button type="button" id="manual-toggle" class="button button--secondary mb-3">اكتب المعاد يدوي</button>' +
        '<div id="manual-panel" class="card hidden">' +
          '<label class="label" for="m-date">التاريخ</label>' +
          '<input id="m-date" class="input mb-3" type="date" min="' + DATA.todayStr() + '" value="' + (selectedDate || '') + '" />' +
          '<label class="label" for="m-time">الوقت</label>' +
          '<input id="m-time" class="input mb-2" type="time" step="900" placeholder="HH:MM" />' +
          '<p id="m-error" class="field-error hidden"></p>' +
          '<button type="button" id="m-apply" class="button button--secondary mt-2">تأكيد الاختيار اليدوي</button>' +
        '</div>' +
      '</main>' +
      '<div class="action-bar">' +
        U.primaryBtn('متابعة للمراجعة', 'id="next" disabled') +
      '</div>';
  }

  function init() {
    var draft = Store.getDraft();
    var doc = DATA.doctors.find(function (d) { return d.id === draft.doctorId; });
    if (!doc) return;

    var btnNext = document.getElementById('next');
    var tlHost = document.getElementById('tl');
    var currentDate = draft.date || Store.getDraft().date;
    if (!currentDate) {
      var days = U.nextDays(10).filter(function (ds) { return DATA.getBaseSlots(doc.id, ds).length > 0; });
      currentDate = days[0];
    }

    function refreshNext() {
      var d = Store.getDraft();
      btnNext.disabled = !(d.date && d.time);
    }

    var timeline = Timeline.create(tlHost, {
      doctorId: doc.id,
      date: currentDate,
      selected: null, // nothing selected by default
      onChange: function (t) {
        Store.setDraft({ date: currentDate, time: t });
        refreshNext();
      }
    });

    Store.setDraft({ date: currentDate, time: null });
    refreshNext();

    // keep in sync if another tab (staff mode) books/cancels slots
    function onExternalChange(e) {
      if (e.key && e.key.indexOf('clinics.bookings') !== 0) return;
      timeline.refresh();
    }
    window.addEventListener('storage', onExternalChange);

    // day switching
    document.querySelectorAll('#days .day-btn').forEach(function (el) {
      el.addEventListener('click', function () {
        currentDate = el.dataset.date;
        document.querySelectorAll('#days .day-btn').forEach(function (b) { b.classList.remove('day-btn--on'); });
        el.classList.add('day-btn--on');
        Store.setDraft({ date: currentDate, time: null });
        timeline.setDate(currentDate); // same instance, nothing selected again
        refreshNext();
      });
    });

    // manual entry panel
    var toggle = document.getElementById('manual-toggle');
    var panel = document.getElementById('manual-panel');
    var mDate = document.getElementById('m-date');
    var mTime = document.getElementById('m-time');
    var mErr = document.getElementById('m-error');

    toggle.addEventListener('click', function () {
      panel.classList.toggle('hidden');
      toggle.textContent = panel.classList.contains('hidden') ? 'اكتب المعاد يدوي' : 'إخفاء الإدخال اليدوي';
    });

    document.getElementById('m-apply').addEventListener('click', function () {
      mErr.classList.add('hidden');
      var ds = mDate.value, tm = mTime.value;
      function fail(msg) { mErr.textContent = msg; mErr.classList.remove('hidden'); }
      if (!ds || !tm) { fail('من فضلك اختار التاريخ والوقت.'); return; }
      if (DATA.getBaseSlots(doc.id, ds).length === 0) {
        fail('الدكتور مالوش مواعيد في اليوم ده. اختار يوم تاني من الأيام المتاحة.');
        return;
      }
      var slots = Store.getSlots(doc.id, ds);
      var match = slots.find(function (s) { return s.time === tm; });
      if (!match) {
        var open = DATA.clinics.find(function (c) { return c.id === doc.clinicId; });
        fail('الوقت خارج مواعيد العيادة (' + DATA.pad2(open.openHour) + ':٠٠ - ' + DATA.pad2(open.closeHour - 1) + ':٣٠).');
        return;
      }
      if (!match.available) { fail('الوقت ده محجوز بالفعل. جرّب وقت تاني.'); return; }

      // accept -> select in timeline & switch day button
      currentDate = ds;
      Store.setDraft({ date: ds, time: tm });
      var dayBtn = document.querySelector('#days .day-btn[data-date="' + ds + '"]');
      document.querySelectorAll('#days .day-btn').forEach(function (b) { b.classList.remove('day-btn--on'); });
      if (dayBtn) dayBtn.classList.add('day-btn--on');
      timeline.setDate(ds);
      timeline.setTime(tm);
      panel.classList.add('hidden');
      toggle.textContent = 'اكتب المعاد يدوي';
      refreshNext();
    });

    btnNext.addEventListener('click', function () {
      var d = Store.getDraft();
      if (d.date && d.time) Router.go('confirm');
    });

    return function cleanup() {
      window.removeEventListener('storage', onExternalChange);
    };
  }

  return { render: render, init: init };
})();
