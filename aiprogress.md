# AI Progress — Arabic Clinical Clinic Appointment Booker

> This file is a knowledge dump for the current project state, intended to be shared with other agents working on this codebase. No work has been started yet — this is purely an analysis of what exists.

---

## 1. Project Location

**Root workspace:** `/media/raven/HDD/CODING/actual projects/Clinics/`

**Project folder:** `/media/raven/HDD/CODING/actual projects/Clinics/the desgin/stitch_arabic_clinic_appointment_booker/`

---

## 2. Folder Structure

```
the desgin/
├── stitch_arabic_clinic_appointment_booker.zip   # source archive (503 KB, mirrors extracted content)
└── stitch_arabic_clinic_appointment_booker/      # extracted project
    ├── _1/                                       # Step 4: Booking Confirmation
    │   ├── code.html
    │   └── screen.png
    ├── _2/                                       # Step 2: Doctor Selection
    │   ├── code.html
    │   └── screen.png
    ├── _3/                                       # Step 1: Clinic Selection
    │   ├── code.html
    │   └── screen.png
    ├── _4/                                       # Step 3: Date & Time Selection
    │   ├── code.html
    │   └── screen.png
    ├── _5/                                       # Variant of Step 3 (Date & Time Selection)
    │   ├── code.html
    │   └── screen.png
    └── arabic_clinical_booking_system/
        └── DESIGN.md                             # design system specification
```

Each `_N/` folder contains a single self-contained `code.html` (Tailwind via CDN + inline styles + vanilla JS) and a `screen.png` preview.

---

## 3. What the Project Is

An **Arabic-language (RTL-first) mobile web app shell** for booking clinic appointments. It is a **frontend-only design prototype** — no backend, no API, no build step, no framework. Each screen is a standalone HTML file opened directly in a browser/mobile webview.

**Booking flow (4 steps):**
1. **Clinic selection** (`_3/`) — pick a medical clinic (e.g., Family Medicine, Ophthalmology, Dentistry).
2. **Doctor selection** (`_2/`) — pick a doctor from available clinicians with ratings, experience, specialty, and fee.
3. **Date & Time selection** (`_4/` or `_5/`) — pick appointment date and time slot.
4. **Booking confirmation** (`_1/`) — review details and confirm; shows a success dialog.

---

## 4. Tech Stack (per `code.html`)

| Layer | Technology | Notes |
|---|---|---|
| Markup | HTML5 | `dir="rtl" lang="ar"`, `<meta name="shell-type" content="mobile_stack">` |
| Styling | Tailwind CSS (CDN) | `https://cdn.tailwindcss.com`, custom theme via `tailwind.config` inline script |
| Icons | Material Symbols Outlined (Google Fonts) | Two weight/variation loads |
| Fonts | Noto Sans / Noto Sans Arabic (Google Fonts) | Weights 400, 500, 600, 700 |
| Interactivity | Vanilla JavaScript (IIFE in `<script>`) | Radio/card selection, tab toggling, dialog open/close, `history.back()` |
| Mobile shell | Safe-area env vars, no overscroll, hidden scrollbar | `pb-safe`/`pt-safe` using `env(safe-area-inset-*)` |

