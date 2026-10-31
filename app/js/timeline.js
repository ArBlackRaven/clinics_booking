/* ============================================================
   timeline.js — the video-editor-style time picker.

   Timeline.create(containerEl, opts) -> instance
     opts: {
       doctorId, date (YYYY-MM-DD),
       selected (time 'HH:MM' or null — nothing by default),
       onChange(timeOrNull)
     }

   Renders: readout + ruler with hour marks / half-hour ticks,
   available slots as solid teal blocks at their exact positions,
   booked slots as light gray blocks, and a fixed thin teal
   playhead line in the center of the viewport.

   Interactions: touch scroll, mouse drag, wheel (horizontal),
   tap a block, snap to nearest available slot when scrolling
   stops under the playhead. Slots refresh automatically after
   each selection change so new bookings appear instantly.
   ============================================================ */

window.Timeline = (function () {
  'use strict';

  var PX_PER_MIN = 2.4;          // zoom level of the ruler
  var SNAP_DEBOUNCE = 140;       // ms after scroll stops before snapping
  var PAD_MIN = 30;              // half-hour padding on both ends

  function create(container, opts) {
    var doctorId = opts.doctorId;
    var dateStr = opts.date;
    var selected = opts.selected || null;   // null => nothing selected
    var onChange = opts.onChange || function () {};

    var doc = DATA.doctors.find(function (d) { return d.id === doctorId; });
    var clinic = DATA.clinics.find(function (c) { return c.id === doc.clinicId; });
    var startMin = clinic.openHour * 60;
    var endMin = clinic.closeHour * 60;
    var totalMin = endMin - startMin;

    var slots = Store.getSlots(doctorId, dateStr);
    var contentW = (totalMin + PAD_MIN * 2) * PX_PER_MIN;

    // ---------- static DOM skeleton ----------
    container.innerHTML = '';
    var tl = document.createElement('div');
    tl.className = 'timeline';

    var readout = document.createElement('div');
    readout.className = 'mb-4 min-h-[86px]';
    tl.appendChild(readout);

    var viewport = document.createElement('div');
    viewport.className = 'timeline__viewport timeline-scroll';
    var ruler = document.createElement('div');
    ruler.className = 'timeline__ruler';
    ruler.style.width = contentW + 'px';
    ruler.setAttribute('role', 'listbox');
    ruler.setAttribute('aria-label', 'الشريط الزمني للمواعيد المتاحة');
    viewport.appendChild(ruler);

    var playhead = document.createElement('div');
    playhead.className = 'timeline__playhead';
    viewport.appendChild(playhead); // stays fixed at viewport center

    tl.appendChild(viewport);
    container.appendChild(tl);

    // ---------- geometry ----------
    function xToTime(x) { return startMin + x / PX_PER_MIN - PAD_MIN; }     // content px -> minutes of day
    function timeToX(t) { return (U.timeToMin(t) - startMin + PAD_MIN) * PX_PER_MIN; }
    function halfW() { return viewport.clientWidth / 2; }

    // ---------- ruler painting ----------
    function paintRuler() {
      ruler.innerHTML = '';

      // hour marks + half-hour ticks
      for (var m = 0; m <= totalMin + PAD_MIN * 2; m += 30) {
        var absMin = startMin - PAD_MIN + m;
        var isHour = (absMin % 60 === 0);
        var tick = document.createElement('div');
        tick.className = 'timeline__tick ' + (isHour ? 'timeline__tick--hour' : 'timeline__tick--half');
        tick.style.left = (m * PX_PER_MIN) + 'px';
        ruler.appendChild(tick);
        if (isHour) {
          var lbl = document.createElement('span');
          lbl.className = 'timeline__hourlabel';
          lbl.style.left = (m * PX_PER_MIN) + 'px';
          var h = Math.floor(absMin / 60);
          lbl.textContent = ((h % 12) || 12) + (h < 12 ? ' ص' : ' م');
          ruler.appendChild(lbl);
        }
      }

      // slot blocks at their exact positions
      slots.forEach(function (s) {
        var blk = document.createElement('button');
        blk.type = 'button';
        blk.dataset.time = s.time;
        blk.className = 'slot-block ' + (s.available ? 'slot-block--available' : 'slot-block--booked');
        blk.style.left = (timeToX(s.time) + 2) + 'px';
        blk.style.width = Math.max(30 * PX_PER_MIN - 4, 26) + 'px';
        blk.setAttribute('aria-label', U.fmtTime(s.time) + (s.available ? ' — متاح' : ' — محجوز'));
        blk.setAttribute('aria-disabled', s.available ? 'false' : 'true');
        if (!s.available) blk.tabIndex = -1;
        blk.addEventListener('click', function () {
          if (!s.available) return;
          setSelected(s.time, true);
        });
        ruler.appendChild(blk);
      });

      // "now" marker when showing today
      if (dateStr === DATA.todayStr()) {
        var now = new Date();
        var nowMin = now.getHours() * 60 + now.getMinutes();
        if (nowMin >= startMin - PAD_MIN && nowMin <= endMin + PAD_MIN) {
          var nm = document.createElement('div');
          nm.className = 'timeline__now';
          nm.style.left = ((nowMin - startMin + PAD_MIN) * PX_PER_MIN) + 'px';
          ruler.appendChild(nm);
        }
      }

      paintBlocks();
    }

    function paintBlocks() {
      var blocks = ruler.querySelectorAll('.slot-block');
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].classList.toggle('slot-block--selected', blocks[i].dataset.time === selected);
      }
    }

    // ---------- readout ----------
    function renderReadout() {
      if (selected) {
        readout.innerHTML =
          '<div class="timeline__readout-date">' + U.esc(U.fmtDateShort(dateStr)) + '</div>' +
          '<div class="timeline__readout-time">' + U.esc(U.fmtTime(selected)) + '</div>';
      } else {
        readout.innerHTML =
          '<div class="timeline__readout-date">' + U.esc(U.fmtDateShort(dateStr)) + '</div>' +
          '<div class="timeline__readout-empty">اسحب الشريط أو اختر وقتاً من البلوكات المتاحة</div>';
      }
    }

    // ---------- selection ----------
    function setSelected(t, scrollToIt) {
      selected = t;
      renderReadout();
      paintBlocks();
      onChange(selected);
      if (t && scrollToIt) scrollToTime(t);
    }

    function scrollToTime(t) {
      viewport.scrollTo({ left: timeToX(t) - halfW(), behavior: 'smooth' });
    }

    // nearest AVAILABLE slot to a given content-x position
    function nearestAvailableAt(x) {
      var mins = xToTime(x);
      var best = null, bestDist = Infinity;
      slots.forEach(function (s) {
        if (!s.available) return;
        var dist = Math.abs(U.timeToMin(s.time) - mins);
        if (dist < bestDist) { bestDist = dist; best = s.time; }
      });
      return best;
    }

    // ---------- snap when scrolling stops ----------
    var suppressSnap = false;
    var snapTimer = null;
    function scheduleSnap() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapNow, SNAP_DEBOUNCE);
    }
    function snapNow() {
      var centerContentX = viewport.scrollLeft + halfW();
      var t = nearestAvailableAt(centerContentX);
      if (!t) return;
      // snap only when the playhead is close to an available block (<= ~25 min)
      var dist = Math.abs(U.timeToMin(t) - xToTime(centerContentX));
      if (dist <= 25) {
        setSelected(t, false);
        var target = timeToX(t) - halfW();
        if (Math.abs(viewport.scrollLeft - target) > 2) {
          suppressSnap = true;
          viewport.scrollTo({ left: target, behavior: 'smooth' });
          setTimeout(function () { suppressSnap = false; }, 320);
        }
      }
    }
    viewport.addEventListener('scroll', function () {
      if (!suppressSnap) scheduleSnap();
    });

    // ---------- mouse drag (desktop) ----------
    var dragging = false, dragStartX = 0, dragStartScroll = 0;
    viewport.addEventListener('mousedown', function (e) {
      dragging = true;
      dragStartX = e.clientX;
      dragStartScroll = viewport.scrollLeft;
      viewport.classList.add('timeline__viewport--dragging');
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      viewport.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    window.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('timeline__viewport--dragging');
      snapNow();
    });

    // ---------- wheel (translate any axis to horizontal) ----------
    viewport.addEventListener('wheel', function (e) {
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      viewport.scrollLeft += delta;
      e.preventDefault();
      scheduleSnap();
    }, { passive: false });

    // ---------- public API ----------
    paintRuler();
    renderReadout();

    requestAnimationFrame(function () {
      if (selected) scrollToTime(selected);
      else viewport.scrollLeft = (contentW / 2) - halfW(); // mid-day under playhead
    });

    return {
      getSelected: function () { return selected; },
      setTime: function (t) { setSelected(t, true); },
      refresh: function () {
        slots = Store.getSlots(doctorId, dateStr);
        if (selected) {
          var cur = slots.find(function (s) { return s.time === selected; });
          if (cur && !cur.available) selected = null; // got booked meanwhile
        }
        paintRuler();
        renderReadout();
      },
      setDate: function (newDate) {
        dateStr = newDate;
        selected = null;
        slots = Store.getSlots(doctorId, dateStr);
        paintRuler();
        renderReadout();
        onChange(null);
        requestAnimationFrame(function () {
          viewport.scrollLeft = (contentW / 2) - halfW();
        });
      }
    };
  }

  return { create: create };
})();
