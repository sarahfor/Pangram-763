#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path
import re


def normalize_words(source_text: str) -> list[str]:
    words = []

    for line in source_text.splitlines():
        word = line.strip().lower()

        if len(word) < 4 or not re.fullmatch(r"[a-z]+", word):
            continue

        words.append(word)

    return sorted(set(words))


def build_override_script(words: list[str], source_path: Path) -> str:
    body = "\n".join(words)
    return (
        f"// Generated from {source_path.name}\n"
        f"// {len(words)} words\n"
        "window.PANGRAM763_WORD_BANK_OVERRIDE = `"
        f"{body}"
        "`.split(/\\n+/).filter(Boolean);\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build Pangram 763's override word bank from a plain text file."
    )
    parser.add_argument("source", help="Path to a plain text word list with one word per line.")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    source_path = Path(args.source).expanduser().resolve()
    target_path = repo_root / "word-bank-override.js"

    if not source_path.exists():
        raise SystemExit(f"Word list not found: {source_path}")

    words = normalize_words(source_path.read_text())

    if not words:
        raise SystemExit("No usable 4+ letter words were found in that file.")

    target_path.write_text(build_override_script(words, source_path))
    print(f"Wrote {len(words)} words to {target_path}")


if __name__ == "__main__":
    main()
