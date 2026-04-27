import type { Metadata } from "next";
import { Mulish, Poppins } from "next/font/google";
import "../globals.css";

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
  title: "AaoCab",
  description: "AaoCab — Pre-booked car rental across India.",
};

/**
 * Minimal layout for public-facing pages (trip tracking, review form).
 * No Header, Footer, or BottomNav — each page renders its own chrome.
 */
export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${mulish.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
