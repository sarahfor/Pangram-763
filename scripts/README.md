Use `build-word-bank-override.py` to turn a plain text word list into Pangram 763's override file.

Example:

```bash
python3 scripts/build-word-bank-override.py ~/Downloads/my-word-list.txt
```

That command rewrites `word-bank-override.js`, and the site will use that file instead of the built-in word bank on the next refresh.
