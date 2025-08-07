const geographyQuestions = [
  {
    text: "What is the largest continent by area?",
    options: [
      { text: "Asia", isCorrect: true },
      { text: "Africa", isCorrect: false },
      { text: "North America", isCorrect: false },
      { text: "Europe", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "Asia is the largest continent, covering about 30% of Earth's land area."
  },
  {
    text: "Which is the longest river in the world?",
    options: [
      { text: "Nile River", isCorrect: true },
      { text: "Amazon River", isCorrect: false },
      { text: "Mississippi River", isCorrect: false },
      { text: "Yangtze River", isCorrect: false },
    ],
    difficulty: "Medium",
    explanation: "The Nile River in Africa is approximately 6,650 km long."
  },
  {
    text: "How many oceans are there on Earth?",
    options: [
      { text: "5", isCorrect: true },
      { text: "4", isCorrect: false },
      { text: "7", isCorrect: false },
      { text: "3", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "There are 5 oceans: Pacific, Atlantic, Indian, Southern, and Arctic."
  },
  {
    text: "What is the capital of Australia?",
    options: [
      { text: "Canberra", isCorrect: true },
      { text: "Sydney", isCorrect: false },
      { text: "Melbourne", isCorrect: false },
      { text: "Brisbane", isCorrect: false },
    ],
    difficulty: "Medium",
    explanation: "Canberra is the capital city of Australia, not Sydney as commonly thought."
  },
  {
    text: "Which country has the most time zones?",
    options: [
      { text: "France", isCorrect: true },
      { text: "Russia", isCorrect: false },
      { text: "USA", isCorrect: false },
      { text: "China", isCorrect: false },
    ],
    difficulty: "Hard",
    explanation: "France has 12 time zones due to its overseas territories."
  },
  {
    text: "What is the smallest country in the world?",
    options: [
      { text: "Vatican City", isCorrect: true },
      { text: "Monaco", isCorrect: false },
      { text: "San Marino", isCorrect: false },
      { text: "Liechtenstein", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "Vatican City is the smallest country with an area of 0.44 square kilometers."
  },
  {
    text: "Which desert is the largest in the world?",
    options: [
      { text: "Antarctica", isCorrect: true },
      { text: "Sahara", isCorrect: false },
      { text: "Arabian", isCorrect: false },
      { text: "Gobi", isCorrect: false },
    ],
    difficulty: "Hard",
    explanation: "Antarctica is technically the largest desert as it receives very little precipitation."
  },
  {
    text: "Mount Everest is located on the border of which two countries?",
    options: [
      { text: "Nepal and China", isCorrect: true },
      { text: "India and Nepal", isCorrect: false },
      { text: "India and China", isCorrect: false },
      { text: "Pakistan and China", isCorrect: false },
    ],
    difficulty: "Medium",
    explanation: "Mount Everest sits on the border between Nepal and Tibet (China)."
  },
  {
    text: "Which line divides the Earth into Northern and Southern hemispheres?",
    options: [
      { text: "Equator", isCorrect: true },
      { text: "Prime Meridian", isCorrect: false },
      { text: "Tropic of Cancer", isCorrect: false },
      { text: "Tropic of Capricorn", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "The Equator is at 0° latitude and divides Earth into Northern and Southern hemispheres."
  },
  {
    text: "What percentage of Earth's surface is covered by water?",
    options: [
      { text: "71%", isCorrect: true },
      { text: "60%", isCorrect: false },
      { text: "80%", isCorrect: false },
      { text: "50%", isCorrect: false },
    ],
    difficulty: "Medium",
    explanation: "Approximately 71% of Earth's surface is covered by water."
  }
];

module.exports = geographyQuestions;
