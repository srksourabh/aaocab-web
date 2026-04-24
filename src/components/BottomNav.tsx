"use client";

import { Home, ClipboardList, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Bookings", icon: ClipboardList, href: "/bookings" },
  { label: "Help", icon: MessageCircle, href: "/help" },
  { label: "Profile", icon: User, href: "/profile" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ backgroundColor: "var(--nav)" }}
    >
      <div
        className="flex items-center justify-around"
        style={{
          height: "64px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <a
              key={label}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-4 text-xs font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              {/* Active dot indicator */}
              {isActive && (
                <span
                  className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
