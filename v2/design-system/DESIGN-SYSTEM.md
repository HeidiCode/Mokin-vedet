# Hana — the Mökin vedet v2 design system

The visual language of `v2/`. Written for people and for AI agents: read this
before you add or change anything that is drawn on screen.

## Sources of truth

| What | Where | Rule |
|---|---|---|
| Tokens (colour, type, shape, spacing) | `v2/design-system/tokens.json` | The **only** place a token value is written. W3C Design Tokens format. |
| Tokens as CSS | `v2/themes/tokens.css` | **Generated.** Never edit. Run `python3 v2/design-system/build-tokens.py`; `--check` fails if it is stale. |
| Components | `v2/themes/stylesV2.css` | Uses tokens only, through `var(--name)`. |
| Markup and behaviour | `v2/index.html` | The renderer builds every component; class names below are the contract. |
| Documentation site | `v2/design-system/*.html` (live at `/v2/design-system/`) | For people. Previews use the real CSS and read token values live from `tokens.json`, so they cannot drift. Shared frame in `assets/ds.css` and `assets/ds.js`. |
| Figma | not yet made | Will be derived from `tokens.json` (variables) and this file (components). Code wins if they disagree. |

Token naming: each leaf key in `tokens.json` is the CSS custom property name
without `--`. `color.bg-page` is `--bg-page`, `space.space-16` is `--space-16`.
The groups only organise. `{color.text}` is an alias and becomes `var(--text)`.
Colours are named by role, then qualifier: `bg-*` fills an area, `text-*` is
read, `border`, `border-locked` and `shadow` draw structure, `icon-*` is a
glyph, `accent` is the one highlight fill. Pick by what you paint: a border
uses `--border` even though it is the same hex as `--text` today.

## Workflow for a change

1. Changing a value (a colour, a size): edit `tokens.json`, run the build
   script, commit both files.
2. Adding a token: add it to the right group in `tokens.json` with a
   `$description` saying where it is used, run the script, then use it in
   `stylesV2.css`.
3. Changing a component: edit `stylesV2.css`, referencing tokens. If you need a
   number that is not a token, either reuse the nearest token or add one; do
   not write a raw value.
4. A new component, or a changed one, also gets its page on the documentation
   site: copy an existing component page, keep the sections (Examples,
   Anatomy, Best practices, Accessibility, Tokens) and add it to `NAV` in
   `assets/ds.js`. Write icons as `<i data-icon="name"></i>`.
5. Before a PR: screenshot home, a process mid-way, and the completion modal at
   400px wide, and compare with `main`. Re-run axe-core after any retint.

## Foundations

**Look.** A pale green page (`--bg-page`) with white cards (`--bg-card`)
floating on it. Every card has a 2px `--border`, a 10px radius and, if it is
interactive or current, a hard `--shadow` offset by `--shadow-offset`.
One soft accent fill (`--accent`, lavender) for the thing to press and for
progress; one dark green (`--text-accent`) for small uppercase labels. No red,
no alarm colours: Huomio is a note, not an error.

**Type.** Two families. `--font-head` (Space Grotesk) for headings, card titles
and buttons; `--font-body` (Manrope) for everything you read and for labels.
Sizes are tokens: heading 25, title 19, button 19, body 17, label 14. Labels
are uppercase, weight 800, letter-spacing 0.06em, colour `--text-accent`.
Line-heights are unitless ems snapped to whole pixels with `round(1.5em, 1px)`.

**Spacing.** An 8px grid: `--space-8`, `-16`, `-24`, `-32`, `-40`, `-64`.
`--space-4` is allowed only between a label and its text, and as the inset of
a pill or counter. Alike elements get the same value. Card padding is 16,
gaps between cards 16, between groups 24.

**Lines and shape.** `--border-width` (2px) is every border, everywhere, including
the current card and the modal; the current card is set apart by colour and
shadow, never by a thicker border. No fractional widths or positions. Radii:
`--radius` (10) for cards and buttons, `--radius-sm` (8) for badges,
thumbnails, counters and the progress track.

**Pixel precision.** Boxes sit on whole pixels. A box whose width follows its
text (a counter) gets a fixed `min-width` so its border does not land between
pixels. Measure in a rendered browser, not only in the CSS.

## Components

Class names are BEM-ish: `.block`, `.block__element`, `.is-state`.

