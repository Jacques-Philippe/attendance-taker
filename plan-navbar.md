# Top Navigation Bar Implementation Plan

## Overview

Add a persistent top navigation bar across all authenticated pages that displays a user avatar with the first letter of the signed-in user's username, along with logout functionality.

## Current State Analysis

- **App Structure**: Currently uses `<RouterView />` in `App.vue` with no layout wrapper
- **Authenticated Routes**: dashboard, classes, attendance, history, reports, student-record
- **Public Routes**: login, register
- **Auth State**: User data available in `useAuthStore()` with `user.username`
- **Styling**: Using Vite with CSS (no CSS framework detected)

## Implementation Plan

### Phase 0: Establish Styling Guidelines

**File**: `frontend/src/styles/DESIGN_SYSTEM.md` (reference document, not code)

**Purpose**: Create a living style guide for consistent visual element creation across future features.

**Design System Specification**:

#### Color Palette

- **Primary**: `#646cff` (link/accent blue — from existing style.css)
- **Primary Hover**: `#535bf2` (darker blue)
- **Background Dark**: `#242424` (primary background)
- **Background Darker**: `#1a1a1a` (secondary/button background)
- **Text Primary**: `rgba(255, 255, 255, 0.87)` (high contrast white)
- **Text Secondary**: `rgba(255, 255, 255, 0.60)` (muted white)
- **Border**: `rgba(255, 255, 255, 0.2)` (subtle dividers)
- **Success**: `#4ade80` (green for success states)
- **Danger**: `#ef4444` (red for destructive actions)
- **Warning**: `#f59e0b` (amber for alerts)

#### Typography

- **Font Family**: `system-ui, Avenir, Helvetica, Arial, sans-serif`
- **Heading XL** (h1): `3.2em`, font-weight 600
- **Heading L** (h2): `2.4em`, font-weight 600
- **Heading M** (h3): `1.6em`, font-weight 600
- **Body Large**: `1em`, font-weight 400, line-height 1.5 (default)
- **Body Small**: `0.875em`, font-weight 400, line-height 1.5
- **Button**: `1em`, font-weight 500, inherit font-family

#### Spacing Scale (8px base unit)

- `xs`: 4px (0.5rem)
- `sm`: 8px (0.5em) — micro spacing
- `md`: 12px (0.75em) — padding/gaps
- `lg`: 16px (1em) — section spacing
- `xl`: 24px (1.5em) — large gaps
- `2xl`: 32px (2em) — major sections
- `3xl`: 48px (3em) — page-level spacing

#### Border Radius

- `sm`: 4px (subtle)
- `md`: 8px (default, buttons & cards)
- `lg`: 16px (larger components)
- `full`: 9999px (circles, badges, avatars)

#### Shadows

- `sm`: `0 1px 2px rgba(0, 0, 0, 0.5)`
- `md`: `0 4px 6px rgba(0, 0, 0, 0.7)`
- `lg`: `0 10px 15px rgba(0, 0, 0, 0.8)`

#### Transitions

- **Default Duration**: 250ms
- **Easing**: `ease-in-out`
- **Properties**: `color`, `border-color`, `background-color`, `box-shadow` (avoid `all`)
- **Animation**: `transition: <property> 250ms ease-in-out;`

#### Button Styles

- **Default Button**: `#1a1a1a` bg, 1px `#646cff` border, white text, `border-radius: 8px`, padding `0.6em 1.2em`
- **Hover**: `border-color: #535bf2`
- **Active**: Darken bg slightly, keep border color
- **Disabled**: `opacity: 0.5`, cursor `not-allowed`

#### Component Sizing

- **Navbar Height**: `60px`
- **Avatar Diameter**: `40px` (small), `48px` (medium)
- **Icon Size**: `16px` (small), `24px` (medium)
- **Input/Button Height**: `36px` (compact), `44px` (standard)

#### Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Approach**: Mobile-first, use `@media (min-width: ...)`

#### Accessibility Standards

- **Contrast Ratio**: Minimum WCAG AA (4.5:1 for text)
- **Focus States**: Visible outline (2px solid `#646cff`)
- **ARIA Labels**: Add to buttons, icons, and interactive elements
- **Keyboard Navigation**: All interactive elements must be tab-accessible

#### Implementation Guidelines

1. **Reference this guide** for all new visual components
2. **Use CSS custom properties** (variables) for colors/spacing when creating new components
3. **Test responsiveness** at breakpoints above
4. **Maintain consistency** with existing button and link styles
5. **Document deviations** if design system needs updates
6. **Priority**: Functionality first, then polish with this guide

**Final Step: Link to Claude.md**
Once DESIGN_SYSTEM.md is created, add a reference in [CLAUDE.md](./CLAUDE.md) under a "Frontend Styling" section so that Claude automatically references this guide for all future frontend styling decisions and visual element creation.

---

### Phase 1: Create TopBar Component

**File**: `frontend/src/components/TopBar.vue`

