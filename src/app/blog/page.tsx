import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "AaoCab Travel Blog — Tips, Guides & Road Trip Stories",
  description:
    "Discover road trip tips, outstation cab guides, and travel stories from the AaoCab team. Plan your next journey with confidence.",
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "top-10-weekend-road-trips-from-kolkata",
    title: "Top 10 Weekend Road Trips from Kolkata",
    excerpt:
      "Kolkata is surrounded by hidden gems waiting to be explored. From the tea gardens of Darjeeling to the ancient temples of Bishnupur, discover the best weekend escapes within 300 km of the city.",
    date: "April 20, 2026",
    category: "Road Trip Guides",
  },
  {
    slug: "how-to-save-money-on-outstation-cab-bookings",
    title: "How to Save Money on Outstation Cab Bookings",
    excerpt:
      "Pre-booking your cab instead of hiring at the last minute can save you up to 30%. Learn the insider tips on timing, vehicle selection, and route choices that keep your travel costs down.",
    date: "April 14, 2026",
    category: "Travel Tips",
  },
  {
    slug: "why-pre-booked-cabs-are-safer-than-ride-hailing",
    title: "Why Pre-Booked Cabs Are Safer Than Ride-Hailing",
    excerpt:
      "Surge pricing, unknown drivers, and uncertain availability — ride-hailing has its drawbacks for long-distance travel. Here is why pre-booked outstation cabs offer a safer, more reliable experience.",
    date: "April 8, 2026",
    category: "Safety",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          AaoCab Travel Blog
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
          Tips, guides, and stories from the road
        </p>
      </header>

      {/* Blog post cards */}
      <div className="flex flex-col gap-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 hover:border-primary hover:shadow-md transition-all duration-200"
          >
            {/* Category badge */}
            <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>

            <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground mb-3">
              {post.title}
            </h2>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between">
              {/* Date */}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={14} aria-hidden="true" />
                {post.date}
              </span>

              {/* Read more link */}
              <Link
                href={`/blog/${post.slug}`}
                aria-label={`Read more about ${post.title}`}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[var(--primary-hover)] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Read More
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
