# 📱 Local-First Leitner Quiz App

A distraction-free, zero-overhead spaced repetition flashcard application optimized for mobile and desktop browsers. This app is designed to help you achieve 100% mastery over massive question banks using the **Leitner Box System** without relying on external servers, cloud databases, or subscription fees.

---

## 🚀 Key Features

* **100% Local & Private:** Your questions and your learning progress never leave your device. Parsing and state tracking happen entirely inside your browser.
* **Automated Scoring:** No clunky manual buttons. Tap your multiple-choice or True/False answer, and the app instantly evaluates your response, updates your Leitner schedule, and advances.
* **Smart Interleaving (Randomization):** The app filters out which cards are strictly due for review based on your schedule, then shuffles them randomly so your brain learns concepts rather than chronological patterns.
* **"All Domains" Mastery:** Study the entire 4,000+ question bank as one continuous deck, or use the domain selector to isolate specific sub-topics for targeted study sessions.
* **Zero-Cost Mobility:** Runs smoothly as a progressive web layer. Open it directly via local files or host it on free services like GitHub Pages.

---

## 🧠 The Leitner Learning Engine

The app automatically categorizes questions into **3 distinct boxes** to optimize memory retention. Each box dictates how long the app waits before testing you on that specific card again:

| Box Level | Retention Difficulty | Review Interval | Scoring Behavior |
| --- | --- | --- | --- |
| **Box 1** | New / Frequently Missed | Everyday ($24\text{ hours}$) | Cards drop here immediately on *any* incorrect answer. |
| **Box 2** | Moderate Mastery | Every 3 Days ($72\text{ hours}$) | Moved here automatically after answering a Box 1 card correctly. |
| **Box 3** | Full Mastery | Every 5 Days ($120\text{ hours}$) | The ultimate goal. Cards stay here unless missed. |

---

## 📋 Required JSON Import Format

The application expects a single file (e.g., `quiz_data.json`) containing a unified **JSON Array of Objects**. Both Multiple Choice and True/False questions must follow this exact key-value schema:

```json
[
  {
    "id": "q_0001",
    "domain": "Domain 1: Security and Risk Management",
    "type": "multiple_choice",
    "question": "Which security concept ensures that data is modified only by authorized users?",
    "options": [
      "Availability", 
      "Integrity", 
      "Confidentiality", 
      "Non-repudiation"
    ],
    "correct_answer": "Integrity"
  },
  {
    "id": "q_0002",
    "domain": "Domain 4: Communication and Network Security",
    "type": "true_false",
    "question": "A firewall operates exclusively at Layer 7 of the OSI model.",
    "options": [
      "True", 
      "False"
    ],
    "correct_answer": "False"
  }
]

```

### Data Field Specifications

* `id` *(String)*: A strictly unique identifier for every single question (used to map your progress tracking).
* `domain` *(String)*: The categorical chapter or topic name.
* `type` *(String)*: Set explicitly to either `"multiple_choice"` or `"true_false"`.
* `question` *(String)*: The core question text prompt.
* `options` *(Array of Strings)*: All available text choices presented to the user. For True/False questions, this must be exactly `["True", "False"]`.
* `correct_answer` *(String)*: The exact text matching the correct choice option.

---

## 🛠️ Project File Architecture

The frontend application consists of just three ultra-lightweight files:

```text
app/
├── index.html   # Semantic, responsive skeleton & viewport control
├── styles.css   # Mobile-first design, large thumb-tap targets, active states
└── app.js       # FileReader engine, Fisher-Yates randomizer, LocalStorage sync

```

---

## 📖 How To Use It

### 1. Initial Launch

1. Ensure you have converted your quiz files into the unified `.json` list format shown above using your companion Python parser.
2. Open `index.html` in any modern desktop or mobile browser.

### 2. Importing Your Questions

1. Tap the **Upload JSON** button at the top of the interface.
2. Select your compiled `quiz_data.json` file.
3. The application will instantly load all questions into active browser memory and populate your progress dashboard.

### 3. Studying & Reviewing

* Select your target domain from the dropdown (or leave it on **All Domains** for full-pool interleaving).
* Read the prompt and tap your answer choice.
* The system will flash **Green** for success or **Red** for a mistake while illuminating the correct answer text.
* Once the due queue is cleared for the day, the app will show an **All Caught Up!** victory screen.

---

## 💾 Technical Notes & State Persistence

> ⚠️ **Important Data Notice:** Your base question bank is loaded dynamically via your JSON file, but your **spaced-repetition tracking progress is saved natively inside the browser's `LocalStorage`**.
> Clearing your browser's cookies, site data, or cache for this app will reset your Leitner boxes back to Box 1. To keep your progress safe, avoid clearing your browser storage or use a dedicated browser profile for your study sessions.

---

## 📲 Setup for Mobile ("Anywhere, Anytime")

Because this app requires zero server backends, you can carry it with you on your phone using these two quick methods:

* **Method A (Cloud Storage):** Drop your `app/` folder into your iCloud Drive, Google Drive, or Dropbox. Open your cloud storage app on your mobile phone, tap `index.html`, and run it instantly as a local web page.
> 💡 **Crucial Google Drive Tip:** If you use Google Drive, you **must turn off automatic file conversion** in your account settings before uploading your `quiz_data.json`. If this setting is left enabled, Google Drive will automatically transform your raw JSON file into a Google Doc spreadsheet format, breaking the file extension and preventing the web app from reading it. Go to `Google Drive Settings -> General` and uncheck **"Convert uploads to Google Docs editor format"**.


* **Method B (GitHub Pages):** Push these three files to a free repository on GitHub, toggle **GitHub Pages** on inside your repository settings, and bookmark your private HTTPS link directly to your mobile phone's home screen.