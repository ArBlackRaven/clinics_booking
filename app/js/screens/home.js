/* ============================================================
   home.js — clinic selection + upcoming booking strip
   Route: #/home
   ============================================================ */

App.screens.home = (function () {
  'use strict';

  function render() {
    var session = Store.getSession() || {};
    var next = session.phone ? Store.nextPatientBooking(session.phone) : null;

    var strip = '';
    if (next) {
      var doc = DATA.doctors.find(function (d) { return d.id === next.doctorId; });
      var clinic = DATA.clinics.find(function (c) { return c.id === next.clinicId; });
      strip = '' +
        '<button type="button" class="upcoming-strip mb-5" data-goto="ticket/' + U.esc(next.id) + '">' +
          '<div class="flex items-center gap-3 min-w-0">' +
            '<span class="material-symbols-outlined text-brand">event_available</span>' +
            '<div class="min-w-0">' +
              '<div class="text-[13px] font-bold truncate">' + U.esc(clinic.name) + ' — ' + U.esc(doc.name) + '</div>' +
              '<div class="text-xs text-text-muted">' + U.esc(U.fmtDateShort(next.date)) + '، ' + U.esc(U.fmtTime(next.time)) + '</div>' +
            '</div>' +
          '</div>' +
          '<span class="material-symbols-outlined text-brand shrink-0">chevron_forward</span>' +
        '</button>';
    }

    var cards = DATA.clinics.map(function (c) {
      return '' +
        '<button type="button" class="card card--tappable w-full text-right mb-3 clinic-card" data-clinic="' + c.id + '">' +
          '<div class="row-between">' +
            '<div class="flex items-center gap-3 min-w-0">' +
              '<div class="w-11 h-11 rounded-lg bg-brand-light text-brand flex items-center justify-center shrink-0">' +
                '<span class="material-symbols-outlined" style="font-size:22px">' + c.icon + '</span>' +
              '</div>' +
              '<div class="min-w-0">' +
                '<div class="font-bold text-[16.5px] leading-snug">' + U.esc(c.name) + '</div>' +
                '<div class="text-[13px] text-text-muted leading-relaxed mt-0.5">' + U.esc(c.desc) + '</div>' +
              '</div>' +
            '</div>' +
            '<span class="material-symbols-outlined text-brand shrink-0">chevron_forward</span>' +
          '</div>' +
        '</button>';
    }).join('');

    return '' +
      U.header('حجز موعد جديد', { noBack: true, rightIcon: 'calendar_month' }) +
      '<main class="flex-1 px-4 pt-5 pb-safe">' +
        '<div class="mb-1 text-sm text-text-muted">أهلاً بيك 👋</div>' +
        '<h1 class="text-2xl font-bold mb-4">اختر العيادة المطلوبة</h1>' +
        strip +
        '<div role="list" aria-label="قائمة العيادات">' + cards + '</div>' +

        '<div class="mt-4 flex items-center justify-between">' +
          '<button type="button" class="linklike" data-goto="bookings">مواعيدي السابقة والقادمة</button>' +
          '<button type="button" id="logout" class="linklike" style="color:var(--error)">خروج</button>' +
        '</div>' +

        '<div class="mt-6">' +
          U.banner('payments', 'الدفع كاش في العيادة عند الحضور. قيمة الكشف بتظهرلك قبل التأكيد.') +
        '</div>' +
      '</main>';
  }

  function init() {
    document.querySelectorAll('.clinic-card').forEach(function (el) {
      el.addEventListener('click', function () {
        Store.setDraft({ clinicId: el.dataset.clinic, doctorId: null, date: null, time: null });
        Router.go('doctor');
      });
    });

    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function () {
        var parts = el.dataset.goto.split('/');
        Router.go(parts[0], parts.slice(1));
      });
    });

    document.getElementById('logout').addEventListener('click', function () {
      Store.clearSession();
      Router.go('login');
    });
  }

  return { render: render, init: init };
})();
