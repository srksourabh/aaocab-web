import { Phone, MessageCircle } from "lucide-react";

const LINKS_COL_1 = [
  { label: "About", href: "/about" },
  { label: "Safety", href: "/safety" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
];

const LINKS_COL_2 = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
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
            <p className="text-sm text-slate-500 max-w-xs">
              Traveling Made Simple With Aao Cab
            </p>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
            <div className="flex flex-col gap-3">
              {LINKS_COL_1.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {LINKS_COL_2.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {label}
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
              Call us: 7890 302 302
            </a>
            <a
              href="https://wa.me/917890302302"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact AaoCab on WhatsApp"
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors duration-200 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-600 text-center md:text-left">
            &copy; 2026 AaoCab Technologies Pvt. Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
