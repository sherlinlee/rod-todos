"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "to-do(s)", emoji: "⚡" },
  { href: "/ideas", label: "ideas", emoji: "💭" },
  { href: "/journal", label: "journal", emoji: "📖" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-pb fixed inset-x-0 bottom-0 z-40 border-t border-accent-soft/40 bg-card/95 px-3 pt-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg gap-2">
        {links.map(({ href, label, emoji }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-xs font-bold transition active:scale-[0.98] sm:gap-1.5 sm:text-sm ${
                active
                  ? "bg-accent text-white shadow-sm"
                  : "text-foreground/50 hover:text-foreground/70"
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