**Responsibilities**:

- Display a header/navbar container fixed at the top
- Show user avatar (circular button with first letter of username)
- Include logout button or integrate into dropdown menu
- Responsive design for mobile/tablet/desktop

**Features**:

- Round avatar button (circle CSS shape)
- Display first letter of username in uppercase (e.g., "J" for "jacques")
- Hover state for visual feedback
- Logout action that triggers `authStore.logout()`
- Optional: Add navigation breadcrumbs or page title
- Optional: Add dropdown menu on avatar click (could be expanded later)

**Styling**:

- Fixed positioning at top (z-index handling)
- Height: ~60px
- Avatar size: ~40-48px diameter
- Contrast colors for visibility
- Smooth transitions/hover effects

### Phase 2: Create AppLayout Component

**File**: `frontend/src/components/AppLayout.vue`

**Responsibilities**:

- Wrap authenticated page content
- Render TopBar component
- Handle main content area positioning (add top padding/margin to account for fixed navbar)
- Provide consistent layout across all authenticated pages

**Structure**:

```
<template>
  <TopBar />
  <main class="app-layout-content">
    <slot />
  </main>
</template>
```

### Phase 3: Refactor App.vue

**File**: `frontend/src/App.vue`

**Changes**:

- Detect if current route is authenticated or public
- Conditionally wrap `<RouterView />` with `<AppLayout />`
- Alternative approach: Move logic into router and render AppLayout from authenticated route wrapper

**Decision Point**:
Two approaches available:

- **Approach A**: Modify App.vue to conditionally render AppLayout based on route
- **Approach B**: Create a layout route wrapper (more modular, follows router structure) — Best practice for larger apps

**Recommended**: Approach A for simplicity, but keep code clean for future refactoring

### Phase 4: Update Global Styles

**File**: `frontend/src/style.css` (or create `frontend/src/styles/layout.css`)

**Changes**:

- Add padding/margin-top to body or main layout to account for fixed navbar
- Define avatar styling (circular shape, colors, typography)
- Add hover/active states for buttons
- Ensure responsive breakpoints for mobile devices
- Maintain dark/light theme consistency with existing CSS

### Phase 5: Testing

**Test Coverage**:

- TopBar displays correctly on all authenticated pages
- Avatar shows correct first letter for various usernames
- Logout button triggers authentication flow correctly
- No layout shift or content overlap issues
- Mobile responsiveness (test at common breakpoints)
- Avatar styling maintains circular shape across browsers

**Files to Create**:

- `frontend/tests/unit/components/TopBar.spec.ts` — Component tests

### Phase 6: Polish & Edge Cases

**Considerations**:

- Handle single-character usernames (should display that character)
- Handle long usernames (avatar only shows first letter, keep design clean)
- Accessibility: Add proper ARIA labels to avatar button and logout button
- Loading state: Ensure TopBar doesn't flash or cause layout jumps during auth restoration
- Optional: Add user menu dropdown (profile, settings, logout options)

## Files to Modify/Create

| File                                            | Action     | Reason                                        |
| ----------------------------------------------- | ---------- | --------------------------------------------- |
| `frontend/src/styles/DESIGN_SYSTEM.md`          | **Create** | Styling guidelines reference for future work  |
| `frontend/src/components/TopBar.vue`            | **Create** | New navbar component with avatar and logout   |
| `frontend/src/components/AppLayout.vue`         | **Create** | Layout wrapper for authenticated pages        |
| `frontend/src/App.vue`                          | **Modify** | Conditionally render AppLayout based on route |
| `frontend/src/style.css`                        | **Modify** | Add navbar and avatar styling                 |
| `frontend/tests/unit/components/TopBar.spec.ts` | **Create** | Unit tests for TopBar                         |

## Implementation Order

0. Create DESIGN_SYSTEM.md styling reference guide
1. Create TopBar.vue component with avatar and logout
2. Create AppLayout.vue wrapper component
3. Update App.vue to conditionally use AppLayout
4. Add CSS styling for navbar and avatar (reference DESIGN_SYSTEM.md)
5. Test on all authenticated pages
6. Refine styling and fix edge cases

## Design Decisions

- **Avatar**: Circular shape, 40-48px, first letter uppercase, centered
- **Navbar Height**: 60px fixed
- **Layout Approach**: Conditional rendering in App.vue (simple and maintainable)
- **Logout**: Integrated into navbar (click avatar or dedicated logout button)
- **z-index**: Ensure navbar stays above page content

## Future Enhancements

- User dropdown menu (profile, settings, password change)
- Navigation breadcrumbs
- Page title in navbar
- User role badge/indicator
- Notification bell
- Theme toggle (dark/light mode)
- Mobile hamburger menu for navigation

## Rollback Plan

If issues arise:

- Revert App.vue to original RouterView-only structure
- Remove TopBar and AppLayout components
- Remove navbar styling from global CSS
- All changes are additive and non-breaking to existing pages
