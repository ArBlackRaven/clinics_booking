/* ============================================================
   confirm.js — step 4: review + confirm -> creates booking
   Route: #/confirm
   ============================================================ */

App.screens.confirm = (function () {
  'use strict';

  function row(icon, label, value) {
    return '' +
      '<div class="flex items-start gap-3 py-2.5 border-b border-line last:border-0">' +
        '<span class="material-symbols-outlined text-brand shrink-0" style="font-size:20px">' + icon + '</span>' +
        '<div class="min-w-0">' +
          '<div class="text-xs text-text-muted">' + U.esc(label) + '</div>' +
          '<div class="font-bold text-[15.5px] leading-snug">' + value + '</div>' +
        '</div>' +
      '</div>';
  }

  function render() {
    var draft = Store.getDraft();
    var doc = DATA.doctors.find(function (d) { return d.id === draft.doctorId; });
    var clinic = doc && DATA.clinics.find(function (c) { return c.id === doc.clinicId; });
    if (!doc || !clinic || !draft.date || !draft.time) {
      return U.header('مراجعة الحجز') + '<main class="p-5">لا يوجد حجز قيد الإعداد.</main>';
    }
    var session = Store.getSession() || {};

    return '' +
      U.header('مراجعة وتأكيد الموعد', { rightIcon: 'fact_check' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<div class="text-xs font-semibold text-brand mb-1">الخطوة ٤ من ٤ · تفاصيل الحجز</div>' +
        '<h1 class="text-2xl font-bold mb-4">راجع بيانات موعدك</h1>' +

        '<div class="card mb-4">' +
          row('local_hospital', 'العيادة', U.esc(clinic.name) + '<div class="text-xs font-normal text-text-muted mt-0.5">' + U.esc(clinic.address) + '</div>') +
          row('badge', 'الطبيب', U.avatar(doc, 'avatar--sm inline-block align-middle ml-2') + ' ' + U.esc(doc.name) +
              '<div class="text-xs font-normal text-text-muted">' + U.esc(doc.specialty) + '</div>') +
          row('calendar_today', 'الموعد', U.esc(U.fmtDateLong(draft.date)) + ' — الساعة ' + U.esc(U.fmtTime(draft.time))) +
          row('payments', 'قيمة الكشف', '<span class="text-brand">' + doc.fee + ' ج.م</span> <span class="text-xs font-normal text-text-muted">(كاش في العيادة)</span>') +
          row('phone', 'رقم المتابعة', '<span dir="ltr">' + U.esc(session.phone || '') + '</span>') +
        '</div>' +

        U.banner('info', 'يرجى الحضور قبل الموعد بـ ١٥ دقيقة مع بطاقة الرقم القومي. الدفع كاش في العيادة عند الاستقبال.') +

        '<label class="flex items-start gap-3 mt-4 cursor-pointer">' +
          '<input type="checkbox" id="agree" class="mt-1.5 w-5 h-5 accent-[#0F6E8C]" />' +
          '<span class="text-[13.5px] text-text-muted leading-relaxed">أوافق على إلغاء الحجز مجاناً قبل الموعد بـ ساعتين على الأقل.</span>' +
        '</label>' +
      '</main>' +
      '<div class="action-bar flex flex-col gap-2">' +
        U.primaryBtn('تأكيد حجز الموعد', 'id="confirm-btn" disabled') +
        '<button type="button" id="cancel-back" class="button button--ghost">إلغاء والرجوع</button>' +
      '</div>';
  }

  function init() {
    var agree = document.getElementById('agree');
    var btn = document.getElementById('confirm-btn');
    agree.addEventListener('change', function () { btn.disabled = !agree.checked; });

    document.getElementById('cancel-back').addEventListener('click', function () { Router.back(); });

    btn.addEventListener('click', function () {
      var draft = Store.getDraft();
      var doc = DATA.doctors.find(function (d) { return d.id === draft.doctorId; });
      var session = Store.getSession() || {};
      // re-check slot still free (someone may have booked meanwhile in staff mode)
      var slots = Store.getSlots(doc.id, draft.date);
      var s = slots.find(function (x) { return x.time === draft.time; });
      if (!s || !s.available) {
        U.toast('الموعد اتحجز', 'المكان ده اتحجز بالفعل، اختار وقت تاني.');
        Router.go('datetime');
        return;
      }
      var b = Store.addBooking({
        clinicId: doc.clinicId,
        doctorId: doc.id,
        date: draft.date,
        time: draft.time,
        patientName: session.name || 'مريض (' + (session.phone || '') + ')',
        phone: session.phone,
        source: 'patient',
        status: 'coming'
      });
      Store.clearDraft();
      Router.go('ticket', [b.id]);
    });
  }

  return { render: render, init: init };
})();
