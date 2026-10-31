/* ============================================================
   app.js — boot: guard routes, reminder toast on open, demo btn
   ============================================================ */

(function () {
  'use strict';

  var PATIENT_ROUTES = ['home', 'doctor', 'datetime', 'confirm', 'ticket', 'bookings', 'cancel'];
  var STAFF_ROUTES = ['staff', 'checkin', 'staff-book'];

  function needsLogin(name) {
    return PATIENT_ROUTES.indexOf(name) !== -1 || STAFF_ROUTES.indexOf(name) !== -1;
  }

  function boot() {
    Store.getBookings(); // triggers seeding once

    var route = Router.current();
    var session = Store.getSession();

    if (!route.name) {
      Router.go(session ? (session.role === 'staff' ? 'staff' : 'home') : 'login');
    } else if (needsLogin(route.name) && !session) {
      Router.go('login');
    } else {
      Router.render();
    }

    maybeReminderToast();
  }

  // ---- Reminder: booking within the next hour when app opens ----
  function maybeReminderToast(force) {
    var session = Store.getSession();
    if (!session || session.role !== 'patient') return;
    var next = Store.nextPatientBooking(session.phone);
    if (!next) return;
    var when = U.bookingDateTime(next.date, next.time);
    var diffMin = (when - new Date()) / 60000;
    if (force || (diffMin > 0 && diffMin <= 60)) {
      var doc = DATA.doctors.find(function (d) { return d.id === next.doctorId; });
      var clinic = DATA.clinics.find(function (c) { return c.id === next.clinicId; });
      U.toast(
        'تذكير بالموعد القادم',
        clinic.name + ' مع ' + doc.name + ' اليوم الساعة ' + U.fmtTime(next.time) +
        ' — لا تنس الحضور قبل الموعد بـ ١٥ دقيقة والدفع كاش في العيادة.',
        9000
      );
    }
  }

  document.getElementById('demo-reminder-btn').addEventListener('click', function () {
    var session = Store.getSession();
    if (!session || session.role !== 'patient') {
      U.toast('تنبيه تجريبي', 'سجّل دخول كمريض أولاً لتجربة التذكير.');
      return;
    }
    var next = Store.nextPatientBooking(session.phone);
    if (!next) { U.toast('تنبيه تجريبي', 'لا يوجد موعد قادم مسجّل لهذا الرقم.'); return; }
    maybeReminderToast(true);
  });

  window.AppBoot = { maybeReminderToast: maybeReminderToast };
  document.addEventListener('DOMContentLoaded', boot);
})();
