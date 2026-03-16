const STORAGE_KEYS = {
    customPuzzles: "pangram763.customPuzzles.v1",
    progress: "pangram763.progress.v1",
    activePuzzle: "pangram763.activePuzzle.v1"
};

const CURATED_AELPRST_WORDS = [
    "alert",
    "alter",
    "apse",
    "area",
    "aster",
    "earl",
    "easter",
    "late",
    "later",
    "leaps",
    "least",
    "paler",
    "pares",
    "parse",
    "peals",
    "pearl",
    "petal",
    "plaster",
    "plate",
    "pleas",
    "pleat",
    "psalter",
    "rate",
    "real",
    "reaps",
    "relate",
    "sale",
    "seal",
    "slate",
    "spare",
    "spear",
    "stale",
    "start",
    "staple",
    "stapler",
    "stare",
    "tale",
    "tape",
    "tare",
    "taser",
    "teal",
    "tear",
    "tears"
];

const CURATED_WORD_SETS = {
    "aelprst:a": CURATED_AELPRST_WORDS
};

const DEFAULT_PUZZLES = [
    {
        id: "schedule-cdehlsu",
        title: "Schedule",
        letters: ["c", "d", "e", "h", "l", "s", "u"],
        center: "e"
    },
    {
        id: "gymnasts-agmnsty",
        title: "Gymnasts",
        letters: ["a", "g", "m", "n", "s", "t", "y"],
        center: "g"
    },
    {
        id: "cowbird-bcdiorw",
        title: "Cowbird",
        letters: ["b", "c", "d", "i", "o", "r", "w"],
        center: "o"
    },
    {
        id: "gravity-agirtvy",
        title: "Gravity",
        letters: ["a", "g", "i", "r", "t", "v", "y"],
        center: "a"
    },
    {
        id: "sodilhc-cdhilos",
        title: "Sodilhc",
        letters: ["c", "d", "h", "i", "l", "o", "s"],
        center: "l"
    }
];

const WORD_BANK = Array.isArray(window.PANGRAM763_WORD_BANK) ? window.PANGRAM763_WORD_BANK : [];
const GENERATED_WORDS_CACHE = new Map();
const CONFETTI_COLORS = ["#f7cf39", "#171513", "#f29f05", "#ffffff", "#f4d77f"];
let confettiCleanupTimer = 0;
let beeCleanupTimer = 0;
let celebrationStateTimer = 0;

const RANKS = [
    { threshold: 0, label: "Beginner" },
    { threshold: 0.02, label: "Good Start" },
    { threshold: 0.05, label: "Moving Up" },
    { threshold: 0.08, label: "Good" },
    { threshold: 0.15, label: "Solid" },
    { threshold: 0.25, label: "Nice" },
    { threshold: 0.4, label: "Great" },
    { threshold: 0.5, label: "Amazing" },
    { threshold: 0.7, label: "Genius" },
    { threshold: 1, label: "Queen Bee" }
];

const state = {
    customPuzzles: [],
    puzzles: [],
    progress: {},
    activePuzzleId: "",
    currentWord: "",
    outerOrder: [],
    view: "play",
    rankDetailOpen: false,
    puzzleSelectOpen: false,
    mobilePanel: "words"
};

const elements = {
    tabButtons: [...document.querySelectorAll(".tab-button")],
    playPanel: document.getElementById("playPanel"),
    createPanel: document.getElementById("createPanel"),
    effectsLayer: document.getElementById("effectsLayer"),
    puzzleSelectWrap: document.getElementById("puzzleSelectWrap"),
    puzzleSelect: document.getElementById("puzzleSelect"),
    puzzleSelectButton: document.getElementById("puzzleSelectButton"),
    puzzleSelectCurrent: document.getElementById("puzzleSelectCurrent"),
    puzzleSelectMenu: document.getElementById("puzzleSelectMenu"),
    activePuzzleNote: document.getElementById("activePuzzleNote"),
    resetProgressButton: document.getElementById("resetProgressButton"),
    mobilePangramCount: document.getElementById("mobilePangramCount"),
    playLetters: document.getElementById("playLetters"),
    playLetterTiles: [...document.querySelectorAll("#playLetters .mini-hex")],
    wordDisplay: document.getElementById("wordDisplay"),
    statusMessage: document.getElementById("statusMessage"),
    playBoard: document.getElementById("playBoard"),
    playBoardButtons: [...document.querySelectorAll("#playBoard .hex")],
    deleteButton: document.getElementById("deleteButton"),
    shuffleButton: document.getElementById("shuffleButton"),
    enterButton: document.getElementById("enterButton"),
    mobileRankValue: document.getElementById("mobileRankValue"),
    mobileScoreValue: document.getElementById("mobileScoreValue"),
    mobileProgressBar: document.getElementById("mobileProgressBar"),
    mobileProgressNote: document.getElementById("mobileProgressNote"),
    mobileUtilityPanel: document.getElementById("mobileUtilityPanel"),
    mobileUtilityTabs: [...document.querySelectorAll(".mobile-utility-tab")],
    mobileFoundCount: document.getElementById("mobileFoundCount"),
    mobileWordsPanel: document.getElementById("mobileWordsPanel"),
    mobileFoundWords: document.getElementById("mobileFoundWords"),
    mobileRankingPanel: document.getElementById("mobileRankingPanel"),
    mobileRankMenuCurrent: document.getElementById("mobileRankMenuCurrent"),
    mobileRankBreakdown: document.getElementById("mobileRankBreakdown"),
    wordsFoundValue: document.getElementById("wordsFoundValue"),
    scoreValue: document.getElementById("scoreValue"),
    pangramsValue: document.getElementById("pangramsValue"),
    rankDropdown: document.getElementById("rankDropdown"),
    rankCard: document.getElementById("rankCard"),
    rankValue: document.getElementById("rankValue"),
    rankDetail: document.getElementById("rankDetail"),
    rankMenu: document.getElementById("rankMenu"),
    rankMenuCurrent: document.getElementById("rankMenuCurrent"),
    rankBreakdown: document.getElementById("rankBreakdown"),
    scoreMeta: document.getElementById("scoreMeta"),
    progressPercent: document.getElementById("progressPercent"),
    progressBar: document.getElementById("progressBar"),
    foundCountBadge: document.getElementById("foundCountBadge"),
    foundWords: document.getElementById("foundWords"),
    creatorForm: document.getElementById("creatorForm"),
    lettersInput: document.getElementById("lettersInput"),
    centerInput: document.getElementById("centerInput"),
    creatorMessage: document.getElementById("creatorMessage"),
    clearCreatorButton: document.getElementById("clearCreatorButton"),
    savedPangramList: document.getElementById("savedPangramList")
};

