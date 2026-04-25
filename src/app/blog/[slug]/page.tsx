import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Format slug into a readable title for the meta tag
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${title} — AaoCab Blog`,
    description: "Read this article on the AaoCab Travel Blog.",
  };
}

const POPULAR_ROUTES = [
  { label: "Kolkata to Digha", href: "/cabs/kolkata" },
  { label: "Kolkata to Siliguri", href: "/cabs/kolkata" },
  { label: "Mumbai to Pune", href: "/cabs/mumbai" },
  { label: "Bangalore to Mysore", href: "/cabs/bangalore" },
  { label: "Delhi to Agra", href: "/cabs/delhi" },
];

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Format slug into a readable title
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main article area */}
        <article className="flex-1 min-w-0">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to Blog
          </Link>

          {/* Article header */}
          <header className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </header>

          {/* Placeholder body */}
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
            <p className="font-heading font-semibold text-lg text-foreground mb-2">
              Full article coming soon
            </p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Our travel writers are working on this article. Check back shortly
              for the complete guide.
            </p>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:w-72 flex-shrink-0" aria-label="Sidebar">
          {/* Popular routes */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="font-heading font-semibold text-base text-foreground mb-4">
              Popular Routes
            </h2>
            <ul className="flex flex-col gap-3">
              {POPULAR_ROUTES.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    <MapPin size={14} aria-hidden="true" className="flex-shrink-0 text-primary" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Book CTA */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "var(--primary-light)" }}
          >
            <h2 className="font-heading font-semibold text-base text-foreground mb-2">
              Ready to travel?
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Pre-book your cab with fixed fares and verified drivers.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold text-sm px-5 py-3 rounded-full min-h-[44px] hover:bg-[var(--primary-hover)] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book a Cab
            </Link>
            <a
              href="tel:7890302302"
              aria-label="Call AaoCab at 7890302302"
              className="inline-flex items-center justify-center gap-2 w-full mt-3 text-sm font-medium text-primary hover:text-[var(--primary-hover)] transition-colors duration-200 min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <Phone size={15} aria-hidden="true" />
              7890 302 302
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
