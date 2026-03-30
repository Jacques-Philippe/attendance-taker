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

- [x] Create `frontend/src/stores/locale.ts` — Pinia store exposing `current` (bound to `i18n.global.locale`), `setLocale()` (updates the ref and writes to `localStorage`), and `SUPPORTED_LOCALES`

---

## Phase 3 — TopBar Language Switcher

- [x] Import and use `useLocaleStore` and `useI18n` in `TopBar.vue`
- [x] Add a language section to the dropdown (above the logout button) with a button per supported locale
- [x] Apply `.active` class to the button matching the current locale
- [x] Add a `<hr class="dropdown-divider" />` between the language section and the logout button
- [x] Add scoped styles for `.dropdown-section-label`, `.dropdown-button.active`, and `.dropdown-divider`
- [x] Translate the "Language" section heading via `t('topbar.language')`
- [x] Translate the "Logout" button label via `t('topbar.logout')`
- [x] Convert the hardcoded `routeLabels` map in `TopBar.vue` to a `computed` that returns `t('nav.*')` values so breadcrumbs react to locale changes

---

## Phase 4 — Translation Keys

_(Covered by the locale file creation in Phase 1 — this phase is complete once all three JSON files are fully populated with keys for every view and component.)_

---

## Phase 5 — Replace Hardcoded Strings

- [x] `LoginView.vue` — replace all inline text with `t('auth.login.*')`
- [x] `RegisterView.vue` — replace all inline text with `t('auth.register.*')`
- [x] `DashboardView.vue` — replace all inline text with `t('dashboard.*')`
- [x] `ClassManagementView.vue` — replace all inline text with `t('classes.*')`
- [x] `TakeAttendanceView.vue` — replace all inline text with `t('attendance.*')`
- [x] `AttendanceHistoryView.vue` — replace all inline text with `t('history.*')`
- [x] `ReportsView.vue` — replace all inline text with `t('reports.*')`
- [x] `StudentRecordView.vue` — replace all inline text with `t('studentRecord.*')`
- [x] `NotFoundView.vue` — replace all inline text with `t('common.notFound')`
- [x] `AttendanceRoster.vue` — replace all inline text with appropriate `t()` keys
- [x] `AttendanceStatusBadge.vue` — replace all inline text with appropriate `t()` keys
- [x] `ClassSelector.vue` — replace all inline text with appropriate `t()` keys
- [x] `DateRangePicker.vue` — replace all inline text with appropriate `t()` keys
- [x] `StatCard.vue` — replace all inline text with appropriate `t()` keys

## Phase 5.25 - Small issues with navigation

- [x] Fix issue where authenticated user is still able to navigate to /login and /register views

## Phase 5.5 — Language Selection Modal

- [x] Create `frontend/src/components/LocaleModal.vue` — modal overlay with a button per supported locale, closes on selection or backdrop click, traps focus, emits `close` event
- [x] Add scoped styles to `LocaleModal.vue`: backdrop overlay, centered modal card, locale buttons with `.active` state matching current locale
- [x] Add `topbar.changeLanguage` key to all three locale JSON files (the label for the dropdown trigger item)
- [x] In `TopBar.vue`, replace the inline language section in the dropdown with a single "Change language" button that sets a `showLocaleModal` ref to `true`
- [x] Import and render `<LocaleModal>` in `TopBar.vue`, bound to `showLocaleModal`, wiring its `close` event to set the ref back to `false`
- [x] Move the `selectLocale()` handler from `TopBar.vue` into `LocaleModal.vue` (or keep it in the store — locale setting stays in `useLocaleStore`)
- [x] Remove the now-unused `.dropdown-section`, `.dropdown-section-label` styles from `TopBar.vue`

## Phase 5.75 - Make route paths variables

- [x] At the moment the route paths are all hardcoded, meaning they need to be changed everywhere when they change

---

## Phase 6 — Pre-commit Locale Key Check

- [x] Create `scripts/check-locales.py` — Python script that flattens all locale JSON files to dotted key sets and exits non-zero if any file differs from `en.json`
- [x] Make `scripts/check-locales.py` executable (`chmod +x`)
- [x] Add `check-locales` hook to the `repo: local` block in `.pre-commit-config.yaml` with `files: ^frontend/src/i18n/locales/`

---

## Phase 7 — Tests

- [x] Add `i18n` plugin (real `createI18n` with English locale) to the `global.plugins` array in the `mountTopBar` helper in `TopBar.spec.ts`
- [x] Add `TopBar — language switcher` describe block with one test: clicking the "Change language" dropdown button shows `LocaleModal`
- [ ] Create `tests/unit/components/LocaleModal.spec.ts` with tests:
  - [ ] Renders one `.locale-button` per supported locale
  - [ ] Clicking a locale button calls `localeStore.setLocale` with the correct code
  - [ ] Clicking a locale button emits `close`
  - [ ] The active locale's button has the `.active` class
  - [ ] Clicking the `.close-button` emits `close`
  - [ ] Clicking the backdrop emits `close`
  - [ ] Pressing Escape emits `close`
- [ ] Add `i18n` plugin to `global.plugins` in each view spec's mount helper

---

## Phase 8 — Migrate `check-requirements.sh` to Python

- [ ] Create `scripts/check-requirements.py` — Python equivalent of `check-requirements.sh` (venv existence check, `pip freeze` comparison against `requirements.txt`)
- [ ] Make `scripts/check-requirements.py` executable (`chmod +x`)
- [ ] Update the `check-requirements` hook entry in `.pre-commit-config.yaml` to point at `scripts/check-requirements.py`
- [ ] Delete `scripts/check-requirements.sh`
