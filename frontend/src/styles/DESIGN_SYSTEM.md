# Design System — Attendance Taker Frontend

This living style guide defines all visual and functional standards for the Attendance Taker frontend. Use this document as the authoritative reference when creating or updating any visual element.

---

## Color Palette

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

---

## Typography

- **Font Family**: `system-ui, Avenir, Helvetica, Arial, sans-serif`

### Heading Levels

- **Heading XL** (h1): `3.2em`, font-weight 600
- **Heading L** (h2): `2.4em`, font-weight 600
- **Heading M** (h3): `1.6em`, font-weight 600

### Body Text

- **Body Large**: `1em`, font-weight 400, line-height 1.5 (default)
- **Body Small**: `0.875em`, font-weight 400, line-height 1.5
- **Button**: `1em`, font-weight 500, inherit font-family

---

## Spacing Scale (8px base unit)

All spacing follows an 8px base unit for consistency and rhythm:

- `xs`: 4px (0.5rem) — micro spacing
- `sm`: 8px (0.5em) — micro spacing
- `md`: 12px (0.75em) — padding/gaps
- `lg`: 16px (1em) — section spacing
- `xl`: 24px (1.5em) — large gaps
- `2xl`: 32px (2em) — major sections
- `3xl`: 48px (3em) — page-level spacing

---

## Border Radius

- `sm`: 4px (subtle, inline elements)
- `md`: 8px (default, buttons & cards)
- `lg`: 16px (larger components)
- `full`: 9999px (circles, badges, avatars)

---

## Shadows

Use shadows to create depth and hierarchy:

- `sm`: `0 1px 2px rgba(0, 0, 0, 0.5)` — subtle elevation
- `md`: `0 4px 6px rgba(0, 0, 0, 0.7)` — moderate elevation
- `lg`: `0 10px 15px rgba(0, 0, 0, 0.8)` — pronounced elevation

---

## Transitions & Animations

- **Default Duration**: 250ms
- **Easing**: `ease-in-out`
- **Properties**: Animate only specific properties: `color`, `border-color`, `background-color`, `box-shadow` (avoid `all`)
- **CSS**: `transition: <property> 250ms ease-in-out;`

Example:

```css
.button {
  transition:
    border-color 250ms ease-in-out,
    background-color 250ms ease-in-out;
}
```

---

## Button Styles

### Default Button

```css
background-color: #1a1a1a;
border: 1px solid #646cff;
color: rgba(255, 255, 255, 0.87);
border-radius: 8px;
padding: 0.6em 1.2em;
font-size: 1em;
font-weight: 500;
cursor: pointer;
```

### Hover State

```css
border-color: #535bf2;
```

### Active State

- Darken background slightly
- Keep border color from hover state

### Disabled State

```css
opacity: 0.5;
cursor: not-allowed;
```

---

## Component Sizing

- **Navbar Height**: `60px`
- **Avatar Diameter**: `40px` (small), `48px` (medium)
- **Icon Size**: `16px` (small), `24px` (medium)
- **Input/Button Height**: `36px` (compact), `44px` (standard)

---

## Responsive Breakpoints

Use mobile-first approach with `@media (min-width: ...)`:

- **Mobile**: < 768px — single column, compact
- **Tablet**: 768px - 1024px — two columns, moderate spacing
- **Desktop**: > 1024px — full width, expansive layouts

Example:

```css
/* Mobile first */
.component {
  width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    width: 50%;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    width: 33.33%;
  }
}
```

---

## Accessibility Standards

### Contrast Ratio

- **Minimum**: WCAG AA (4.5:1 for text on background)
- **Test**: Use WebAIM contrast checker or browser DevTools

### Focus States

All interactive elements must have visible focus indicators:

```css
:focus {
  outline: 2px solid #646cff;
  outline-offset: 2px;
}
```

### ARIA Labels

Add to:

- Buttons (icon-only buttons especially)
- Interactive icons
- Form inputs (labels)
- Navigation elements

Example:

```vue
<button aria-label="Close dropdown">×</button>
```

### Keyboard Navigation

- All interactive elements must be tab-accessible
- Tab order should follow visual flow (left-to-right, top-to-bottom)
- Avoid `tabindex` positive values (breaks expected order)

---

## Implementation Guidelines

1. **Reference this guide** for all new visual components
2. **Use CSS custom properties (variables)** for colors/spacing when creating new components
3. **Test responsiveness** at all breakpoints defined above
4. **Maintain consistency** with existing button and link styles
5. **Document deviations** if design system needs updates (update this file)
6. **Priority**: Functionality first, then polish with this guide

### Example: CSS Variables in New Component

```css
:root {
  --color-primary: #646cff;
  --color-primary-hover: #535bf2;
  --color-bg-dark: #242424;
  --color-text-primary: rgba(255, 255, 255, 0.87);
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --border-radius-md: 8px;
  --transition-default: 250ms ease-in-out;
}

.new-component {
  background-color: var(--color-bg-dark);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: background-color var(--transition-default);
}
```

---

## Version History

- **v1.0** (2026-03-25): Initial design system created for navbar implementation
