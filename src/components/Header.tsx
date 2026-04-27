"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n/context";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-background transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 md:h-[72px]">
        {/* Logo */}
        <Link
          href="/"
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label="AaoCab Home"
        >
          <Image
            src="/images/logo-full-color.jpg"
            alt="AaoCab"
            height={48}
            width={144}
            className="h-10 md:h-12 w-auto"
            priority
          />
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle — now powered by i18n context */}
          <LanguageToggle />

          {/* Phone CTA */}
          <a
            href="tel:7890302302"
            aria-label={t("callSupport")}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary min-h-[44px] px-3 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Phone size={18} aria-hidden="true" />
            <span className="hidden sm:inline">7890 302 302</span>
          </a>
        </div>
      </div>
    </header>
  );
}