function normalizeLetters(rawText) {
    return rawText.toLowerCase().replace(/[^a-z]/g, "");
}

function uniqueCharacters(text) {
    return [...new Set(text.split(""))].join("");
}

function isPangram(word, letters) {
    return letters.every((letter) => word.includes(letter));
}

function getPuzzleKey(letters, center) {
    return `${[...letters].sort().join("")}:${center}`;
}

function generateWordsForPangram(letters, center) {
    const key = getPuzzleKey(letters, center);
    const cachedWords = GENERATED_WORDS_CACHE.get(key);

    if (cachedWords) {
        return cachedWords;
    }

    if (CURATED_WORD_SETS[key]) {
        GENERATED_WORDS_CACHE.set(key, CURATED_WORD_SETS[key]);
        return CURATED_WORD_SETS[key];
    }

    const allowedLetters = new Set(letters);
    const matchingWords = WORD_BANK.filter((word) => {
        if (!word.includes(center)) {
            return false;
        }

        return [...word].every((letter) => allowedLetters.has(letter));
    });

    GENERATED_WORDS_CACHE.set(key, matchingWords);
    return matchingWords;
}

DEFAULT_PUZZLES.forEach((puzzle) => {
    if (!Array.isArray(puzzle.words)) {
        puzzle.words = generateWordsForPangram(puzzle.letters, puzzle.center);
    }
});

function normalizeCustomPuzzleTitle(title, index) {
    if (typeof title !== "string" || !title.trim()) {
        return `Custom Pangram ${index + 1}`;
    }

    return title.replace(/^Custom Hive\b/i, "Custom Pangram");
}

function buildCustomPuzzle(savedPuzzle, index = 0) {
    const letters = Array.isArray(savedPuzzle.letters)
        ? savedPuzzle.letters
        : uniqueCharacters(normalizeLetters(savedPuzzle.letters || "")).split("");
    const center = normalizeLetters(savedPuzzle.center || "").slice(0, 1);
    const generatedWords = letters.length === 7 && center ? generateWordsForPangram(letters, center) : [];

    return {
        ...savedPuzzle,
        title: normalizeCustomPuzzleTitle(savedPuzzle.title, index),
        words: generatedWords.length ? generatedWords : savedPuzzle.words || []
    };
}

function scoreWord(word, letters) {
    const baseScore = word.length === 4 ? 1 : word.length;
    return isPangram(word, letters) ? baseScore + 7 : baseScore;
}

function calculateMaxScore(puzzle) {
    return puzzle.words.reduce((total, word) => total + scoreWord(word, puzzle.letters), 0);
}

function calculateFoundScore(foundWords, puzzle) {
    return foundWords.reduce((score, word) => score + scoreWord(word, puzzle.letters), 0);
}

function getRank(score, maxScore) {
    if (!maxScore) {
        return RANKS[0].label;
    }

    const progress = score / maxScore;
    let currentRank = RANKS[0].label;

    RANKS.forEach((rank) => {
        if (progress >= rank.threshold) {
            currentRank = rank.label;
        }
    });

    return currentRank;
}

function getNextRankDetails(score, maxScore) {
    if (!maxScore) {
        return {
            currentRank: RANKS[0].label,
            nextRank: RANKS[1]?.label || null,
            pointsToNext: 0
        };
    }

    const progress = score / maxScore;
    let currentIndex = 0;

    RANKS.forEach((rank, index) => {
        if (progress >= rank.threshold) {
            currentIndex = index;
        }
    });

    const currentRank = RANKS[currentIndex].label;
    const nextRank = RANKS[currentIndex + 1] || null;

    if (!nextRank) {
        return {
            currentRank,
            nextRank: null,
            pointsToNext: 0
        };
    }

    return {
        currentRank,
        nextRank: nextRank.label,
        pointsToNext: Math.max(0, Math.ceil(nextRank.threshold * maxScore) - score)
    };
}

