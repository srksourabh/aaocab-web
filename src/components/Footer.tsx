"use client";

import { Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useLanguage();

  const linksCol1 = [
    { key: "about" as const, href: "/about" },
    { key: "safety" as const, href: "/safety" },
    { key: "blog" as const, href: "/blog" },
    { key: "careers" as const, href: "/careers" },
  ];

  const linksCol2 = [
    { key: "terms" as const, href: "/terms" },
    { key: "privacy" as const, href: "/privacy" },
    { key: "refundPolicy" as const, href: "/refund-policy" },
    { key: "contact" as const, href: "/contact" },
  ];

  return (
    <footer
      className="text-slate-400 pt-12 pb-28 md:pb-12 px-4"
      style={{ backgroundColor: "var(--footer)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-2xl text-white">
              AaoCab
            </span>
            <p className="text-sm text-slate-500 max-w-xs">{t("tagline")}</p>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
            <div className="flex flex-col gap-3">
              {linksCol1.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {t(key)}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {linksCol2.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {t(key)}
                </a>
              ))}
            </div>
          </div>

          {/* Contact CTAs */}
          <div className="flex flex-col gap-3">
            <a
              href="tel:7890302302"
              aria-label="Call AaoCab at 7890302302"
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors duration-200 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <Phone size={18} aria-hidden="true" />
              {t("callUs")}
            </a>
            <a
              href="https://wa.me/917890302302"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact AaoCab on WhatsApp"
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors duration-200 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <MessageCircle size={18} aria-hidden="true" />
              {t("whatsappUs")}
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-600 text-center md:text-left">
            &copy; {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
