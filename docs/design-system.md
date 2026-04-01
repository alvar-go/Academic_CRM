# Design System Proposal

## Visual Direction

The CRM should feel institutional, editorial, and operational at the same time:

- editorial enough to give hierarchy and character
- operational enough to stay readable in dense workflows
- configurable enough to let each institution map the interface to its own palette

## Framework Decision

Use a native design-token layer with modular JavaScript, not Bootstrap or Tailwind as the initial visual foundation.

Why:

- the current stack already runs without Node build tooling
- runtime palette customization is simpler with CSS variables
- we keep visual control instead of inheriting a generic component language
- business modules can consume semantic tokens before we commit to a component framework

If later the product grows into a larger frontend platform with a Node pipeline, Tailwind is the better escalation path over Bootstrap. For this first top-down phase, the base should stay framework-light.

## Typography Proposal

Default stack:

- Display and section headings: `Plus Jakarta Sans`
- UI and body copy: `Rubik`
- Data and technical accents: `Google Sans Code`
- Monospaced text should render at `90%` or `80%` scale depending on density, never at full body-size emphasis

Alternative presets already supported in the configuration layer:

- Display alternative: `Fraunces`
- Body alternative: `Manrope`
- Display alternative: `Sora`
- Body alternative: `Source Sans 3`
- Mono alternative: `IBM Plex Mono`

## Color Model

The palette is semantic, not hardcoded by component:

- `bg`
- `bgAlt`
- `surface`
- `text`
- `muted`
- `line`
- `primary`
- `secondary`
- `accent`

This makes it possible to change the institution brand without rewriting component styles.

Default base palette:

- `primary`: `#4f007c`
- `secondary`: `#0047AB`
- `accent`: `#9b1c31`
- `line`: `#A6A6A6`
- `bg`, `bgAlt`, `surface`, `text` and `muted` are derived neutrals chosen for contrast and form readability

## Configuration Module

The frontend configuration module is responsible for:

- theme presets
- light, dark and system color mode
- locale selection
- typography selections
- runtime CSS variable application
- user overrides persisted in local storage

Business modules should consume semantic tokens and should never introduce fixed brand colors directly.

Buttons should stay flat and clear. The default action style uses solid fills and restrained borders instead of heavy gradients.

## Dark Mode

Dark mode should not be treated as a separate stylesheet. The design layer should resolve semantic tokens for `light`, `dark` or `system`, and business modules should continue consuming the same token names.

That means the implementation target is:

- one semantic token contract
- multiple resolved palettes by mode
- no hardcoded light-only fills inside feature modules

## I18n

The shell is now expected to support internationalization from the foundation layer upward.

Current target:

- `en`
- `es`

Implementation direction:

- UI copy should come from message catalogs, not hardcoded component strings
- locale state should be persisted independently of business data
- domain values may keep stable internal codes while display labels are localized at render time
- the structure should stay open so more locales can be added without rewriting modules
