"use client";

import { Home, ClipboardList, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { labelKey: "navHome" as const, icon: Home, href: "/" },
    { labelKey: "navBookings" as const, icon: ClipboardList, href: "/bookings" },
    { labelKey: "navHelp" as const, icon: MessageCircle, href: "/help" },
    { labelKey: "navProfile" as const, icon: User, href: "/profile" },
  ];

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
        {NAV_ITEMS.map(({ labelKey, icon: Icon, href }) => {
          const isActive = pathname === href;
          const label = t(labelKey);
          return (
            <a
              key={href}
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
