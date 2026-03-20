# Pangram 763

Pangram 763 is a word game website inspired by spelling-style puzzle games.

The goal is simple:

- You are given 7 letters.
- One letter in the center is required in every word.
- You can reuse letters.
- Words must be at least 4 letters long.
- Four-letter words are worth 1 point each.
- Longer words are worth 1 point per letter.
- If you use all 7 letters in one word, that is a pangram and it earns an extra 7 points.

This version was designed to feel playful, polished, and easy to use on desktop, iPad, and mobile.

## What The App Does

Pangram 763 lets people do two main things:

- Play built-in pangram puzzles.
- Create and save custom pangram puzzles in the browser.

This version now uses a Collins Scrabble word list to decide which words are accepted in the game. The site filters that bank down to lowercase, alphabetic words that are at least 4 letters long, so hyphenated entries are excluded, but the overall list is still broader than a tightly curated editorial Spelling Bee-style dictionary.

While playing, the app keeps track of:

- words found
- score
- pangrams found
- rank progress

It also includes small celebration moments like confetti for pangrams and a larger celebration for Queen Bee.

### Play Pangrams

On the play screen, the player:

- chooses a puzzle
- types or taps letters
- submits words
- sees whether the word is accepted
- builds toward higher ranks and Queen Bee

### Create Pangrams

On the create screen, the player:

- enters 7 unique letters
- chooses the center letter
- saves the custom puzzle

The site then uses its current word list to generate the accepted words for that puzzle.

## Technology Used

This project was built with simple web technologies:

- `HTML` for the structure of the pages
- `CSS` for the visual design, layout, colors, and responsive mobile styling
- `JavaScript` for the game rules, scoring, puzzle logic, and interactions

It also uses:

- a Collins Scrabble word list for the current accepted-word bank
- `localStorage` to save progress and custom puzzles in the browser
- `GitHub Pages` to publish the website online

## Project Files

The main files are:

- `index.html` - the page structure
- `styles.css` - the design and responsive layout
- `script.js` - the game behavior and logic
- `word-bank.js` - the built-in word list
- `word-bank-override.js` - the active replacement word list the game uses first
- `scripts/build-word-bank-override.py` - the helper script for loading a new word list into the game

## Running It Locally

If someone wants to open the project on their own computer, they can:

1. Open `index.html` directly in a browser.
2. Or run a simple local server from the project folder, such as:

```bash
python3 -m http.server 8000
```

Then open:

`http://127.0.0.1:8000`

## Replacing The Word List

The project is set up so the word list can be updated later if needed.

Put the new list in a plain text file with one word per line, then run:

```bash
python3 scripts/build-word-bank-override.py /path/to/your-word-list.txt
```

That creates `word-bank-override.js`, and the site will use that file instead of the built-in word bank after a refresh.

## Summary

Pangram 763 is a custom word puzzle website where people can both play and create pangram challenges. It was built with HTML, CSS, and JavaScript, uses a Scrabble-style word list to power accepted words, and is published as a simple browser-based experience that works across devices.
