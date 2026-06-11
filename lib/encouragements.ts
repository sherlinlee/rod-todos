export const ALL_DONE_COMPLIMENT = "yo, well done man! 👍";

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
  message: ALL_DONE_COMPLIMENT,
  emoji: "👍",
};

export function pickEncouragement() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function allDoneEncouragement() {
  return ALL_DONE;
}