**Tailwind theme** (defined inline in `_1/_2/_3/_4`):
- Colors: `surface` (#f8f9ff), `primary` (#00556d), `primary-container` (#0f6e8c), `on-surface` (#121c2a), `on-surface-variant` (#3f484d), `secondary` (#555f6d), `tertiary` (#025a2a), `error` (#ba1a1a), plus fixed/extended Material-style color tokens.
- Border radius: DEFAULT 0.25rem, lg 0.5rem, xl 0.75rem, full 9999px.
- Spacing: gutter 1rem, margin 1.25rem, space-xs..space-xl.
- Font sizes: label-sm 14px … headline-lg 24px.

**`_5/` variant theme** (simplified, closer to DESIGN.md):
- `brand` (#0F6E8C), `surface` (#FAF8F5), `card` (#FFFFFF), `border` (#E5E7EB), `text-main` (#1F2937), `text-muted` (#6B7280).
- Font: `Noto Sans Arabic`.
- Explicit `* { box-shadow: none !important; }` — strictly flat, no shadows.

---

## 5. Design System (from `DESIGN.md`)

File: `the desgin/stitch_arabic_clinic_appointment_booker/arabic_clinical_booking_system/DESIGN.md`

**Philosophy:** Flat Minimalism, institutional, high-trust medical UI. RTL-first. Cognitive singularity (one primary decision per screen). Zero ornamentation (no shadows, gradients, blurred backdrops, decorative illustrations).

**Key tokens (from DESIGN.md — note some differ from the inline Tailwind config):**
- Canvas background: warm ivory `#F8F6F0` (code uses `#f8f9ff` / `#FAF8F5`)
- Primary brand / action: deep clinical teal `#0F6E8C`
- Primary text: `#1F2937`; secondary text: `#4B5563` / `#6B7280`
- Borders: `#E5E7EB` 1px hairline
- Success: `#166534`; Error/Destructive: `#991B1B`
- Border radius: modest 8px (0.5rem); **no pill radii**, no sharp 0px corners
- Body: 18px regular, 30px line height (`body-lg`)
- Headline-lg: 24px bold, 36px line height
- Primary button: min 56px height, full width, solid teal, white text, 8px radius, exactly one per screen

**Components documented:** Buttons (primary/secondary/destructive/disabled), Cards & appointment summaries, Form inputs & date/time selectors, Checkboxes & radios, Lists.

**Arabic typography notes:** Generous line height (diacritic clearance), normal letter spacing (prevents cursive detachment), right-aligned text.

---

## 6. Screen-by-Screen Summary

### `_3/` — Clinic Selection (Step 1 of 4)
- Heading: "اختر العيادة المطلوبة" (Select the required clinic)
- Radio-group list of clinic cards (Family Medicine selected by default; Ophthalmology; Dentistry)
- Each card: title, description, selected-state indicator (radio dot)
- Bottom CTA: "متابعة لاختيار الطبيب" (Continue to select doctor)
- JS: `selectClinic(id)` toggles borders + radio indicators + `aria-checked`

### `_2/` — Doctor Selection (Step 2 of 4)
- Heading: "اختر الطبيب المعالج" (Select the treating physician)
- Toggle: "كشف حضوري بالمركز" (In-person) vs "استشارة عن بُعد" (Telehealth)
- Doctor cards list with: avatar initial, name, availability chip, specialty, experience years, fee (ر.س)
- Reassurance banner: doctors licensed by Saudi Commission for Health Specialties
- Bottom CTA: "متابعة لتحديد الموعد" (Continue to set appointment)
- JS: card click selects radio + updates border styles; tab switching

### `_4/` — Date & Time Selection (Step 3 of 4)
- Stepper: "الخطوة ٣ من ٤: تفاصيل الحجز" (Step 3 of 4: Booking details)
- Date grid (May 2025): Sun 18, Mon 19 (default), Tue 20
- Time grid (30-min slots): 09:30, 10:00 (default), 11:15, 04:30, 05:00, 06:15 PM
- Reassurance banner + summary box
- JS: `selectDate(el, dateStr)`, `selectTime(el, timeStr)` toggle selection states

### `_5/` — Date & Time Selection (Variant)
- Same purpose as `_4/` but uses the simplified DESIGN.md-aligned theme (`brand`, `surface`, `card`, `text-main`, etc.)
- Explicitly flat (`box-shadow: none`), different header (sticky, `z-40`), `Noto Sans Arabic` font
- More polished CSS layer (`@layer base`, custom scrollbar styling for timeline)

### `_1/` — Booking Confirmation (Step 4 of 4)
- Heading: "مراجعة وتأكيد الموعد" (Review and confirm appointment)
- Clinic: Family Medicine; Doctor: د. خالد بن عبد الله المنصور; Fee: 150 ر.س
- Date: الإثنين، 19 مايو 2025; Time: 10:00 صباحاً; Room: العيادة رقم 204
- Info banner: arrive 15 min early with national ID/iqama
- CTAs: "تأكيد حجز الموعد" (Confirm) → opens success dialog; "إلغاء والعودة" (Cancel & go back)
- Success dialog: "تم تأكيد الموعد بنجاح", button "عرض التذكرة الطبية" (View medical ticket)
- JS: dialog show/hide on confirm/close

---

## 7. Notable Observations / Inconsistencies (for future work)

1. **Theme drift between screens:** `_1`–`_4` use `#f8f9ff` / `#00556d` color tokens; `_5` uses `#FAF8F5` / `#0F6E8C` matching DESIGN.md. `_1`/`_2` load Noto Sans (not Arabic-specific); `_4`/`_5` load Noto Sans Arabic.
2. **Step numbering mismatch:** `_3` is step 1 (clinic), `_2` is step 2 (doctor), `_4`/`_5` are step 3 (date/time), `_1` is step 4 (confirmation). Folder order `_1.._5` does NOT match flow order.
3. **No build tooling:** Pure CDN Tailwind; changes require editing HTML directly or adding a build step.
4. **No backend/API:** All data is hardcoded in HTML (doctor names, fees, dates, times).
5. **Accessibility:** Uses `role="radiogroup"`, `aria-checked`, `aria-label`, `tabindex="0"` in places; inconsistent across screens.
6. **RTL details:** `arrow_forward` icon is used for back buttons (RTL-appropriate direction), `rotate-180` applied to forward arrow on primary CTA in `_2`.
7. **Images:** `screen.png` in each folder are preview renders; not source assets.

---

## 8. Recommended Next Steps (when ready to implement)

- Consolidate the 5 HTML screens into a single app or a proper multi-page structure with \\shared CSS/JS.
- Align the Tailwind theme with DESIGN.md (pick one color system; currently two variants exist).
- Add Arabic-specific font (`Noto Sans Arabic`) consistently across all screens.
- Connect hardcoded data to a backend/API for real doctors, clinics, slots, and booking.
- Add form validation and booking submission handling.
- Standardize accessibility attributes across all screens.

---

**Status:** Analysis complete. No code changes made yet. `aiprogress.md` created at `/media/raven/HDD/CODING/actual projects/Clinics/aiprogress.md`.