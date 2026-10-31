/* ============================================================
   cancel.js — cancel booking with a confirm step
   Route: #/cancel/<bookingId>
   ============================================================ */

App.screens.cancel = (function () {
  'use strict';

  var confirmedOnce = false; // guard against double-cancel within same mount

  function render(params) {
    var b = Store.getBooking(params[0]);
    if (!b || b.status === 'cancelled') {
      return U.header('إلغاء الموعد') + '<main class="p-5">الموعد غير موجود أو ملغي بالفعل.</main>';
    }
    var doc = DATA.doctors.find(function (d) { return d.id === b.doctorId; });
    var clinic = DATA.clinics.find(function (c) { return c.id === b.clinicId; });

    return '' +
      U.header('إلغاء الموعد', { rightIcon: 'event_busy' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<h1 class="text-2xl font-bold mb-2">متأكد إنك عايز تلغي؟</h1>' +
        '<p class="text-sm text-text-muted mb-5 leading-relaxed">' +
          'الإلغاء نهائي ومش هينفع ترجّع المكان ده تاني. تقدر تحجز موعد جديد في أي وقت.' +
        '</p>' +

        '<div class="card mb-5" style="border-color:#E5C7C7">' +
          '<div class="font-bold text-[15.5px] mb-1">' + U.esc(clinic.name) + '</div>' +
          '<div class="text-[13.5px] text-text-muted">' + U.esc(doc.name) + '</div>' +
          '<div class="text-[14px] font-semibold mt-2">' + U.esc(U.fmtDateLong(b.date)) + ' — ' + U.esc(U.fmtTime(b.time)) + '</div>' +
        '</div>' +

        U.banner('warning', 'نرجو الإلغاء قبل الموعد بساعتين على الأقل حتى لا يتم احتسابك كحالة عدم حضور.', '') +

        '<div class="action-bar flex flex-col gap-2 -mx-4 px-4 mt-auto">' +
          '<button type="button" id="do-cancel" class="button button--destructive">تأكيد الإلغاء</button>' +
          '<button type="button" data-action="back" class="button button--primary">لا، أبقاء الموعد</button>' +
        '</div>' +
      '</main>';
  }

  function init() {
    var btn = document.getElementById('do-cancel');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (confirmedOnce) return;
      confirmedOnce = true;
      var id = Router.current().params[0];
      Store.cancelBooking(id);
      U.toast('تم إلغاء الموعد', 'تقدر تحجز موعد جديد من الصفحة الرئيسية.');
      Router.go('home');
    });
  }

  return { render: render, init: init };
})();
