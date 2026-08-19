# Mökin vedet

A self-contained web app: a step-by-step guide for opening and closing a
cottage's water system across the seasons (summer arrive/leave, spring opening,
autumn closing, winter on/off).

## Live demo

https://heidicode.github.io/Mokin-vedet/

## Using it

Pick a season/task from the home list, then work through it one step at a time:

- The **current** step is expanded with its instructions, tools, photos, and any
  warnings; earlier steps collapse to "done" and later steps stay locked, so you
  always see exactly what to do next.
- Tap **Merkitse valmiiksi** to complete the current step and advance. To go back,
  tap any completed step to return to it.
- A **sticky progress bar** at the top shows how many steps are done, and each home
  card shows its `done/total`.
- Progress is **per session only** — it isn't saved. Finishing the list (a "Kaikki
  vaiheet valmiit" confirmation appears on the last step) or reloading starts it
  fresh.

## Themes

The page ships with a CSS Zen Garden–style theme switcher: the same HTML is
restyled by swapping one stylesheet. Pick a theme from the switcher at the
bottom of the screen; the choice is remembered (localStorage).

- **Minimalismi** — the original soft look (`themes/original.css`)
- **Neobrutalismi** — raw borders, hard offset shadows, monospace type
  (`themes/neo-brutalist.css`)

## Structure

- `index.html` — the full standalone page (markup + inline JS + theme switcher)
- `themes/original.css` — original theme
- `themes/neo-brutalist.css` — Neo-Brutalist theme

No build step and no dependencies: open `index.html` in a browser to run it locally.

## Deployment

Hosted on GitHub Pages, served from the `main` branch. Any push to `main`
publishes automatically.
