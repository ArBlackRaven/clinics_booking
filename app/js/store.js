/* ============================================================
   store.js — state: session + draft (sessionStorage, per tab),
   bookings list (shared between patient & staff views).
   Exposed as window.Store
   ============================================================ */

window.Store = (function () {
  'use strict';

  var KEYS = {
    bookings: 'clinics.bookings.v1',
    session: 'clinics.session.v1',
    draft: 'clinics.draft.v1',
    seeded: 'clinics.seeded.v1'
  };

  // Session & draft are per-tab (sessionStorage) so you can open the app
  // twice — patient in one tab, staff in another — and see bookings sync live.
  // Bookings stay in localStorage (shared across tabs).
  function read(key, fallback) {
    try {
      var raw = storageFor(key).getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    storageFor(key).setItem(key, JSON.stringify(val));
  }
  function removeKey(key) {
    storageFor(key).removeItem(key);
  }
  function storageFor(key) {
    if (key === KEYS.session || key === KEYS.draft) return sessionStorage;
    return localStorage;
  }

  // ---- Seed once so the staff schedule has content on first run ----
  function ensureSeed() {
    if (!read(KEYS.seeded, false)) {
      var seeds = DATA.buildSeeds();
      write(KEYS.bookings, seeds);
      write(KEYS.seeded, true);
    }
  }

  // ---- Bookings CRUD ----
  function getBookings() { ensureSeed(); return read(KEYS.bookings, []); }
  function saveBookings(list) { write(KEYS.bookings, list); }

  function addBooking(b) {
    var list = getBookings();
    b.id = b.id || ('bk-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    b.createdAt = Date.now();
    if (!b.code) b.code = DATA.genCode(b.id);
    if (!b.status) b.status = 'coming';
    list.push(b);
    saveBookings(list);
    return b;
  }

  function getBooking(id) {
    return getBookings().find(function (b) { return b.id === id; }) || null;
  }

  function updateBooking(id, patch) {
    var list = getBookings();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { Object.assign(list[i], patch); break; }
    }
    saveBookings(list);
  }

  function cancelBooking(id) { updateBooking(id, { status: 'cancelled' }); }

  // Bookings that are still active (not cancelled) for a doctor+date
  function activeTimes(doctorId, dateStr) {
    return getBookings()
      .filter(function (b) {
        return b.doctorId === doctorId && b.date === dateStr &&
               b.status !== 'cancelled';
      })
      .map(function (b) { return b.time; });
  }

  // Combined slot view: base availability + real bookings
  function getSlots(doctorId, dateStr) {
    var base = DATA.getBaseSlots(doctorId, dateStr);
    var taken = activeTimes(doctorId, dateStr);
    return base.map(function (s) {
      var booked = s.status === 'blocked' || taken.indexOf(s.time) !== -1;
      return { time: s.time, available: !booked };
    });
  }

  // Patient's own bookings (by phone), upcoming first
  function patientBookings(phone) {
    return getBookings()
      .filter(function (b) { return b.phone === phone && b.status !== 'cancelled'; })
      .sort(function (a, z) {
        return U.bookingDateTime(a.date, a.time) - U.bookingDateTime(z.date, z.time);
      });
  }

  function nextPatientBooking(phone) {
    var now = new Date();
    return patientBookings(phone).find(function (b) {
      return U.bookingDateTime(b.date, b.time) > now;
    }) || null;
  }

  // Staff: bookings for clinic + date sorted by time
  function clinicDayBookings(clinicId, dateStr) {
    return getBookings()
      .filter(function (b) {
        return b.clinicId === clinicId && b.date === dateStr && b.status !== 'cancelled';
      })
      .sort(function (a, z) { return U.timeToMin(a.time) - U.timeToMin(z.time); });
  }

  function findByCode(code) {
    code = String(code || '').trim();
    return getBookings().find(function (b) {
      return b.code === code && b.status !== 'cancelled';
    }) || null;
  }

  // ---- Session ----
  function getSession() { return read(KEYS.session, null); }
  function setSession(s) { write(KEYS.session, s); }
  function clearSession() { removeKey(KEYS.session); removeKey(KEYS.draft); }

  // ---- Draft (booking in progress) ----
  function getDraft() {
    return read(KEYS.draft, { clinicId: null, doctorId: null, date: null, time: null });
  }
  function setDraft(patch) {
    var d = getDraft();
    Object.assign(d, patch);
    write(KEYS.draft, d);
    return d;
  }
  function clearDraft() { write(KEYS.draft, { clinicId: null, doctorId: null, date: null, time: null }); }

  return {
    getBookings: getBookings,
    addBooking: addBooking,
    getBooking: getBooking,
    updateBooking: updateBooking,
    cancelBooking: cancelBooking,
    getSlots: getSlots,
    patientBookings: patientBookings,
    nextPatientBooking: nextPatientBooking,
    clinicDayBookings: clinicDayBookings,
    findByCode: findByCode,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    getDraft: getDraft,
    setDraft: setDraft,
    clearDraft: clearDraft
  };
})();
