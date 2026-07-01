import { getSiteConfig } from "@/lib/site";

export default function CelebrationAvatar({ size = 96 }: { size?: number }) {
  const site = getSiteConfig();

  return (
    <span
      className="inline-flex animate-celebration-float items-center leading-none"
      style={{ fontSize: Math.round(size * 0.72) }}
      aria-hidden
    >
      ⚡{site.celebrationEmoji}
    </span>
  );
}
