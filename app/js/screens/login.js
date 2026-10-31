/* ============================================================
   login.js — phone number login + mode switch link
   Route: #/login
   ============================================================ */

App.screens.login = (function () {
  'use strict';

  function render() {
    return '' +
      '<main class="flex-1 px-5 pt-12 pb-safe flex flex-col">' +
        '<div class="text-center mb-8">' +
          '<div class="w-16 h-16 rounded-xl bg-brand-light text-brand mx-auto flex items-center justify-center mb-4">' +
            '<span class="material-symbols-outlined" style="font-size:34px">local_hospital</span>' +
          '</div>' +
          '<h1 class="text-2xl font-bold mb-1">مواعدي</h1>' +
          '<p class="text-sm text-text-muted">احجز كشفك في ثلاث عيادات متخصصة بسهولة</p>' +
        '</div>' +

        '<label class="label" for="phone">رقم الموبايل</label>' +
        '<input id="phone" class="input mb-2" type="tel" inputmode="numeric" maxlength="11" placeholder="٠١xxxxxxxxx" autocomplete="tel" />' +
        '<p id="phone-error" class="field-error hidden">من فضلك اكتب رقم موبايل مصري صحيح (١١ رقم يبدأ بـ ٠١)</p>' +

        '<div class="mt-6">' +
          U.primaryBtn('إرسال كود التحقق', 'id="login-next"') +
        '</div>' +

        '<hr class="divider" />' +
        '<div class="text-center">' +
          '<button type="button" id="to-staff" class="linklike">دخول موظف الاستقبال</button>' +
        '</div>' +
        '<p class="text-xs text-text-muted text-center mt-6 leading-relaxed">' +
          'الدفع كاش في العيادة عند الحضور — لا يوجد دفع إلكتروني.' +
        '</p>' +
      '</main>';
  }

  function init() {
    var phoneEl = document.getElementById('phone');
    var errEl = document.getElementById('phone-error');
    var btn = document.getElementById('login-next');

    function valid() {
      var v = (phoneEl.value || '').replace(/\D/g, '');
      return /^01[0125]\d{8}$/.test(v);
    }
    function paint() {
      errEl.classList.toggle('hidden', valid() || phoneEl.value === '');
      phoneEl.classList.toggle('input--error', !valid() && phoneEl.value !== '');
      btn.disabled = !valid();
    }
    phoneEl.addEventListener('input', paint);
    paint();

    btn.addEventListener('click', function () {
      if (!valid()) return;
      var v = phoneEl.value.replace(/\D/g, '');
      Store.setSession({ role: 'patient', phone: v, name: null });
      Router.go('verify', [v]);
    });

    document.getElementById('to-staff').addEventListener('click', function () {
      Store.setSession({ role: 'staff', phone: null, name: 'موظف الاستقبال' });
      Router.go('staff');
    });

    phoneEl.focus();
  }

  return { render: render, init: init };
})();
