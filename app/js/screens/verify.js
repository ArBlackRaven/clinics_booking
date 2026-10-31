/* ============================================================
   verify.js — 4-digit OTP (accepts any 4 digits)
   Route: #/verify/<phone>
   ============================================================ */

App.screens.verify = (function () {
  'use strict';

  function render(params) {
    var phone = params[0] || '';
    var masked = phone ? (phone.slice(0, 3) + '••••' + phone.slice(7)) : '';
    return '' +
      U.header('التحقق من الرقم', { rightIcon: 'lock_clock' }) +
      '<main class="flex-1 px-5 pt-6 pb-safe flex flex-col">' +
        '<h1 class="text-2xl font-bold mb-1">كود التحقق</h1>' +
        '<p class="text-sm text-text-muted mb-8 leading-relaxed">' +
          'أدخلنا كود التحقق المرسل إلى <span dir="ltr" class="font-semibold">' + U.esc(masked) + '</span>' +
          '<br />في التجربة دي أي ٤ أرقام هتشتغل.' +
        '</p>' +

        '<div class="code-inputs mb-3" id="otp">' +
          [0, 1, 2, 3].map(function (i) {
            return '<input class="code-box" data-i="' + i + '" inputmode="numeric" maxlength="1" aria-label="الرقم ' + (i + 1) + '" />';
          }).join('') +
        '</div>' +
        '<p id="otp-error" class="field-error text-center hidden">من فضلك أدخل ٤ أرقام</p>' +

        '<div class="mt-8">' +
          U.primaryBtn('تحقق ومتابعة', 'id="verify-go" disabled') +
        '</div>' +
        '<button type="button" id="resend" class="button button--ghost mt-3">إعادة إرسال الكود</button>' +
      '</main>';
  }

  function init() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('#otp .code-box'));
    var btn = document.getElementById('verify-go');
    var err = document.getElementById('otp-error');

    function code() { return boxes.map(function (b) { return b.value; }).join(''); }
    function paint() {
      var ok = /^\d{4}$/.test(code());
      btn.disabled = !ok;
      if (ok) err.classList.add('hidden');
    }

    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () {
        b.value = (b.value || '').replace(/\D/g, '').slice(0, 1);
        if (b.value && i < 3) boxes[i + 1].focus();
        paint();
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus();
      });
    });

    btn.addEventListener('click', function () {
      if (!/^\d{4}$/.test(code())) { err.classList.remove('hidden'); return; }
      Router.go('home');
    });

    document.getElementById('resend').addEventListener('click', function () {
      U.toast('تم إرسال الكود', 'الكود التجريبي: أي ٤ أرقام.', 4000);
    });

    boxes[0].focus();
  }

  return { render: render, init: init };
})();
