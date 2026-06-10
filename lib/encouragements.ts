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

const ALL_DONE = {
  message: "Everything's done! Heck yeah, Rod — total legend!",
  emoji: "🏆",
};

export function pickEncouragement() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function allDoneEncouragement() {
  return ALL_DONE;
}
