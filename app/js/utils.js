/* ============================================================
   utils.js — shared helpers. window.U
   ============================================================ */

window.U = (function () {
  'use strict';

  var DOW = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var MON = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // '2025-05-19' -> Date (local, no TZ shift)
  function parseDate(str) { return new Date(str + 'T00:00:00'); }

  function fmtDateLong(str) {
    var d = parseDate(str);
    return DOW[d.getDay()] + '، ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
  }

  function fmtDateShort(str) {
    var d = parseDate(str);
    return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()];
  }

  function dowName(str) { return DOW[parseDate(str).getDay()]; }
  function monthName(str) { return MON[parseDate(str).getMonth()]; }
  function dayNum(str) { return parseDate(str).getDate(); }

  // '14:30' -> '٢:٣٠ بعد الظهر' style but keep digits latin for clarity in demo? Use Arabic names.
  function fmtTime(t) {
    var parts = t.split(':');
    var h = parseInt(parts[0], 10), m = parts[1];
    var period = h < 12 ? 'صباحاً' : 'مسائاً';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + m + ' ' + period;
  }

  // '14:30' -> minutes since midnight
  function timeToMin(t) {
    var p = t.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function minToTime(m) {
    return DATA.pad2(Math.floor(m / 60)) + ':' + DATA.pad2(m % 60);
  }

  function addDays(dateStr, n) {
    var d = parseDate(dateStr);
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + DATA.pad2(d.getMonth() + 1) + '-' + DATA.pad2(d.getDate());
  }

  // Next N days starting today (strings YYYY-MM-DD)
  function nextDays(n) {
    var out = [], t = DATA.todayStr();
    for (var i = 0; i < n; i++) out.push(addDays(t, i));
    return out;
  }

  // First Arabic letter of a doctor's display name (skip "د.")
  function firstLetter(name) {
    var clean = name.replace(/^د\.\s*/, '').trim();
    var ch = clean.charAt(0);
    return /[؀-ۿ]/.test(ch) ? ch : '?';
  }

  // ---- Component builders (return HTML strings) ----

  function header(title, opts) {
    opts = opts || {};
    var back = opts.noBack ? '<div class="w-10"></div>'
      : '<button class="icon-btn" aria-label="رجوع" data-action="back"><span class="material-symbols-outlined">arrow_forward</span></button>';
    var right = opts.rightIcon
      ? '<span class="material-symbols-outlined text-text-muted" style="font-size:22px">' + esc(opts.rightIcon) + '</span>'
      : '<div class="w-10"></div>';
    return '' +
      '<header class="screen-header pt-safe">' +
        '<div class="screen-header__inner">' +
          back +
          '<h2 class="screen-header__title">' + esc(title) + '</h2>' +
          right +
        '</div>' +
      '</header>';
  }

  function avatar(doctor, cls) {
    var inner = doctor.avatar
      ? '<img src="' + esc(doctor.avatar) + '" alt="" onerror="this.parentNode.textContent=\'' + esc(firstLetter(doctor.name)) + '\'"/>'
      : esc(firstLetter(doctor.name));
    return '<div class="avatar ' + (cls || '') + '" aria-hidden="true">' + inner + '</div>';
  }

  function banner(icon, text) {
    return '<div class="banner" role="note"><span class="material-symbols-outlined">' + icon + '</span><p class="flex-1 m-0">' + text + '</p></div>';
  }

  function primaryBtn(label, attrs) {
    attrs = attrs || '';
    return '<button type="button" class="button button--primary" ' + attrs + '>' + label +
      '<span class="material-symbols-outlined" style="font-size:20px">arrow_back</span></button>';
  }

  // ---- Toast ----
  function toast(title, body, ms) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span class="material-symbols-outlined text-brand">event_upcoming</span>' +
      '<div class="flex-1"><div class="toast__title">' + esc(title) + '</div>' +
      (body ? '<div class="toast__body">' + esc(body) + '</div>' : '') + '</div>' +
      '<button class="icon-btn" style="width:32px;height:32px" aria-label="إغلاق"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>';
    el.querySelector('button').addEventListener('click', function () { el.remove(); });
    root.appendChild(el);
    setTimeout(function () { el.remove(); }, ms || 7000);
  }

  // ---- Datetime of booking -> Date object ----
  function bookingDateTime(dateStr, timeStr) {
    return new Date(dateStr + 'T' + timeStr + ':00');
  }

  return {
    esc: esc,
    parseDate: parseDate,
    fmtDateLong: fmtDateLong,
    fmtDateShort: fmtDateShort,
    dowName: dowName,
    monthName: monthName,
    dayNum: dayNum,
    fmtTime: fmtTime,
    timeToMin: timeToMin,
    minToTime: minToTime,
    addDays: addDays,
    nextDays: nextDays,
    firstLetter: firstLetter,
    header: header,
    avatar: avatar,
    banner: banner,
    primaryBtn: primaryBtn,
    toast: toast,
    bookingDateTime: bookingDateTime,
    DOW: DOW, MON: MON
  };
})();
