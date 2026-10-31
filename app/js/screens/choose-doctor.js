/* ============================================================
   choose-doctor.js — doctor list for selected clinic (step 2)
   Route: #/doctor
   ============================================================ */

App.screens.doctor = (function () {
  'use strict';

  function render() {
    var draft = Store.getDraft();
    var clinic = DATA.clinics.find(function (c) { return c.id === draft.clinicId; }) || DATA.clinics[0];
    var docs = DATA.doctors.filter(function (d) { return d.clinicId === clinic.id; });

    // "available today" chip based on day-of-week availability
    var today = DATA.todayStr();
    var cards = docs.map(function (doc) {
      var worksToday = DATA.getBaseSlots(doc.id, today).length > 0;
      var nextDayLabel = '';
      if (!worksToday) {
        for (var i = 1; i <= 7; i++) {
          var ds = U.addDays(today, i);
          if (DATA.getBaseSlots(doc.id, ds).length) {
            nextDayLabel = 'متاح ' + (i === 1 ? 'بكرة' : U.dowName(ds));
            break;
          }
        }
      }
      var selected = draft.doctorId === doc.id;
      return '' +
        '<button type="button" class="card card--tappable w-full text-right mb-3 doctor-card' + (selected ? ' card--selected' : '') + '" data-doctor="' + doc.id + '">' +
          '<div class="flex items-center gap-3">' +
            U.avatar(doc) +
            '<div class="min-w-0 flex-1">' +
              '<div class="flex items-center gap-2 flex-wrap">' +
                '<span class="font-bold text-[16px] truncate">' + U.esc(doc.name) + '</span>' +
                (worksToday
                  ? '<span class="chip chip--active shrink-0">متاح اليوم</span>'
                  : '<span class="chip shrink-0">' + U.esc(nextDayLabel || 'إجازة') + '</span>') +
              '</div>' +
              '<div class="text-[13px] text-text-muted mt-0.5 truncate">' + U.esc(doc.specialty) + '</div>' +
              '<div class="flex items-center gap-1 text-[13.5px] mt-1">' +
                '<span class="material-symbols-outlined text-brand" style="font-size:17px">payments</span>' +
                '<span class="font-bold">' + doc.fee + ' ج.م</span>' +
              '</div>' +
            '</div>' +
            '<span class="radio-dot' + (selected ? ' radio-dot--on' : '') + '"><span class="material-symbols-outlined">check</span></span>' +
          '</div>' +
        '</button>';
    }).join('');

    return '' +
      U.header('اختيار الطبيب', { rightIcon: 'medical_services' }) +
      '<main class="flex-1 px-4 pt-5 pb-safe">' +
        '<div class="text-xs font-semibold text-brand mb-1">الخطوة ٢ من ٤ · ' + U.esc(clinic.name) + '</div>' +
        '<h1 class="text-2xl font-bold mb-1">اختر الطبيب المعالج</h1>' +
        '<p class="text-sm text-text-muted mb-5">جميع الأطباء معتمدون من نقابة الأطباء المصرية.</p>' +
        '<div role="radiogroup" aria-label="قائمة الأطباء">' + cards + '</div>' +
        '<div class="mt-5">' +
          U.banner('savings', 'قيمة الكشف ' + (docs.length ? Math.min.apply(null, docs.map(function (d) { return d.fee; })) : 0) +
            ' ج.م على الأقل — تُدفع كاش في العيادة يوم الموعد.') +
        '</div>' +
      '</main>' +
      '<div class="action-bar">' +
        U.primaryBtn('متابعة لتحديد المعاد', 'id="next" disabled') +
      '</div>';
  }

  function init() {
    var draft = Store.getDraft();
    var btn = document.getElementById('next');
    btn.disabled = !draft.doctorId;

    document.querySelectorAll('.doctor-card').forEach(function (el) {
      el.addEventListener('click', function () {
        Store.setDraft({ doctorId: el.dataset.doctor, date: null, time: null });
        Router.render();
      });
    });

    btn.addEventListener('click', function () {
      var d = Store.getDraft();
      if (!d.doctorId) return;
      Router.go('datetime');
    });
  }

  return { render: render, init: init };
})();
