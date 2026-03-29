# i18n Implementation Checklist

## Phase 1 — Setup

- [x] Run `npm install vue-i18n@9` in `frontend/`
- [x] Create `frontend/src/i18n/index.ts` — `createI18n` instance reading saved locale from `localStorage`, registering `en`, `fr`, `cs` message sets
- [x] Create `frontend/src/i18n/locales/en.json` — English strings across all namespaces (`topbar`, `auth`, `nav`, `dashboard`, `classes`, `attendance`, `history`, `reports`, `studentRecord`, `common`)
- [x] Create `frontend/src/i18n/locales/fr.json` — French translations mirroring every key in `en.json`
- [x] Create `frontend/src/i18n/locales/cs.json` — Czech translations mirroring every key in `en.json`
- [x] Register the `i18n` plugin in `frontend/src/main.ts`

---

## Phase 2 — Locale Store

- [ ] Create `frontend/src/stores/locale.ts` — Pinia store exposing `current` (bound to `i18n.global.locale`), `setLocale()` (updates the ref and writes to `localStorage`), and `SUPPORTED_LOCALES`

---

## Phase 3 — TopBar Language Switcher

- [ ] Import and use `useLocaleStore` and `useI18n` in `TopBar.vue`
- [ ] Add a language section to the dropdown (above the logout button) with a button per supported locale
- [ ] Apply `.active` class to the button matching the current locale
- [ ] Add a `<hr class="dropdown-divider" />` between the language section and the logout button
- [ ] Add scoped styles for `.dropdown-section-label`, `.dropdown-button.active`, and `.dropdown-divider`
- [ ] Translate the "Language" section heading via `t('topbar.language')`
- [ ] Translate the "Logout" button label via `t('topbar.logout')`
- [ ] Convert the hardcoded `routeLabels` map in `TopBar.vue` to a `computed` that returns `t('nav.*')` values so breadcrumbs react to locale changes

---

## Phase 4 — Translation Keys

_(Covered by the locale file creation in Phase 1 — this phase is complete once all three JSON files are fully populated with keys for every view and component.)_

---

## Phase 5 — Replace Hardcoded Strings

- [ ] `LoginView.vue` — replace all inline text with `t('auth.login.*')`
- [ ] `RegisterView.vue` — replace all inline text with `t('auth.register.*')`
- [ ] `DashboardView.vue` — replace all inline text with `t('dashboard.*')`
- [ ] `ClassManagementView.vue` — replace all inline text with `t('classes.*')`
- [ ] `TakeAttendanceView.vue` — replace all inline text with `t('attendance.*')`
- [ ] `AttendanceHistoryView.vue` — replace all inline text with `t('history.*')`
- [ ] `ReportsView.vue` — replace all inline text with `t('reports.*')`
- [ ] `StudentRecordView.vue` — replace all inline text with `t('studentRecord.*')`
- [ ] `NotFoundView.vue` — replace all inline text with `t('common.notFound')`
- [ ] `AttendanceRoster.vue` — replace all inline text with appropriate `t()` keys
- [ ] `AttendanceStatusBadge.vue` — replace all inline text with appropriate `t()` keys
- [ ] `ClassSelector.vue` — replace all inline text with appropriate `t()` keys
- [ ] `DateRangePicker.vue` — replace all inline text with appropriate `t()` keys
- [ ] `StatCard.vue` — replace all inline text with appropriate `t()` keys

---

## Phase 6 — Pre-commit Locale Key Check

- [ ] Create `scripts/check-locales.py` — Python script that flattens all locale JSON files to dotted key sets and exits non-zero if any file differs from `en.json`
- [ ] Make `scripts/check-locales.py` executable (`chmod +x`)
- [ ] Add `check-locales` hook to the `repo: local` block in `.pre-commit-config.yaml` with `files: ^frontend/src/i18n/locales/`

---

## Phase 7 — Tests

- [ ] Add `i18n` plugin (real `createI18n` with English locale) to the `global.plugins` array in the `mountTopBar` helper in `TopBar.spec.ts`
- [ ] Add `TopBar — language switcher` describe block with tests:
  - [ ] Renders one button per supported locale
  - [ ] Clicking a locale button calls `localeStore.setLocale` with the correct code
  - [ ] The active locale's button has the `.active` class
- [ ] Add `i18n` plugin to `global.plugins` in each view spec's mount helper

---

## Phase 8 — Migrate `check-requirements.sh` to Python

- [ ] Create `scripts/check-requirements.py` — Python equivalent of `check-requirements.sh` (venv existence check, `pip freeze` comparison against `requirements.txt`)
- [ ] Make `scripts/check-requirements.py` executable (`chmod +x`)
- [ ] Update the `check-requirements` hook entry in `.pre-commit-config.yaml` to point at `scripts/check-requirements.py`
- [ ] Delete `scripts/check-requirements.sh`
