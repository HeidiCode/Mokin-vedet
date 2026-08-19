# Mökin vedet

A self-contained interactive web page presenting the "Mökin vedet" process.

## Live demo

https://heidicode.github.io/Mokin-vedet/

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
