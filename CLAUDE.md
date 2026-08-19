# Mökin vedet — project guide

A small, self-contained Finnish web app: a step-by-step guide for opening and
closing a cottage's water system across the seasons. Single page, no framework,
no build step.

- **Live site:** https://heidicode.github.io/Mokin-vedet/
- **Repo:** https://github.com/HeidiCode/Mokin-vedet (public)

## Layout

| Path | What it is |
|---|---|
| `index.html` | The whole app: static markup + inline JS (data, renderer, theme switcher) |
| `themes/original.css` | "Minimalismi" theme — soft, Manrope, teal |
| `themes/neo-brutalist.css` | "Neobrutalismi" theme — yellow ground, black borders, hard shadows, JetBrains Mono |
| `images/*.jpg` | Optimized task photos (committed) |
| `images/*.png` | Original full-size photos — kept locally, **gitignored** |

## How the app is structured (all inside `index.html`)

- `const processes = { ... }` — the content. Each process (e.g. `opening`) has
  `groups`, each group has `tasks`. A task has `title`, `detail`, `tools`,
  `warning`, and `photos: [...]`.
- `const PHOTOS = { p01: [...paths], ... }` — maps a photo **key** to one or
  more image paths. A key mapping to several paths renders as a **gallery**.
  Tasks reference photos by key, so one photo can appear in many tasks and you
  only edit the path once.
- The renderer resolves each ref with `PHOTOS[ref] || ref` (so a raw path or URL
  also works) and flattens arrays into the thumbnail grid + fullscreen lightbox.

## Step flow / progress

A process is a **linear sequence** (per the Neo-Brutalist design system). State is
a single "steps completed" count per process, held **in memory only**
(`progressState`, `{ [processId]: <doneCount> }`) — intentionally not persisted, so
it clears whenever the app is closed/reloaded; there is no manual reset. Each step's
status is derived from its global position `num` (1-based, across groups) vs `done`:

- `num-1 < done` → **done** (filled badge + check + `[Valmis]`, body shown; tap the
  head to rewind to that step)
- `num-1 === done` → **current** (accent badge + `[Kesken]`, body shown, carries the
  full-width **Merkitse valmiiksi** button)
- `num-1 > done` → **locked** (dimmed badge + `[Lukittu]`, **title only, no body**)

You advance one step at a time with *Merkitse valmiiksi* (`stepBy(+1)`); to go back,
tap any done step to rewind to it (`setDoneAndRender`). Marking the **last** step done
opens the completion modal (`#complete-modal`, "Kaikki vaiheet valmiit" + a check
button); closing it (`closeCompleteModal`) **resets the process to 0**. Home cards
show each process's `done/total`. Structure is shared HTML/JS in `index.html`; each
theme styles it (`.progress*`, `.task-badge`, `.card-task__tag`,
`.card-task__head/__body`, `.step-actions`, `.btn-complete`, `.modal*`,
`.is-done`/`.is-current`/`.is-locked`). There is **no manual accordion** — body
visibility follows status.

## Themes (CSS Zen Garden model)

Same HTML, swappable stylesheet. The fixed switcher at the bottom rewrites the
`href` of `#theme-stylesheet`; the choice is saved in `localStorage` under
`tv-theme`. To add a theme: add a `themes/<name>.css`, register it in the
`THEMES` map and add a switcher button.

## Changing photos

1. Put the new image in `images/`. If it's a big PNG, make an optimized JPEG:
   `sips -s format jpeg -s formatOptions 70 -Z 1600 in.png --out in.jpg`
2. Point the relevant key in `PHOTOS` (around line ~150 of `index.html`) at the
   file. Keep the `images/*.png` originals — they're gitignored on purpose.

## Preview locally

```bash
python3 -m http.server 8731   # then open http://localhost:8731/
```

## Deploy

GitHub Pages serves `main` at the repo root. **Any push to `main` auto-deploys**
(usually live within ~1 min). There is no separate build.

## Working notes / gotchas

- `index.html` embeds base64-free but is still one file; when it was photo-heavy
  it was too large to read line-by-line. Use `awk`/ranged reads for big files.
- The repo lives in **iCloud Drive**. Renaming the folder can make macOS briefly
  revoke the terminal's access to the whole iCloud Documents area ("Operation
  not permitted"). Fix: reopen the folder in Finder or restart the terminal app.
- When find/replacing text with non-ASCII (e.g. `ö`), use Python, not a `perl`
  one-liner — the latter mangled `ö` into `Ã¶` here. Verify with `grep -c "Ã"`.
