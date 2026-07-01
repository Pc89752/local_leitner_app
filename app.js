// --- State Management ---
let allFlashcards = [];
let activeFlashcards = [];
let currentCardIndex = 0;
let leitnerProgress = {};

// --- Leitner System Constants ---
const BOX_SCHEDULE_HOURS = {
  1: 24,
  2: 72,
  3: 120,
};

// --- DOM Elements ---
const jsonUploader = document.getElementById("json-uploader");
const domainSelect = document.getElementById("domain-select");
const progressTracker = document.getElementById("progress-tracker");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const box1Count = document.getElementById("box1-count");
const box2Count = document.getElementById("box2-count");
const box3Count = document.getElementById("box3-count");

// --- App Initialization Pipeline ---
loadProgress();
loadCachedDeck();

// File Uploader Event Listener
jsonUploader.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        allFlashcards = parsedData;

        try {
          localStorage.setItem("cached_flashcard_deck", e.target.result);
        } catch (storageError) {
          console.warn(
            "Deck too large for LocalStorage. Running in-memory.",
            storageError
          );
        }

        setupFilters();
        filterCardsAndRefreshDeck();
      } else {
        alert("Invalid format: Expected an array of flashcards.");
      }
    } catch (error) {
      alert("Error parsing JSON file. Please ensure it is valid JSON.");
    }
  };
  reader.readAsText(file);
});

function loadCachedDeck() {
  const cachedDeck = localStorage.getItem("cached_flashcard_deck");
  if (cachedDeck) {
    try {
      allFlashcards = JSON.parse(cachedDeck);
      if (allFlashcards.length > 0) {
        setupFilters();
        filterCardsAndRefreshDeck();
      }
    } catch (e) {
      console.error("Failed to parse cached deck. Clearing data.", e);
      localStorage.removeItem("cached_flashcard_deck");
    }
  }
}

function setupFilters() {
  const domains = [
    ...new Set(allFlashcards.map((card) => card.domain).filter(Boolean)),
  ];
  domainSelect.innerHTML = '<option value="all">All Domains</option>';
  domains.forEach((domain) => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    domainSelect.appendChild(option);
  });
}

domainSelect.addEventListener("change", () => {
  filterCardsAndRefreshDeck();
});

function filterCardsAndRefreshDeck() {
  const selectedDomain = domainSelect.value;

  const domainCards =
    selectedDomain === "all"
      ? [...allFlashcards]
      : allFlashcards.filter((card) => card.domain === selectedDomain);

  const dueCards = domainCards.filter((card) => getNextCard(card));

  activeFlashcards = shuffleDeck(dueCards);
  currentCardIndex = 0;

  showQuestion(currentCardIndex);
  updateDashboard(); // Dynamic dashboard update on card transitions
}

function shuffleDeck(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

// --- Leitner State Handling Functions ---
function loadProgress() {
  const stored = localStorage.getItem("leitner_progress");
  if (stored) {
    try {
      leitnerProgress = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing progress.", e);
      leitnerProgress = {};
    }
  } else {
    leitnerProgress = {};
  }
  updateDashboard();
}

function saveProgress(questionId, isCorrect) {
  const now = Date.now();
  let currentRecord = leitnerProgress[questionId] || { box: 1, next_review: 0 };
  let targetBox = currentRecord.box;

  if (isCorrect) {
    targetBox = Math.min(3, currentRecord.box + 1);
  } else {
    targetBox = 1;
  }

  const intervalsInMs = BOX_SCHEDULE_HOURS[targetBox] * 60 * 60 * 1000;
  const computedNextReview = now + intervalsInMs;

  leitnerProgress[questionId] = {
    box: targetBox,
    next_review: computedNextReview,
  };

  localStorage.setItem("leitner_progress", JSON.stringify(leitnerProgress));
  updateDashboard(); // Refresh metrics instantly upon choice logging
}

function getNextCard(card) {
  const record = leitnerProgress[card.id];
  if (!record) return true;
  return record.next_review <= Date.now();
}

// --- Quality-of-Life Dashboard Update ---
function updateDashboard() {
  let counts = { 1: 0, 2: 0, 3: 0 };

  // Scan all logged entries inside local storage footprint
  for (let id in leitnerProgress) {
    const boxNumber = leitnerProgress[id].box;
    if (counts[boxNumber] !== undefined) {
      counts[boxNumber]++;
    }
  }

  // Inject current metrics down to the screen counters
  box1Count.textContent = counts[1];
  box2Count.textContent = counts[2];
  box3Count.textContent = counts[3];
}

// TODO: Change the options' format
// --- Rendering Flow ---
function showQuestion(index) {
  // Quality-of-Life Check: Handle empty/cleared states gracefully
  if (
    !activeFlashcards ||
    activeFlashcards.length === 0 ||
    index >= activeFlashcards.length
  ) {
    if (allFlashcards.length > 0) {
      questionText.innerHTML = `<div class="victory-title">🎉 All Clear!</div>
                                      <div class="victory-subtitle">You are fully caught up for now. Check back later for your scheduled reviews.</div>`;
    } else {
      questionText.textContent =
        "Please upload a valid JSON file to get started.";
    }
    optionsContainer.innerHTML = "";
    nextBtn.hidden = true;
    updateProgress();
    return;
  }

  const currentCard = activeFlashcards[index];
  optionsContainer.innerHTML = "";
  nextBtn.hidden = true;

  questionText.textContent = currentCard.question;

  if (currentCard.options && Array.isArray(currentCard.options)) {
    currentCard.options.forEach((optionText, ind) => {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.textContent = optionText;
      button.value = ind;

      button.addEventListener("click", () =>
        handleOptionSelection(button, currentCard)
      );
      optionsContainer.appendChild(button);
    });
  }
  updateProgress();
}

// TODO: Change the options' format
// --- Instant Scoring Pipeline Logic ---
function handleOptionSelection(selectedButton, currentCard) {
  const options = optionsContainer.querySelectorAll(".option-btn");
  options.forEach((btn) => (btn.disabled = true));

  const chosenNo = parseInt(selectedButton.value);
  const ansNo = currentCard.ans_no;
  const isCorrect = ansNo === chosenNo;

  saveProgress(currentCard.id, isCorrect);

  if (isCorrect) {
    selectedButton.classList.add("correct-flash");
    setTimeout(() => {
      advanceDeck();
    }, 1000);
  } else {
    selectedButton.classList.add("incorrect-flash");

    options.forEach((btn) => {
      if (btn.value === ansNo) {
        btn.classList.add("correct-flash");
      }
    });

    nextBtn.hidden = false;
  }
}

nextBtn.addEventListener("click", () => {
  advanceDeck();
});

function advanceDeck() {
  filterCardsAndRefreshDeck();
}

function updateProgress() {
  const totalDue = activeFlashcards.length;
  const remaining = totalDue - currentCardIndex;
  progressTracker.textContent = `Cards remaining: ${
    remaining > 0 ? remaining.toLocaleString() : 0
  }`;
}