/* ============================================================
   staff-schedule.js — daily schedule, 3-clinic switch, day
   selector, appointments by time + "فاضي" empty slots.
   Route: #/staff
   ============================================================ */

App.screens.staff = (function () {
  'use strict';

  var state = { clinicId: 'family', date: null };
  var STATUS_ORDER = ['coming', 'arrived', 'done'];
  var STATUS_LABEL = { coming: 'قادم', arrived: 'وصل', done: 'تم الكشف' };

  function render() {
    if (!state.date) state.date = DATA.todayStr();
    var clinic = DATA.clinics.find(function (c) { return c.id === state.clinicId; });

    var tabs = DATA.clinics.map(function (c) {
      return '<button type="button" class="seg-tab' + (c.id === state.clinicId ? ' seg-tab--on' : '') + '" data-clinic="' + c.id + '">' + U.esc(c.name.replace('عيادة ', '')) + '</button>';
    }).join('');

    // day chips: today +/- 3 days
    var daysHtml = '';
    for (var i = -3; i <= 3; i++) {
      var ds = U.addDays(DATA.todayStr(), i);
      daysHtml += '<button type="button" class="day-btn' + (ds === state.date ? ' day-btn--on' : '') + ' ml-2 last:ml-0" data-date="' + ds + '">' +
        '<span class="day-btn__dow">' + (i === 0 ? 'النهاردة' : U.dowName(ds)) + '</span>' +
        '<span class="day-btn__num">' + U.dayNum(ds) + '</span>' +
        '<span class="day-btn__mon">' + U.monthName(ds) + '</span></button>';
    }

    // build schedule rows across the clinic's working hours
    var bookings = Store.clinicDayBookings(state.clinicId, state.date);
    var d = U.parseDate(state.date);
    var clinicOpen = clinic.days.indexOf(d.getDay()) !== -1;

    var rows = '';
    if (!clinicOpen) {
      rows = '<div class="card text-center py-8 text-text-muted">العيادة مغلقة في اليوم ده.</div>';
    } else {
      for (var h = clinic.openHour; h < clinic.closeHour; h++) {
        for (var m = 0; m < 60; m += 30) {
          var t = DATA.pad2(h) + ':' + DATA.pad2(m);
          var bk = bookings.find(function (b) { return b.time === t; });
          if (bk) {
            var doc = DATA.doctors.find(function (x) { return x.id === bk.doctorId; });
            var cls = bk.status === 'done' ? 'status-btn--done' : (bk.status === 'arrived' ? 'status-btn--arrived' : '');
            rows += '' +
              '<div class="schedule-row mb-2">' +
                '<span class="schedule-row__time">' + t + '</span>' +
                '<div class="min-w-0 flex-1">' +
                  '<div class="font-bold text-[14px] truncate">' + U.esc(bk.patientName) + '</div>' +
                  '<div class="text-xs text-text-muted truncate">' + U.esc(doc ? doc.name : '') + ' · كود <span dir="ltr">' + U.esc(bk.code) + '</span></div>' +
                '</div>' +
                '<button type="button" class="status-btn ' + cls + ' shrink-0" data-id="' + U.esc(bk.id) + '">' + STATUS_LABEL[bk.status] + '</button>' +
              '</div>';
          } else {
            rows += '' +
              '<div class="schedule-row schedule-row--empty mb-2">' +
                '<span class="schedule-row__time">' + t + '</span>' +
                '<span class="flex-1 text-[13.5px]">فاضي</span>' +
                '<span class="chip">متاح أونلاين</span>' +
              '</div>';
          }
        }
      }
    }

    var counts = {
      total: bookings.length,
      arrived: bookings.filter(function (b) { return b.status === 'arrived'; }).length,
      done: bookings.filter(function (b) { return b.status === 'done'; }).length
    };

    return '' +
      U.header('لوحة الاستقبال', { noBack: true, rightIcon: 'badge' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<div class="row-between mb-3">' +
          '<h1 class="text-xl font-bold">جدول اليوم</h1>' +
          '<button type="button" id="logout-staff" class="linklike" style="color:var(--error)">خروج</button>' +
        '</div>' +

        '<div class="seg-tabs mb-4">' + tabs + '</div>' +
        '<div class="flex overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">' + daysHtml + '</div>' +

        '<div class="row-between mb-3 text-[13px] text-text-muted">' +
          '<span>إجمالي: <b class="text-text-main">' + counts.total + '</b></span>' +
          '<span>وصلوا: <b class="text-text-main">' + counts.arrived + '</b></span>' +
          '<span>تم الكشف: <b class="text-text-main">' + counts.done + '</b></span>' +
        '</div>' +

        rows +

        '<div class="mt-5 flex gap-3">' +
          '<button type="button" class="button button--secondary" data-goto="checkin">' +
            '<span class="material-symbols-outlined" style="font-size:20px">qr_code_scanner</span> تسجيل وصول</button>' +
          '<button type="button" class="button button--secondary" data-goto="staff-book">' +
            '<span class="material-symbols-outlined" style="font-size:20px">add_task</span> حجز يدوي</button>' +
        '</div>' +
      '</main>';
  }

  function init() {
    document.querySelectorAll('.seg-tab').forEach(function (el) {
      el.addEventListener('click', function () { state.clinicId = el.dataset.clinic; Router.render(); });
    });
    document.querySelectorAll('[data-date]').forEach(function (el) {
      el.addEventListener('click', function () { state.date = el.dataset.date; Router.render(); });
    });
    document.querySelectorAll('.status-btn').forEach(function (el) {
      el.addEventListener('click', function () {
        var b = Store.getBooking(el.dataset.id);
        if (!b) return;
        var idx = STATUS_ORDER.indexOf(b.status);
        var next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        Store.updateBooking(b.id, { status: next });
        Router.render();
      });
    });
    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function () { Router.go(el.dataset.goto); });
    });
    document.getElementById('logout-staff').addEventListener('click', function () {
      Store.clearSession();
      Router.go('login');
    });
  }

  return { render: render, init: init };
})();