| Component | Class | Notes |
|---|---|---|
| App bar | `.app-bar`, `.app-bar__title`, `.icon-btn` | 64px, white, 2px bottom border. Title is the page `<h1>`. Back button 44×44. |
| Process card (home) | `.card-project`, `__title`, `__count` | Whole card is a button. Presses into its shadow on `:active`. The counter shows steps done, e.g. `3/12`; a finished process resets to `0/n` when its modal closes, so there is no complete state. |
| Contact box | `.contact-box`, `__title`, `__text` | Pinned to the bottom of home. No shadow (not interactive). |
| Progress bar | `.progress`, `__count`, `__track`, `__fill` | Sticky at the top of a process, full bleed, page-coloured. Fill is `--border`. |
| Description / tools | `.page-description`, `.page-tools`, `__label`, `__row` | Intro text and the tools box above the steps. |
| Phase | `.step-group`, `__header`, `__label` (`<h2>`), `__name` | Label (VAIHE 1) above a 25px heading on a 2px rule. |
| Step card | `.card-task` + `.is-current` / `.is-done` / `.is-locked` | See states below. |
| Step badge | `.task-badge`, `__num`, `.check-icon` | 34×34. Number, or a check when done. |
| Step head | `.card-task__head`, `__titlerow`, `__title`, `__tag` | A `<button>` on done steps (tap to rewind), a `<div>` otherwise. |
| Step body | `.card-task__body`, `__section-label`, `__section-text` | Ohjeet, Työkalut, Liitteet sections. |
| Photo thumbnail | `.attachments-grid`, `.attachment-thumb` | 94×94 with a dark "AVAA" bar drawn by `::after`. |
| Huomio | `.alert-box`, `__title`, `__text` | Pale yellow note; the title rides the top border as a tab. |
| Primary button | `.btn-complete` (in `.step-actions`), `.modal__btn` | Accent fill, border and shadow, presses on `:active`. Full width. |
| Lightbox | `.lightbox`, `.lightbox-close` | Full-screen photo on `--overlay`. |
| Completion modal | `.modal`, `__box`, `__badge`, `__text`, `__note`, `__btn` | Opens when the last step is marked done; closing resets the process. |

### Step card states

A process is a linear sequence. Exactly one step is current.

| State | Background | Border | Shadow | Badge | Body |
|---|---|---|---|---|---|
| `is-current` | `--bg-card` | 2px solid `--border` | 5px accent | accent fill, number | open, with the primary button |
| `is-done` | `--bg-done` | 2px solid `--border` | none | accent fill, check | open; head rewinds |
| `is-locked` | `--bg-locked` | 2px dashed `--border-locked` | none | transparent, dashed, `--text-muted` | hidden; padlock in the title row |

The words Valmis / Kesken are `.sr-only` (screen readers still get them); the
locked step shows a padlock (`--icon-lock`) instead of the word Lukittu.

## Accessibility rules

Target WCAG 2.1 AA, checked with axe-core.

- **Never dim with `opacity`.** Muted things use explicit colours (`--text-muted`).
- Text pairs ≥ 4.5:1; the weakest today is the small uppercase label on the
  done card at 4.6:1. The locked card's dashed border is its only outline and
  must stay ≥ 3:1. `--accent` is a fill under dark text; `--text-accent` is for
  text. They do not follow each other: check both after a retint.
- **Focus ring:** 2px `--border` `:focus-visible` outline with a 2px gap; white
  inside the lightbox; around the whole card for a done step's head.
- Overlays (`.lightbox`, `.modal__box`) are `role="dialog"` + `aria-modal`, take
  focus on open, trap Tab, and return focus on close.
- Thumbnails have a numbered `aria-label` ("Avaa kuva N") and an alt from `ALT`.
- Motion honours `prefers-reduced-motion`. Touch targets are at least 44×44.

## Do / don't

| Do | Don't |
|---|---|
| Use `var(--token)` for every colour, size, radius and space | Write a raw hex or px value in a component |
| Keep borders at `--border-width` | Make a border thicker to show state |
| Show state with background, shadow, badge and the open body | Use opacity, or red, to show state |
| Put new spacing on the 8px grid | Use 4px except label→text and pill insets |
| Add a `$description` to every new token | Edit `tokens.css` by hand |
| Keep UI copy in Finnish, plain and short | Leave an icon-only control without a visible or aria label |

## Known off-token values

Raw values still written in `stylesV2.css`. Each is a candidate for a token, or
for snapping to an existing one; changing any of them is visible, so it needs
a design decision first.

| Value | Where |
|---|---|
| `#ffffff` text | Huomio tab (`.alert-box__title`) — same as `--bg-card` |
| 14px, 16px font size | thumbnail AVAA bar, step badge number |
| 700 / 800 font weight | labels, counters, badges (no weight token for labels yet) |
| 6px radius | Huomio tab |
| 14px radius | modal box |
| 5px / 6px shadow | current card, modal box (accent shadows; others use `--shadow-offset` 3px) |
| 34px, 44px, 56px, 94px | badge, icon buttons, modal badge / counter width, thumbnail |
| 10px top | app bar back button |
