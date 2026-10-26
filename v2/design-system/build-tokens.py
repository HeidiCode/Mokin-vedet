#!/usr/bin/env python3
"""Generate v2/themes/tokens.css from v2/design-system/tokens.json.

    python3 v2/design-system/build-tokens.py          # write tokens.css
    python3 v2/design-system/build-tokens.py --check  # exit 1 if it is stale

Each leaf key in tokens.json becomes a custom property of the same name
(`ground` -> `--ground`); the groups only organise. An alias such as
"{color.ink}" becomes `var(--ink)`. Standard library only, no build step for
the site itself: the generated file is committed.
"""

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "tokens.json"
OUT = HERE.parent / "themes" / "tokens.css"

ALIAS = re.compile(r"^\{([^}]+)\}$")

# Font keywords that must stay unquoted; every other family name is quoted.
GENERIC = {"serif", "sans-serif", "monospace", "system-ui", "-apple-system", "BlinkMacSystemFont"}


def leaves(group, path=(), inherited_type=None):
    """Yield (path, token) for every token, in file order."""
    group_type = group.get("$type", inherited_type)
    for key, node in group.items():
        if key.startswith("$"):
            continue
        if "$value" in node:
            yield path + (key,), {**node, "$type": node.get("$type", group_type)}
        else:
            yield from leaves(node, path + (key,), group_type)


def css_value(token, index):
    value = token["$value"]
    if isinstance(value, str):
        match = ALIAS.match(value)
        if match:
            target = tuple(match.group(1).split("."))
            if target not in index:
                sys.exit(f"tokens.json: alias {value} points at nothing")
            return f"var(--{target[-1]})"
    if token["$type"] == "fontFamily":
        return ", ".join(f if f in GENERIC else f'"{f}"' for f in value)
    return str(value)


def build():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    tokens = list(leaves(data))
    index = {path: token for path, token in tokens}

    names = [path[-1] for path, _ in tokens]
    dupes = {n for n in names if names.count(n) > 1}
    if dupes:
        sys.exit(f"tokens.json: leaf keys must be unique, repeated: {sorted(dupes)}")

    lines = [
        "/* GENERATED from v2/design-system/tokens.json by build-tokens.py.",
        "   Do not edit by hand: change tokens.json and rerun the script. */",
        "",
        ":root {",
    ]
    current_group = None
    for path, token in tokens:
        if path[0] != current_group:
            if current_group is not None:
                lines.append("")
            lines.append(f"  /* --- {path[0]} --- */")
            current_group = path[0]
        line = f"  --{path[-1]}: {css_value(token, index)};"
        if token.get("$description"):
            line += f"  /* {token['$description']} */"
        lines.append(line)
    lines.append("}")
    return "\n".join(lines) + "\n"


def main():
    css = build()
    if "--check" in sys.argv:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != css:
            sys.exit("tokens.css is out of date: run python3 v2/design-system/build-tokens.py")
        print("tokens.css is up to date")
        return
    OUT.write_text(css, encoding="utf-8")
    print(f"wrote {OUT.relative_to(HERE.parent.parent)}")


if __name__ == "__main__":
    main()
