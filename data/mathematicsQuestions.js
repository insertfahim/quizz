const mathematicsQuestions = [
  {
    text: "What is the derivative of x²?",
    options: [
      { text: "2x", isCorrect: true },
      { text: "x²", isCorrect: false },
      { text: "2", isCorrect: false },
      { text: "x", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "The power rule states that the derivative of x^n is n*x^(n-1). For x², n=2, so the derivative is 2x."
  },
  {
    text: "What is the value of π (pi) to 2 decimal places?",
    options: [
      { text: "3.14", isCorrect: true },
      { text: "3.41", isCorrect: false },
      { text: "3.15", isCorrect: false },
      { text: "3.12", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "Pi (π) is approximately 3.14159..., which rounds to 3.14 to 2 decimal places."
  },
  {
    text: "What is the quadratic formula?",
    options: [
      { text: "x = (-b ± √(b²-4ac))/2a", isCorrect: true },
      { text: "x = (-b ± √(b²+4ac))/2a", isCorrect: false },
      { text: "x = (b ± √(b²-4ac))/2a", isCorrect: false },
      { text: "x = (-b ± √(b²-4ac))/a", isCorrect: false },
    ],
    difficulty: "Medium",
    explanation: "The quadratic formula solves ax² + bx + c = 0 for x."
  },
  {
    text: "What is the sum of angles in a triangle?",
    options: [
      { text: "180°", isCorrect: true },
      { text: "360°", isCorrect: false },
      { text: "90°", isCorrect: false },
      { text: "270°", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "The sum of all interior angles in any triangle is always 180 degrees."
  },
  {
    text: "What is the integral of 1/x?",
    options: [
      { text: "ln|x| + C", isCorrect: true },
      { text: "x + C", isCorrect: false },
      { text: "1/x² + C", isCorrect: false },
      { text: "e^x + C", isCorrect: false },
    ],
    difficulty: "Medium",
    explanation: "The integral of 1/x is the natural logarithm of the absolute value of x, plus a constant."
  },
  {
    text: "What is 15% of 200?",
    options: [
      { text: "30", isCorrect: true },
      { text: "15", isCorrect: false },
      { text: "35", isCorrect: false },
      { text: "25", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "15% of 200 = 0.15 × 200 = 30"
  },
  {
    text: "What is the Pythagorean theorem?",
    options: [
      { text: "a² + b² = c²", isCorrect: true },
      { text: "a + b = c", isCorrect: false },
      { text: "a² - b² = c²", isCorrect: false },
      { text: "a × b = c²", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides."
  },
  {
    text: "What is the factorial of 5 (5!)?",
    options: [
      { text: "120", isCorrect: true },
      { text: "25", isCorrect: false },
      { text: "100", isCorrect: false },
      { text: "60", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120"
  },
  {
    text: "What is the slope of a horizontal line?",
    options: [
      { text: "0", isCorrect: true },
      { text: "1", isCorrect: false },
      { text: "Undefined", isCorrect: false },
      { text: "∞", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "A horizontal line has no vertical change, so its slope is 0."
  },
  {
    text: "What is the area of a circle with radius r?",
    options: [
      { text: "πr²", isCorrect: true },
      { text: "2πr", isCorrect: false },
      { text: "πr", isCorrect: false },
      { text: "2πr²", isCorrect: false },
    ],
    difficulty: "Easy",
    explanation: "The area of a circle is π times the square of its radius."
  }
];

module.exports = mathematicsQuestions;