function getRankLadder(score, maxScore) {
    if (!maxScore) {
        return RANKS.map((rank, index) => ({
            label: rank.label,
            targetScore: 0,
            pointsAway: 0,
            reached: index === 0
        }));
    }

    return RANKS.map((rank, index) => {
        const targetScore = index === 0 ? 0 : Math.ceil(rank.threshold * maxScore);
        const pointsAway = Math.max(0, targetScore - score);

        return {
            label: rank.label,
            targetScore,
            pointsAway,
            reached: score >= targetScore
        };
    });
}

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function hydratePuzzles() {
    const savedCustomPuzzles = readStorage(STORAGE_KEYS.customPuzzles, []);
    state.customPuzzles = savedCustomPuzzles.map((puzzle, index) => buildCustomPuzzle(puzzle, index));
    state.puzzles = [...DEFAULT_PUZZLES, ...state.customPuzzles];

    if (state.customPuzzles.some((puzzle, index) => puzzle.title !== savedCustomPuzzles[index]?.title)) {
        saveCustomPuzzles();
    }
}

function hydrateProgress() {
    state.progress = readStorage(STORAGE_KEYS.progress, {});
}

function getActivePuzzle() {
    return state.puzzles.find((puzzle) => puzzle.id === state.activePuzzleId) || state.puzzles[0] || null;
}

function getFoundWords(puzzleId) {
    return state.progress[puzzleId] || [];
}

function saveProgress() {
    writeStorage(STORAGE_KEYS.progress, state.progress);
}

function saveCustomPuzzles() {
    writeStorage(
        STORAGE_KEYS.customPuzzles,
        state.customPuzzles.map((puzzle) => ({
            id: puzzle.id,
            title: puzzle.title,
            letters: puzzle.letters,
            center: puzzle.center
        }))
    );
}

function ensureActivePuzzle() {
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.activePuzzle);
    const hasSavedPuzzle = state.puzzles.some((puzzle) => puzzle.id === savedActiveId);
    state.activePuzzleId = hasSavedPuzzle ? savedActiveId : state.puzzles[0]?.id || "";
    state.outerOrder = getOuterLetters(getActivePuzzle());
    if (state.activePuzzleId) {
        localStorage.setItem(STORAGE_KEYS.activePuzzle, state.activePuzzleId);
    }
}

function setActivePuzzle(puzzleId) {
    const nextPuzzle = state.puzzles.find((puzzle) => puzzle.id === puzzleId);
    if (!nextPuzzle) {
        return;
    }

    state.activePuzzleId = nextPuzzle.id;
    state.currentWord = "";
    state.outerOrder = getOuterLetters(nextPuzzle);
    state.rankDetailOpen = false;
    state.puzzleSelectOpen = false;
    localStorage.setItem(STORAGE_KEYS.activePuzzle, nextPuzzle.id);
    setStatus("Every word must use the center letter and stay inside the pangram.", "neutral");
    renderPlay();
}

function getOuterLetters(puzzle) {
    if (!puzzle) {
        return ["?", "?", "?", "?", "?", "?"];
    }

    return puzzle.letters.filter((letter) => letter !== puzzle.center);
}

