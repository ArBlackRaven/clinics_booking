/* ============================================================
   ticket.js — booking ticket with QR + manual code
   Route: #/ticket/<bookingId>
   ============================================================ */

App.screens.ticket = (function () {
  'use strict';

  function infoRow(label, value) {
    return '<div class="flex justify-between gap-3 py-2 border-b border-line last:border-0 text-[14px]">' +
      '<span class="text-text-muted shrink-0">' + U.esc(label) + '</span>' +
      '<span class="font-bold text-left">' + value + '</span></div>';
  }

  function render(params) {
    var b = Store.getBooking(params[0]);
    if (!b) return U.header('التذكرة') + '<main class="p-5">الموعد غير موجود.</main>';
    var doc = DATA.doctors.find(function (d) { return d.id === b.doctorId; });
    var clinic = DATA.clinics.find(function (c) { return c.id === b.clinicId; });
    var room = clinic.roomPrefix + (doc ? ' ' + String(doc.id).slice(-1) : '');

    return '' +
      U.header('تذكرة الموعد', { rightIcon: 'confirmation_number' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<div class="banner mb-4" style="background:#DCF2E4;border-color:#BBE3CA;color:var(--success)">' +
          '<span class="material-symbols-outlined" style="color:var(--success)">check_circle</span>' +
          '<p class="flex-1 m-0 font-semibold">تم تأكيد الحجز بنجاح ✅</p>' +
        '</div>' +

        '<div class="ticket mb-4">' +
          '<div class="ticket__head">' +
            '<div class="text-xs opacity-80 mb-1">' + U.esc(clinic.name) + '</div>' +
            '<div class="text-xl font-bold">' + U.esc(U.fmtDateShort(b.date)) + '</div>' +
            '<div class="text-lg font-bold">' + U.esc(U.fmtTime(b.time)) + '</div>' +
          '</div>' +
          '<hr class="ticket__perf" />' +
          '<div class="ticket__body">' +
            '<div class="ticket__qr"><div id="qr-box" aria-label="كود QR للموعد"></div></div>' +
            '<hr class="ticket__perf" />' +
            '<div class="pt-3">' +
              '<div class="text-xs text-text-muted text-center mb-1">كود الحجز (للاستخدام اليدوي في الاستقبال)</div>' +
              '<div class="ticket__code" dir="ltr">' + U.esc(b.code) + '</div>' +
            '</div>' +
            '<hr class="ticket__perf" />' +
            '<div class="pt-3">' +
              infoRow('الطبيب', U.esc(doc.name)) +
              infoRow('التخصص', U.esc(doc.specialty)) +
              infoRow('العنوان', U.esc(clinic.address)) +
              infoRow('رقم العيادة', U.esc(room)) +
              infoRow('قيمة الكشف', '<span class="text-brand">' + doc.fee + ' ج.م · كاش بالعيادة</span>') +
              infoRow('اسم المريض', U.esc(b.patientName)) +
            '</div>' +
          '</div>' +
        '</div>' +

        U.banner('event_busy', 'لو مش هتقدر تحضر، من فضلك ألغي الموعد قبله بساعتين على الأقل.') +

        '<div class="mt-4 flex gap-3">' +
          '<button type="button" class="button button--secondary" data-goto="home">حجز تاني</button>' +
          '<button type="button" class="button button--destructive" data-goto="cancel/' + U.esc(b.id) + '">إلغاء الموعد</button>' +
        '</div>' +
      '</main>';
  }

  function init() {
    var b = Store.getBooking(Router.current().params[0]);
    if (b) {
      var box = document.getElementById('qr-box');
      try {
        new QRCode(box, {
          text: 'CLINIC-BOOKING|' + b.code + '|' + b.date + '|' + b.time,
          width: 160,
          height: 160,
          colorDark: '#1F2937',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (e) {
        box.innerHTML = '<div class="text-xs text-text-muted">تعذر توليد QR</div>';
      }
    }

    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function () {
        var parts = el.dataset.goto.split('/');
        Router.go(parts[0], parts.slice(1));
      });
    });
  }

  return { render: render, init: init };
})();
