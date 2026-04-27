import type { Metadata } from "next";
import { Mulish, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { generateLocalBusinessSchema } from "@/lib/seo";
import { LanguageProvider } from "@/lib/i18n/context";

const mulish = Mulish({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AaoCab - Pre-booked Car Rental | Aao, Chalein!",
  description:
    "AaoCab offers pre-booked car rental across India. No surge pricing, no surprises. Book outstation, local, and airport transfer cabs with verified drivers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <html
      lang="en"
      className={`${mulish.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Skip to main content — visually hidden until focused, improves keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to main content
        </a>

        <LanguageProvider>
          <Header />
          <main id="main-content" className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
