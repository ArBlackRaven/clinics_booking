/* ============================================================
   my-bookings.js — patient bookings list
   Route: #/bookings
   ============================================================ */

App.screens.bookings = (function () {
  'use strict';

  var STATUS_LABEL = { coming: 'قادم', arrived: 'وصل', done: 'تم الكشف' };

  function render() {
    var session = Store.getSession() || {};
    var list = Store.patientBookings(session.phone || '');

    var body;
    if (!list.length) {
      body = '<div class="card text-center py-10">' +
        '<span class="material-symbols-outlined text-text-muted" style="font-size:44px">event_repeat</span>' +
        '<p class="text-text-muted mt-2">مالش عندك مواعيد دلوقتي.</p>' +
        '<button type="button" class="linklike mt-1" data-goto="home">احجز موعد جديد</button></div>';
    } else {
      body = list.map(function (b) {
        var doc = DATA.doctors.find(function (d) { return d.id === b.doctorId; });
        var clinic = DATA.clinics.find(function (c) { return c.id === b.clinicId; });
        var past = U.bookingDateTime(b.date, b.time) < new Date();
        var chipCls = b.status === 'done' ? 'chip--active' : (b.status === 'arrived' ? 'chip--warn' : 'chip--brand');
        return '' +
          '<button type="button" class="card card--tappable w-full text-right mb-3 booking-row" data-id="' + U.esc(b.id) + '">' +
            '<div class="row-between mb-1.5">' +
              '<span class="font-bold text-[15.5px]">' + U.esc(clinic.name) + '</span>' +
              '<span class="chip ' + chipCls + '">' + (past && b.status === 'coming' ? 'فائت' : STATUS_LABEL[b.status] || b.status) + '</span>' +
            '</div>' +
            '<div class="text-[13.5px] text-text-muted">' + U.esc(doc.name) + '</div>' +
            '<div class="flex items-center justify-between mt-2">' +
              '<span class="text-[13.5px] font-semibold">' + U.esc(U.fmtDateShort(b.date)) + ' · ' + U.esc(U.fmtTime(b.time)) + '</span>' +
              '<span class="text-xs text-text-muted" dir="ltr">#' + U.esc(b.code) + '</span>' +
            '</div>' +
          '</button>';
      }).join('');
    }

    return '' +
      U.header('مواعيدي', { rightIcon: ' Event_note'.trim() }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<h1 class="text-2xl font-bold mb-4">حجوزاتي</h1>' +
        body +
      '</main>';
  }

  function init() {
    document.querySelectorAll('.booking-row').forEach(function (el) {
      el.addEventListener('click', function () { Router.go('ticket', [el.dataset.id]); });
    });
    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function () { Router.go(el.dataset.goto); });
    });
  }

  return { render: render, init: init };
})();
