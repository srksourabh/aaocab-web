import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/book/", "/bookings/", "/account/"],
    },
    sitemap: "https://aaocab.com/sitemap.xml",
  };
}
