import { getSiteConfig } from "@/lib/site";

const BELLE_MESSAGES = [
  { message: "You did it, Belle!", emoji: "🌟" },
  { message: "One less thing on your mind, Belle!", emoji: "✨" },
  { message: "Look at you go, Belle!", emoji: "🎀" },
  { message: "Crushing it, Belle!", emoji: "💪" },
  { message: "That felt good, right, Belle?", emoji: "🌷" },
  { message: "Tiny win, big mood, Belle!", emoji: "🫶" },
  { message: "You're on a roll, Belle!", emoji: "🔥" },
  { message: "So satisfying, Belle!", emoji: "🎉" },
];

const ROD_MESSAGES = [
  { message: "You did it, Rod!", emoji: "🌟" },
  { message: "One less thing on your mind, Rod!", emoji: "✨" },
  { message: "Look at you go, Rod!", emoji: "⚡" },
  { message: "Crushing it, Rod!", emoji: "💪" },
  { message: "That felt good, right, Rod?", emoji: "🔥" },
  { message: "Tiny win, big mood, Rod!", emoji: "🫶" },
  { message: "You're on a roll, Rod!", emoji: "🏆" },
  { message: "So satisfying, Rod!", emoji: "🎉" },
];

export const ALL_DONE_WITH_TODAYS_LIST = "All done with today's list!";

const BELLE_ALL_DONE = [
  "All done with today's list! 🎀",
  "All done with today's list, Belle! ✨",
  "Today's list is all tucked away! 🌷",
  "You finished today's list — so proud! 🫶",
  "That's today's list wrapped, sweetie! 🏆",
  "Every today task done — wow! 💫",
  "Today's list feels complete! 🌟",
  "You cleared today's list beautifully! 🎉",
];

const ROD_ALL_DONE = [
  "All done with today's list! ⚡",
  "All done with today's list, Rod! ✨",
  "Today's list is cleared! 🔥",
  "You finished today's list — nice one! 🏆",
  "That's today's list wrapped! 💪",
  "Every today task done — boom! 💫",
  "Today's list feels complete! 🌟",
  "You cleared today's list! 🎉",
];

function pickFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickAllDoneCompliment() {
  const list = getSiteConfig().owner === "rod" ? ROD_ALL_DONE : BELLE_ALL_DONE;
  return pickFrom(list);
}

export function pickEncouragement() {
  const list = getSiteConfig().owner === "rod" ? ROD_MESSAGES : BELLE_MESSAGES;
  return pickFrom(list);
}

export function allDoneEncouragement() {
  return {
    message: pickAllDoneCompliment(),
    emoji: "🏆",
  };
}
