const MESSAGES = [
  { message: "You did it, Rod!", emoji: "⚡" },
  { message: "One less thing on your mind, Rod!", emoji: "💥" },
  { message: "Look at you go, Rod!", emoji: "🌟" },
  { message: "Crushing it, Rod!", emoji: "💪" },
  { message: "That felt good, right, Rod?", emoji: "😎" },
  { message: "Tiny win, big mood, Rod!", emoji: "🔥" },
  { message: "You're on a roll, Rod!", emoji: "🚀" },
  { message: "So satisfying, Rod!", emoji: "🎉" },
];

const ALL_DONE_COMPLIMENTS = [
  "yo, well done man! 👍",
  "absolute unit, mate 💪",
  "boss move, Rod 😎",
  "that's the stuff 🔥",
  "clean sweep, legend 🏆",
  "nailed it, man ⚡",
  "proper day, that 🎯",
  "all quests down — respect 👊",
  "you ate that, Rod 🍽️",
  "main character energy 🚀",
];

export function pickAllDoneCompliment() {
  return ALL_DONE_COMPLIMENTS[
    Math.floor(Math.random() * ALL_DONE_COMPLIMENTS.length)
  ];
}

export function pickEncouragement() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function allDoneEncouragement() {
  return {
    message: pickAllDoneCompliment(),
    emoji: "👍",
  };
}
