"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSiteConfig } from "@/lib/site";

export default function BottomNav() {
  const pathname = usePathname();
  const site = getSiteConfig();

  const links = [
    { href: "/", label: "to-do(s)", emoji: site.navTodoEmoji },
    { href: "/ideas", label: "ideas", emoji: "💭" },
    { href: "/notes", label: "notes", emoji: "📝" },
  ];

  return (
    <nav className="safe-pb fixed inset-x-0 bottom-0 z-40 border-t border-accent-soft/40 bg-card/95 px-3 pt-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg gap-2">
        {links.map(({ href, label, emoji }) => {
          const active =
            pathname === href ||
            (href === "/notes" && pathname === "/journal");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-xs font-bold transition active:scale-[0.98] sm:gap-1.5 sm:text-sm ${
                active
                  ? "bg-lavender text-foreground shadow-sm dark:bg-accent-soft/40 dark:shadow-none"
                  : "text-foreground/50 hover:text-foreground/70 dark:text-foreground/65 dark:hover:text-foreground/90"
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
