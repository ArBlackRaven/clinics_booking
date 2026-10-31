/* ============================================================
   staff-checkin.js — simulate QR scan + manual code entry.
   Route: #/checkin
   ============================================================ */

App.screens.checkin = (function () {
  'use strict';

  function render() {
    return '' +
      U.header('تسجيل وصول مريض', { rightIcon: 'qr_code_scanner' }) +
      '<main class="flex-1 px-4 pt-4 pb-safe">' +
        '<h1 class="text-xl font-bold mb-4">امسح كود QR أو اكتب الكود</h1>' +

        '<div class="camera-box mb-3" aria-hidden="true">' +
          '<div class="camera-box__frame"><div class="camera-box__scanline"></div></div>' +
        '</div>' +
        '<p class="text-center text-xs text-text-muted mb-4">وجّه الكاميرا على تذكرة المريض في شاشة التذكرة</p>' +

        '<button type="button" id="simulate" class="button button--primary mb-6">' +
          '<span class="material-symbols-outlined" style="font-size:20px">qr_code_2</span> محاكاة مسح</button>' +

        '<hr class="divider" />' +

        '<label class="label" for="code">أو أدخل كود الحجز يدوي (٦ أرقام)</label>' +
        '<div class="flex gap-2">' +
          '<input id="code" class="input" inputmode="numeric" maxlength="6" placeholder="123456" dir="ltr" />' +
          '<button type="button" id="lookup" class="button button--secondary shrink-0" style="width:auto;padding:0 20px">بحث</button>' +
        '</div>' +
        '<p id="err" class="field-error hidden"></p>' +

        '<div id="result" class="mt-5"></div>' +
      '</main>';
  }

  function showResult(b) {
    var doc = DATA.doctors.find(function (d) { return d.id === b.doctorId; });
    var clinic = DATA.clinics.find(function (c) { return c.id === b.clinicId; });
    var res = document.getElementById('result');
    if (b.status === 'arrived') {
      res.innerHTML = '<div class="banner" style="background:#FCF0DC;border-color:#EBD9B8;color:#92610E">' +
        '<span class="material-symbols-outlined" style="color:#92610E">hourglass_top</span>' +
        '<p class="flex-1 m-0">المريض مسجل وصوله بالفعل.</p></div>';
    } else if (b.status === 'done') {
      res.innerHTML = '<div class="banner"><span class="material-symbols-outlined">task_alt</span>' +
        '<p class="flex-1 m-0">تم الكشف خلاص للموعد ده.</p></div>';
    } else {
      Store.updateBooking(b.id, { status: 'arrived' });
      res.innerHTML = '' +
        '<div class="card" style="border-color:#BBE3CA">' +
          '<div class="flex items-center gap-2 mb-2" style="color:var(--success)">' +
            '<span class="material-symbols-outlined">check_circle</span>' +
            '<b>تم تسجيل الوصول ✅</b>' +
          '</div>' +
          '<div class="text-[14px] font-bold">' + U.esc(b.patientName) + '</div>' +
          '<div class="text-[13px] text-text-muted">' + U.esc(clinic.name) + ' · ' + U.esc(doc.name) + '</div>' +
          '<div class="text-[13.5px] mt-1 font-semibold">' + U.esc(U.fmtDateShort(b.date)) + ' — ' + U.esc(U.fmtTime(b.time)) + '</div>' +
        '</div>' +
        '<button type="button" class="button button--ghost mt-2" data-goto="staff">الرجوع للجدول</button>';
      res.querySelector('[data-goto]').addEventListener('click', function () { Router.go('staff'); });
    }
  }

  function fail(msg) {
    var err = document.getElementById('err');
    err.textContent = msg;
    err.classList.remove('hidden');
    document.getElementById('result').innerHTML = '';
  }

  function init() {
    document.getElementById('simulate').addEventListener('click', function () {
      // pick the first "coming" booking today; otherwise create a demo one
      var today = DATA.todayStr();
      var cand = Store.getBookings().find(function (b) {
        return b.date === today && b.status === 'coming';
      });
      if (!cand) { fail('مافيش مواعيد قادمة النهاردة للمسح التجريبي.'); return; }
      document.getElementById('err').classList.add('hidden');
      showResult(Store.getBooking(cand.id));
    });

    document.getElementById('lookup').addEventListener('click', function () {
      var v = (document.getElementById('code').value || '').replace(/\D/g, '');
      if (v.length !== 6) { fail('الكود لازم يكون ٦ أرقام.'); return; }
      var b = Store.findByCode(v);
      if (!b) { fail('لا يوجد حجز صالح بهذا الكود.'); return; }
      document.getElementById('err').classList.add('hidden');
      showResult(b);
    });
  }

  return { render: render, init: init };
})();
