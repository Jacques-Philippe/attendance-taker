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

- Round avatar button (circle CSS shape) that opens a dropdown menu
- Display first letter of username in uppercase (e.g., "J" for "jacques")
- Dropdown menu on avatar click containing:
  - Username display
  - Logout button
- Hover state for visual feedback on avatar button
- Logout action that triggers `authStore.logout()`
- Optional: Navigation breadcrumbs or page title for context

**Optional Feature: Navigation Breadcrumbs**

Location: In the navbar, next to or below the avatar area
Purpose: Help users understand their location in the app hierarchy and allow quick navigation back

Example breadcrumbs for different pages:

- **Dashboard**: No breadcrumb (it's the root authenticated page)
- **Classes**: `Home > Classes`
- **Attendance**: `Home > Classes > [ClassName] > Take Attendance`
- **Student Record**: `Home > History > [StudentName]` or navigable hierarchy
- **Reports**: `Home > Reports`

Implementation details:

- Breadcrumbs should be **clickable links** for quick navigation
- Use visual separator (e.g., `/` or `>`) between items
- Last item should be **non-clickable** (current page)
- Font size: `Body Small` from design system
- Color: Text secondary (`rgba(255, 255, 255, 0.60)`)
- Hover on links: Change to text primary color
- **Mobile Strategy** (< 768px):
  - Show breadcrumbs but in **compact form**:
    - Use `/` separator instead of `>` (takes less space)
    - Display only last 2-3 items in breadcrumb trail (e.g., `Classes / Math 101` instead of `Home / Classes / Math 101`)
    - Font size: `0.75em` (even smaller than Body Small)
    - Breadcrumbs positioned left of avatar, wrap to second line if needed or truncate with ellipsis
    - Links still fully clickable for navigation
  - **Tablet** (768px - 1024px): Show full breadcrumbs with `>` separator
  - **Desktop** (> 1024px): Show full breadcrumbs with plenty of space

Data source: Derive from `$route.meta` or `$route.path` to automatically generate breadcrumb trail

Note: This is optional for MVP but adds polish and improves UX on deeper nested pages like individual student records.

**Styling**:

- Fixed positioning at top (z-index handling)
- Height: ~60px
- Avatar size: ~40-48px diameter
- Contrast colors for visibility
- Smooth transitions/hover effects
- Dropdown menu styling:
  - Position: absolute, anchored to avatar
  - Background: `#242424` (dark background)
  - Border: subtle border with `rgba(255, 255, 255, 0.2)`
  - Padding: `md` spacing
  - Font size: `Body Small`
  - Shadow: `md` shadow
  - Close on click outside (click-away behavior)

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

### Phase 3: Refactor App.vue & Router (Layout Wrapper Approach)

**File**: `frontend/src/App.vue` and `frontend/src/router/index.ts`

**Approach**: Create a layout route wrapper

**Implementation**:

1. **Update App.vue**:
   - Simplify to just `<RouterView />` (keep it minimal)
   - No conditional logic needed

2. **Update Router** (`frontend/src/router/index.ts`):
   - Create a layout wrapper component inline or import AppLayout
   - Group authenticated routes under a parent route that renders AppLayout
   - Structure:
     ```
     routes: [
       { path: "/", redirect: "/login" },
       { path: "/login", component: LoginView },
       { path: "/register", component: RegisterView },
       {
         component: AppLayout,
         children: [
           { path: "/dashboard", component: DashboardView },
           { path: "/classes", component: ClassManagementView },
           { path: "/attendance", component: TakeAttendanceView },
           { path: "/history", component: AttendanceHistoryView },
           { path: "/reports", component: ReportsView },
           { path: "/students/:id", component: StudentRecordView },
         ]
       },
       { path: "/:pathMatch(.*)*", component: NotFoundView }
     ]
     ```

**Benefits**:

- Keeps App.vue clean and simple
- Follows Vue Router best practices for nested layouts
- Easier to add additional layout types (admin layout, public layout, etc.) in future
- Modular and maintainable as app grows

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

## Files to Modify/Create

| File                                            | Action     | Reason                                       |
| ----------------------------------------------- | ---------- | -------------------------------------------- |
| `frontend/src/styles/DESIGN_SYSTEM.md`          | **Create** | Styling guidelines reference for future work |
| `frontend/src/components/TopBar.vue`            | **Create** | New navbar component with avatar and logout  |
| `frontend/src/components/AppLayout.vue`         | **Create** | Layout wrapper for authenticated pages       |
| `frontend/src/App.vue`                          | **Modify** | Simplify to just render RouterView           |
| `frontend/src/router/index.ts`                  | **Modify** | Add AppLayout as parent route wrapper        |
| `frontend/src/style.css`                        | **Modify** | Add navbar and avatar styling                |
| `frontend/tests/unit/components/TopBar.spec.ts` | **Create** | Unit tests for TopBar                        |

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
