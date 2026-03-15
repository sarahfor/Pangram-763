# Pangram 763

Pangram 763 is a word game website inspired by spelling-style puzzle games.

The goal is simple:

- You are given 7 letters.
- One letter in the center is required in every word.
- You can reuse letters.
- Words must be at least 4 letters long.
- If you use all 7 letters in one word, that is a pangram.

This version was designed to feel playful, polished, and easy to use on desktop, iPad, and mobile.

## What The App Does

Pangram 763 lets people do two main things:

- Play built-in pangram puzzles.
- Create and save custom pangram puzzles in the browser.

While playing, the app keeps track of:

- words found
- score
- pangrams found
- rank progress

It also includes small celebration moments like confetti for pangrams and a larger celebration for Queen Bee.

## Features In Plain Language

- A honeycomb-style letter board you can tap or type from the keyboard.
- A required center letter, just like a spelling puzzle.
- A running score and rank system.
- A list of words you have already found.
- A custom puzzle builder where you can create your own letter set.
- Saved progress in your browser, so your puzzles and scores stay on your device.
- Mobile-friendly layout for playing on a phone.

## How People Use It

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

The site then uses its built-in word list to generate the accepted words for that puzzle.

## Technology Used

This project was built with simple web technologies:

- `HTML` for the structure of the pages
- `CSS` for the visual design, layout, colors, and responsive mobile styling
- `JavaScript` for the game rules, scoring, puzzle logic, and interactions

It also uses:

- `localStorage` to save progress and custom puzzles in the browser
- `GitHub Pages` to publish the website online

## Why That Matters

Because it uses standard web technology, the app is:

- lightweight
- fast to load
- easy to update
- simple to host online

There is no separate app install required. People can just open the website and play.

## Project Files

The main files are:

- `index.html` - the page structure
- `styles.css` - the design and responsive layout
- `script.js` - the game behavior and logic
- `word-bank.js` - the built-in word list

## Running It Locally

If someone wants to open the project on their own computer, they can:

1. Open `index.html` directly in a browser.
2. Or run a simple local server from the project folder, such as:

```bash
python3 -m http.server 8000
```

Then open:

`http://127.0.0.1:8000`

## Summary

Pangram 763 is a custom word puzzle website where people can both play and create pangram challenges. It was built with HTML, CSS, and JavaScript, and published as a simple browser-based experience that works across devices.