function setStatus(message, tone) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message is-${tone}`;
}

function setCreatorMessage(message, tone) {
    elements.creatorMessage.textContent = message;
    elements.creatorMessage.className = `status-message is-${tone}`;
}

function closeRankMenu() {
    if (!state.rankDetailOpen) {
        return;
    }

    state.rankDetailOpen = false;
    renderStats();
}

function closePuzzleSelectMenu() {
    if (!state.puzzleSelectOpen) {
        return;
    }

    state.puzzleSelectOpen = false;
    renderPuzzleSelect();
}

function setMobilePanel(panelName) {
    state.mobilePanel = panelName === "ranking" ? "ranking" : "words";
    renderMobilePanel();
}

function renderMobilePanel() {
    if (!elements.mobileUtilityTabs.length) {
        return;
    }

    const isRanking = state.mobilePanel === "ranking";

    elements.mobileUtilityTabs.forEach((button) => {
        const isActive = button.dataset.mobilePanel === state.mobilePanel;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
    });

    if (elements.mobileWordsPanel) {
        elements.mobileWordsPanel.hidden = isRanking;
    }

    if (elements.mobileRankingPanel) {
        elements.mobileRankingPanel.hidden = !isRanking;
    }
}

function getViewFromHash() {
    return window.location.hash === "#create" ? "create" : "play";
}

function setView(nextView) {
    state.view = nextView === "create" ? "create" : "play";
    state.rankDetailOpen = false;
    state.puzzleSelectOpen = false;
    const nextHash = state.view === "create" ? "#create" : "#play";
    if (window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
    }
    renderTabs();
}

function getPuzzleDisplayName(puzzle) {
    if (!puzzle) {
        return "Custom Pangram";
    }

    const visibleIndex = state.puzzles.findIndex((item) => item.id === puzzle.id);

    if (visibleIndex >= 0) {
        return `Custom Pangram ${visibleIndex + 1}`;
    }

    return "Custom Pangram";
}

function getPuzzleDisplayLetters(puzzle) {
    if (!puzzle || !Array.isArray(puzzle.letters)) {
        return "???????";
    }

    const scrambledLetters = [...puzzle.letters];
    const originalOrder = scrambledLetters.join("");
    let seed = puzzle.id
        .split("")
        .reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 7);

    for (let index = scrambledLetters.length - 1; index > 0; index -= 1) {
        seed = ((seed * 1664525) + 1013904223) >>> 0;
        const swapIndex = seed % (index + 1);
        [scrambledLetters[index], scrambledLetters[swapIndex]] = [scrambledLetters[swapIndex], scrambledLetters[index]];
    }

    if (scrambledLetters.join("") === originalOrder) {
        scrambledLetters.push(scrambledLetters.shift());
    }

    return scrambledLetters.join("").toUpperCase();
}

function getPuzzleDisplayLabel(puzzle) {
    return `${getPuzzleDisplayName(puzzle)} (${getPuzzleDisplayLetters(puzzle)})`;
}

function renderTabs() {
    elements.tabButtons.forEach((button) => {
        const isActive = button.dataset.view === state.view;
        button.classList.toggle("is-active", isActive);
    });

    elements.playPanel.classList.toggle("is-active", state.view === "play");
    elements.createPanel.classList.toggle("is-active", state.view === "create");
}

function renderPuzzleSelect() {
    const currentValue = state.activePuzzleId;
    const activePuzzle = getActivePuzzle();
    elements.puzzleSelect.innerHTML = "";
    elements.puzzleSelectMenu.innerHTML = "";

    state.puzzles.forEach((puzzle) => {
        const option = document.createElement("option");
        const label = getPuzzleDisplayLabel(puzzle);
        option.value = puzzle.id;
        option.textContent = label;
        elements.puzzleSelect.append(option);

        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "select-option";
        optionButton.setAttribute("role", "option");
        optionButton.dataset.value = puzzle.id;
        optionButton.textContent = label;
        const isActive = puzzle.id === currentValue;
        optionButton.classList.toggle("is-active", isActive);
        optionButton.setAttribute("aria-selected", String(isActive));
        optionButton.addEventListener("click", () => {
            setActivePuzzle(puzzle.id);
            closePuzzleSelectMenu();
        });
        elements.puzzleSelectMenu.append(optionButton);
    });

    elements.puzzleSelect.value = currentValue;
    elements.puzzleSelectCurrent.textContent = "Choose Puzzle";
    if (elements.activePuzzleNote) {
        elements.activePuzzleNote.textContent = activePuzzle
            ? `Current puzzle: ${getPuzzleDisplayLabel(activePuzzle)}`
            : "Current puzzle: None selected";
    }
    elements.puzzleSelectButton.setAttribute("aria-expanded", String(state.puzzleSelectOpen));
    elements.puzzleSelectMenu.hidden = !state.puzzleSelectOpen;
    elements.puzzleSelectWrap.classList.toggle("is-open", state.puzzleSelectOpen);
}

function renderWordDisplay() {
    const currentText = state.currentWord.toUpperCase();
    elements.wordDisplay.innerHTML = "";

    if (currentText) {
        const wordNode = document.createElement("span");
        wordNode.textContent = currentText;
        elements.wordDisplay.append(wordNode);
    }

    const caret = document.createElement("span");
    caret.className = "entry-caret";
    caret.setAttribute("aria-hidden", "true");
    elements.wordDisplay.append(caret);
}

function renderBoard(boardButtons, puzzle, outerOrder) {
    if (!puzzle) {
        return;
    }

    const slotMap = {
        top: outerOrder[0],
        "upper-left": outerOrder[1],
        "upper-right": outerOrder[2],
        center: puzzle.center,
        "lower-left": outerOrder[3],
        "lower-right": outerOrder[4],
        bottom: outerOrder[5]
    };

    boardButtons.forEach((button) => {
        const slot = button.dataset.slot;
        const letter = slotMap[slot] || "?";
        button.textContent = letter.toUpperCase();
        button.dataset.letter = letter;

        if (button.tagName === "BUTTON") {
            button.setAttribute("aria-label", `Add ${letter.toUpperCase()}`);
        }
    });
}

function renderPlayLetters(puzzle) {
    if (!elements.playLetters || !elements.playLetterTiles.length) {
        return;
    }

    if (!puzzle) {
        elements.playLetterTiles.forEach((tile) => {
            tile.textContent = "?";
        });
        return;
    }

    const outerLetters = state.outerOrder.length === 6 ? state.outerOrder : getOuterLetters(puzzle);
    renderBoard(elements.playLetterTiles, puzzle, outerLetters);
}

function renderStats() {
    const puzzle = getActivePuzzle();
    if (!puzzle) {
        return;
    }

    const foundWords = getFoundWords(puzzle.id);
    const totalScore = calculateMaxScore(puzzle);
    const currentScore = calculateFoundScore(foundWords, puzzle);
    const pangramsFound = foundWords.filter((word) => isPangram(word, puzzle.letters)).length;
    const totalPangrams = puzzle.words.filter((word) => isPangram(word, puzzle.letters)).length;
    const pangramsDisplay = `${pangramsFound} / ${totalPangrams}`;
    const progress = totalScore ? Math.round((currentScore / totalScore) * 100) : 0;
    const rankDetails = getNextRankDetails(currentScore, totalScore);
    const rankLadder = getRankLadder(currentScore, totalScore);

    elements.wordsFoundValue.textContent = String(foundWords.length);
    elements.scoreValue.textContent = String(currentScore);
    elements.pangramsValue.textContent = pangramsDisplay;
    elements.rankValue.textContent = rankDetails.currentRank;
    elements.scoreMeta.textContent = `${currentScore} of ${totalScore} points`;
    elements.progressPercent.textContent = `${progress}%`;
    elements.progressBar.style.width = `${progress}%`;
    elements.foundCountBadge.textContent = String(foundWords.length);
    if (elements.mobileRankValue) {
        elements.mobileRankValue.textContent = rankDetails.currentRank;
    }
    if (elements.mobileScoreValue) {
        elements.mobileScoreValue.textContent = `${currentScore} point${currentScore === 1 ? "" : "s"}`;
    }
    if (elements.mobileProgressBar) {
        elements.mobileProgressBar.style.width = `${progress}%`;
    }
    if (elements.mobileProgressNote) {
        elements.mobileProgressNote.textContent = rankDetails.nextRank
            ? `${rankDetails.pointsToNext} point${rankDetails.pointsToNext === 1 ? "" : "s"} to ${rankDetails.nextRank}`
            : "Queen Bee reached";
    }
    if (elements.mobileFoundCount) {
        elements.mobileFoundCount.textContent = String(foundWords.length);
    }
    if (elements.mobilePangramCount) {
        elements.mobilePangramCount.textContent = pangramsDisplay;
    }
    if (elements.mobileUtilityPanel) {
        elements.mobileUtilityPanel.hidden = false;
    }
    elements.rankCard.setAttribute("aria-expanded", String(state.rankDetailOpen));
    elements.rankDetail.textContent = rankDetails.nextRank
        ? `${rankDetails.pointsToNext} point${rankDetails.pointsToNext === 1 ? "" : "s"} to ${rankDetails.nextRank}`
        : "Queen Bee reached";
    elements.rankMenuCurrent.textContent = rankDetails.currentRank;
    elements.rankMenu.hidden = !state.rankDetailOpen;
    elements.rankDropdown.classList.toggle("is-open", state.rankDetailOpen);
    renderRankBreakdown(elements.rankBreakdown, rankLadder, rankDetails.currentRank);
    if (elements.mobileRankMenuCurrent) {
        elements.mobileRankMenuCurrent.textContent = rankDetails.currentRank;
    }
    renderRankBreakdown(elements.mobileRankBreakdown, rankLadder, rankDetails.currentRank);
    renderMobilePanel();

    renderFoundWords(foundWords, puzzle);
}

function renderRankBreakdown(container, rankLadder, currentRank) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    rankLadder.forEach((rank) => {
        const item = document.createElement("div");
        item.className = "rank-breakdown-row";

        if (rank.label === currentRank) {
            item.classList.add("is-current");
        }

        if (rank.reached) {
            item.classList.add("is-reached");
        }

        const label = document.createElement("span");
        label.className = "rank-breakdown-label";
        label.textContent = rank.label;

        const status = document.createElement("span");
        status.className = "rank-breakdown-status";
        status.textContent = rank.reached
            ? "Reached"
            : `${rank.pointsAway} point${rank.pointsAway === 1 ? "" : "s"} away`;

        item.append(label, status);
        container.append(item);
    });
}

function renderFoundWords(foundWords, puzzle) {
    renderFoundWordList(
        elements.foundWords,
        foundWords,
        puzzle,
        "No words found yet. Click letters or type on your keyboard."
    );
    renderFoundWordList(
        elements.mobileFoundWords,
        foundWords,
        puzzle,
        "Start guessing words and they will appear here."
    );
}

function renderFoundWordList(container, foundWords, puzzle, emptyMessage) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!foundWords.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = emptyMessage;
        container.append(empty);
        return;
    }

    [...foundWords]
        .sort((left, right) => left.localeCompare(right))
        .forEach((word) => {
            const chip = document.createElement("div");
            chip.className = "word-chip";
            if (isPangram(word, puzzle.letters)) {
                chip.classList.add("is-pangram");
            }
            chip.textContent = word.toUpperCase();
            container.append(chip);
        });
}

function renderSavedPangrams() {
    elements.savedPangramList.innerHTML = "";

    if (!state.customPuzzles.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "Your custom pangrams will appear here after you save one.";
        elements.savedPangramList.append(empty);
        return;
    }

    [...state.customPuzzles]
        .reverse()
        .forEach((puzzle) => {
            const pangramCount = puzzle.words.filter((word) => isPangram(word, puzzle.letters)).length;
            const displayName = getPuzzleDisplayLabel(puzzle);

            const card = document.createElement("article");
            card.className = "saved-pangram-card";

            const title = document.createElement("h4");
            title.textContent = displayName;

            const meta = document.createElement("p");
            meta.className = "saved-pangram-meta";
            meta.textContent = `${puzzle.words.length} words | ${pangramCount} pangram${pangramCount === 1 ? "" : "s"}`;

            const actions = document.createElement("div");
            actions.className = "saved-pangram-actions";

            const playButton = document.createElement("button");
            playButton.type = "button";
            playButton.textContent = "Play";
            playButton.addEventListener("click", () => {
                setView("play");
                setActivePuzzle(puzzle.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "danger";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteCustomPangram(puzzle.id));

            actions.append(playButton, deleteButton);
            card.append(title, meta, actions);
            elements.savedPangramList.append(card);
        });
}

function renderPlay() {
    renderPuzzleSelect();
    renderWordDisplay();

    const puzzle = getActivePuzzle();
    renderPlayLetters(puzzle);
    renderBoard(elements.playBoardButtons, puzzle, state.outerOrder);
    renderStats();
}

function renderAll() {
    renderTabs();
    renderPlay();
    renderSavedPangrams();
}

function appendLetter(letter) {
    const puzzle = getActivePuzzle();
    if (!puzzle) {
        return;
    }

    if (!puzzle.letters.includes(letter)) {
        return;
    }

    state.currentWord += letter;
    renderWordDisplay();
}

function deleteLetter() {
    state.currentWord = state.currentWord.slice(0, -1);
    renderWordDisplay();
}

function burstConfetti(options = {}) {
    if (!elements.effectsLayer || !elements.playBoard) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const {
        count = 28,
        spreadX = 280,
        peakY = 120,
        endXSpread = 360,
        endYBase = 120,
        endYSpread = 170,
        cleanupMs = 1400,
        celebrationMs = 900
    } = options;

    window.clearTimeout(confettiCleanupTimer);
    window.clearTimeout(celebrationStateTimer);
    elements.effectsLayer.querySelectorAll(".confetti-piece").forEach((piece) => piece.remove());

    const boardRect = elements.playBoard.getBoundingClientRect();
    const originX = boardRect.left + boardRect.width / 2;
    const originY = boardRect.top + boardRect.height / 2 - 10;

    for (let index = 0; index < count; index += 1) {
        const piece = document.createElement("span");
        const burstX = `${Math.round((Math.random() - 0.5) * spreadX)}px`;
        const midY = `${Math.round(-70 - Math.random() * peakY)}px`;
        const endX = `${Math.round((Math.random() - 0.5) * endXSpread)}px`;
        const endY = `${Math.round(endYBase + Math.random() * endYSpread)}px`;
        const size = `${8 + Math.round(Math.random() * 8)}px`;
        const rotation = `${Math.round((Math.random() - 0.5) * 540)}deg`;
        const midRotation = `${Math.round((Math.random() - 0.5) * 260)}deg`;

        piece.className = "confetti-piece";
        piece.style.left = `${originX}px`;
        piece.style.top = `${originY}px`;
        piece.style.width = size;
        piece.style.height = `${Math.max(6, Math.round(parseInt(size, 10) * 0.66))}px`;
        piece.style.background = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
        piece.style.setProperty("--burst-x", burstX);
        piece.style.setProperty("--mid-y", midY);
        piece.style.setProperty("--end-x", endX);
        piece.style.setProperty("--end-y", endY);
        piece.style.setProperty("--rotation", rotation);
        piece.style.setProperty("--mid-rotation", midRotation);
        piece.style.animationDelay = `${Math.random() * 0.08}s`;

        if (index % 3 === 0) {
            piece.style.borderRadius = "999px";
        }

        elements.effectsLayer.append(piece);
    }

    elements.playPanel.classList.add("is-celebrating");

    celebrationStateTimer = window.setTimeout(() => {
        elements.playPanel.classList.remove("is-celebrating");
    }, celebrationMs);

    confettiCleanupTimer = window.setTimeout(() => {
        elements.effectsLayer.querySelectorAll(".confetti-piece").forEach((piece) => piece.remove());
    }, cleanupMs);
}

function getBeeSvgMarkup(uniqueId) {
    return `
        <svg viewBox="0 0 180 170" aria-hidden="true" focusable="false">
            <g fill="none" stroke="#181410" stroke-width="6" stroke-linecap="round">
                <path d="M78 34 C72 16, 60 8, 50 12" />
                <path d="M102 34 C108 16, 120 8, 130 12" />
            </g>
            <g class="rank-bee-wing rank-bee-wing--left">
                <ellipse cx="46" cy="78" rx="32" ry="18" fill="rgba(255,255,255,0.88)" stroke="#181410" stroke-width="6" />
            </g>
            <g class="rank-bee-wing rank-bee-wing--right">
                <ellipse cx="134" cy="78" rx="32" ry="18" fill="rgba(255,255,255,0.88)" stroke="#181410" stroke-width="6" />
            </g>
            <ellipse cx="90" cy="48" rx="22" ry="20" fill="#181410" />
            <defs>
                <clipPath id="rankBeeBody${uniqueId}">
                    <path d="M90 62 C69 62 57 80 57 103 C57 126 71 145 90 153 C109 145 123 126 123 103 C123 80 111 62 90 62 Z" />
                </clipPath>
            </defs>
            <path d="M90 62 C69 62 57 80 57 103 C57 126 71 145 90 153 C109 145 123 126 123 103 C123 80 111 62 90 62 Z" fill="#181410" />
            <g clip-path="url(#rankBeeBody${uniqueId})">
                <rect x="61" y="82" width="58" height="11" rx="5.5" fill="#f7cf39" />
                <rect x="59" y="99" width="62" height="11" rx="5.5" fill="#f7cf39" />
                <rect x="63" y="116" width="54" height="11" rx="5.5" fill="#f7cf39" />
            </g>
            <path d="M90 153 L81 166 L99 166 Z" fill="#181410" />
        </svg>
    `;
}

function flyRankBees(options = {}) {
    if (!elements.effectsLayer) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const {
        gainedRanks = 1,
        cleanupMs = 2600
    } = options;

    const count = Math.min(7, Math.max(3, 3 + gainedRanks));
    const bandTop = Math.max(72, window.innerHeight * 0.14);
    const bandHeight = Math.min(320, window.innerHeight * 0.42);
    const spacingDivisor = count > 1 ? count - 1 : 1;

    window.clearTimeout(beeCleanupTimer);
    elements.effectsLayer.querySelectorAll(".rank-bee").forEach((bee) => bee.remove());

    for (let index = 0; index < count; index += 1) {
        const bee = document.createElement("span");
        const startY = Math.round(bandTop + (bandHeight / spacingDivisor) * index + (Math.random() - 0.5) * 28);
        const midY = startY + Math.round((Math.random() - 0.5) * 54);
        const endY = startY + Math.round((Math.random() - 0.5) * 88);
        const scale = (0.72 + Math.random() * 0.28).toFixed(2);
        const startRotate = `${Math.round(-12 + Math.random() * 8)}deg`;
        const midRotate = `${Math.round(-2 + Math.random() * 12)}deg`;
        const endRotate = `${Math.round(-10 + Math.random() * 20)}deg`;
        const duration = `${(1.75 + Math.random() * 0.55).toFixed(2)}s`;
        const uniqueId = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;

        bee.className = "rank-bee";
        bee.innerHTML = getBeeSvgMarkup(uniqueId);
        bee.style.setProperty("--bee-start-y", `${startY}px`);
        bee.style.setProperty("--bee-mid-y", `${midY}px`);
        bee.style.setProperty("--bee-end-y", `${endY}px`);
        bee.style.setProperty("--bee-scale", scale);
        bee.style.setProperty("--bee-rotate-start", startRotate);
        bee.style.setProperty("--bee-rotate-mid", midRotate);
        bee.style.setProperty("--bee-rotate-end", endRotate);
        bee.style.setProperty("--bee-duration", duration);
        bee.style.animationDelay = `${(index * 0.12 + Math.random() * 0.08).toFixed(2)}s`;

        elements.effectsLayer.append(bee);
    }

    beeCleanupTimer = window.setTimeout(() => {
        elements.effectsLayer.querySelectorAll(".rank-bee").forEach((bee) => bee.remove());
    }, cleanupMs);
}

function completeSubmission(message, tone, options = {}) {
    state.currentWord = "";
    setStatus(message, tone);
    renderPlay();

    if (options.rankUp) {
        flyRankBees(options.rankUp);
    }

    if (options.celebrate) {
        burstConfetti(options.confetti);
    }
}

function shuffleOuterLetters() {
    const nextOrder = [...state.outerOrder];

    for (let index = nextOrder.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [nextOrder[index], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[index]];
    }

    state.outerOrder = nextOrder;
    renderPlay();
}

function submitWord() {
    const puzzle = getActivePuzzle();
    if (!puzzle) {
        return;
    }

    const word = state.currentWord.toLowerCase();
    const foundWords = getFoundWords(puzzle.id);
    const totalScore = calculateMaxScore(puzzle);
    const previousScore = calculateFoundScore(foundWords, puzzle);
    const previousRank = getRank(previousScore, totalScore);
    const previousRankIndex = RANKS.findIndex((rank) => rank.label === previousRank);

    if (word.length < 4) {
        completeSubmission("Words must be at least four letters long.", "error");
        return;
    }

    if (!word.includes(puzzle.center)) {
        completeSubmission(`Every word must include ${puzzle.center.toUpperCase()}.`, "error");
        return;
    }

    if (![...word].every((letter) => puzzle.letters.includes(letter))) {
        completeSubmission("That word uses letters outside this pangram.", "error");
        return;
    }

    if (!puzzle.words.includes(word)) {
        completeSubmission("This is not a word", "error");
        return;
    }

    if (foundWords.includes(word)) {
        completeSubmission("Already found.", "info");
        return;
    }

    const nextFoundWords = [...foundWords, word];
    const nextScore = previousScore + scoreWord(word, puzzle.letters);
    const nextRank = getRank(nextScore, totalScore);
    const nextRankIndex = RANKS.findIndex((rank) => rank.label === nextRank);
    const rankUp =
        nextRankIndex > previousRankIndex
            ? { gainedRanks: nextRankIndex - previousRankIndex, rank: nextRank }
            : null;

    state.progress[puzzle.id] = nextFoundWords;
    saveProgress();

    if (nextFoundWords.length === puzzle.words.length) {
        completeSubmission("Queen Bee!", "success", {
            rankUp,
            celebrate: true,
            confetti: {
                count: 96,
                spreadX: 420,
                peakY: 180,
                endXSpread: 520,
                endYBase: 150,
                endYSpread: 240,
                celebrationMs: 1300,
                cleanupMs: 1900
            }
        });
        return;
    }

    if (isPangram(word, puzzle.letters)) {
        completeSubmission("Pangram!", "success", { celebrate: true, rankUp });
    } else {
        completeSubmission(`Nice find: ${word.toUpperCase()}.`, "success", { rankUp });
    }
}

function validateCreatorForm() {
    const letters = uniqueCharacters(normalizeLetters(elements.lettersInput.value));
    const center = normalizeLetters(elements.centerInput.value).slice(0, 1);

    if (letters.length !== 7) {
        return { error: "Enter exactly seven unique letters for the pangram." };
    }

    if (!center || !letters.includes(center)) {
        return { error: "Choose one center letter from the seven letters in the pangram." };
    }

    if (!WORD_BANK.length) {
        return { error: "The built-in dictionary is unavailable, so this pangram cannot be generated right now." };
    }

    const letterArray = letters.split("");
    const words = generateWordsForPangram(letterArray, center);

    if (!words.length) {
        return { error: "This pangram does not generate any accepted words in the built-in dictionary." };
    }

    const pangrams = words.filter((word) => isPangram(word, letterArray));

    if (!pangrams.length) {
        return { error: "This custom pangram needs at least one pangram before it can be saved." };
    }

    return {
        puzzle: {
            id: `custom-${Date.now()}`,
            title: `Custom Pangram ${state.customPuzzles.length + 1}`,
            letters: letterArray,
            center,
            words
        }
    };
}

function clearCreatorForm() {
    elements.creatorForm.reset();
    setCreatorMessage("Enter seven unique letters and choose the center letter.", "neutral");
}

function saveCreatorPuzzle(event) {
    event.preventDefault();
    const result = validateCreatorForm();

    if (result.error) {
        setCreatorMessage(result.error, "error");
        return;
    }

    state.customPuzzles = [...state.customPuzzles, result.puzzle];
    saveCustomPuzzles();
    state.puzzles = [...DEFAULT_PUZZLES, ...state.customPuzzles];
    const pangramCount = result.puzzle.words.filter((word) => isPangram(word, result.puzzle.letters)).length;
    const displayName = getPuzzleDisplayLabel(result.puzzle);
    clearCreatorForm();
    setView("play");
    setActivePuzzle(result.puzzle.id);
    setCreatorMessage(
        `Saved ${displayName} with ${result.puzzle.words.length} accepted words and ${pangramCount} pangram${pangramCount === 1 ? "" : "s"}.`,
        "success"
    );
    renderAll();
}

function deleteCustomPangram(puzzleId) {
    const puzzle = state.customPuzzles.find((item) => item.id === puzzleId);
    if (!puzzle) {
        return;
    }

    const displayName = getPuzzleDisplayLabel(puzzle);
    const shouldDelete = window.confirm(`Delete ${displayName}? This removes it from this browser.`);
    if (!shouldDelete) {
        return;
    }

    state.customPuzzles = state.customPuzzles.filter((item) => item.id !== puzzleId);
    delete state.progress[puzzleId];
    saveCustomPuzzles();
    state.puzzles = [...DEFAULT_PUZZLES, ...state.customPuzzles];
    saveProgress();

    if (state.activePuzzleId === puzzleId) {
        ensureActivePuzzle();
    }

    setCreatorMessage(`Deleted ${displayName}.`, "info");
    renderAll();
}

function clearCurrentProgress() {
    const puzzle = getActivePuzzle();
    if (!puzzle) {
        return;
    }

    if (!getFoundWords(puzzle.id).length) {
        setStatus("There is no saved progress to clear for this pangram yet.", "info");
        return;
    }

    const displayName = getPuzzleDisplayLabel(puzzle);
    const shouldReset = window.confirm(`Clear your progress for ${displayName}?`);
    if (!shouldReset) {
        return;
    }

    delete state.progress[puzzle.id];
    saveProgress();
    state.currentWord = "";
    setStatus(`Progress cleared for ${displayName}.`, "info");
    renderPlay();
}

function shouldIgnoreKeydown(event) {
    const activeElement = document.activeElement;
    if (!activeElement) {
        return false;
    }

    const tagName = activeElement.tagName;
    const isEditable = activeElement.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(tagName);
    const isPuzzlePickerFocused = !!(elements.puzzleSelectWrap && elements.puzzleSelectWrap.contains(activeElement));
    return isEditable || isPuzzlePickerFocused || state.view !== "play";
}

function handleKeyboard(event) {
    if (shouldIgnoreKeydown(event)) {
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();
        deleteLetter();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        submitWord();
        return;
    }

    if (event.key === " ") {
        event.preventDefault();
        shuffleOuterLetters();
        return;
    }

    if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        appendLetter(event.key.toLowerCase());
    }
}

function attachEvents() {
    elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setView(button.dataset.view);
        });
    });

    elements.puzzleSelect.addEventListener("change", (event) => {
        setActivePuzzle(event.target.value);
    });
    elements.puzzleSelectButton.addEventListener("click", () => {
        state.puzzleSelectOpen = !state.puzzleSelectOpen;
        renderPuzzleSelect();
    });

    elements.playBoardButtons.forEach((button) => {
        button.addEventListener("click", () => {
            appendLetter(button.dataset.letter);
        });
    });

    elements.deleteButton.addEventListener("click", deleteLetter);
    elements.shuffleButton.addEventListener("click", shuffleOuterLetters);
    elements.enterButton.addEventListener("click", submitWord);
    elements.resetProgressButton.addEventListener("click", clearCurrentProgress);
    elements.rankCard.addEventListener("click", () => {
        state.rankDetailOpen = !state.rankDetailOpen;
        renderStats();
    });
    elements.mobileUtilityTabs.forEach((button) => {
        button.addEventListener("click", () => {
            setMobilePanel(button.dataset.mobilePanel);
        });
    });
    elements.creatorForm.addEventListener("submit", saveCreatorPuzzle);
    elements.clearCreatorButton.addEventListener("click", clearCreatorForm);
    document.addEventListener("click", (event) => {
        if (state.rankDetailOpen && !elements.rankDropdown.contains(event.target)) {
            closeRankMenu();
        }

        if (state.puzzleSelectOpen && !elements.puzzleSelectWrap.contains(event.target)) {
            closePuzzleSelectMenu();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeRankMenu();
            closePuzzleSelectMenu();
        }
    });
    window.addEventListener("hashchange", () => {
        state.view = getViewFromHash();
        state.rankDetailOpen = false;
        state.puzzleSelectOpen = false;
        renderTabs();
    });
    document.addEventListener("keydown", handleKeyboard);
}

function init() {
    hydratePuzzles();
    hydrateProgress();
    ensureActivePuzzle();
    state.view = getViewFromHash();
    attachEvents();
    renderAll();
}

init();
