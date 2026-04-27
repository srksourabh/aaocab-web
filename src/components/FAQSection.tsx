import { generateFAQSchema } from "@/lib/seo";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

/**
 * Renders an accessible FAQ accordion and injects a JSON-LD FAQPage schema
 * so search engines can display rich results.
 */
export default function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
}: FAQSectionProps) {
  const schema = generateFAQSchema(faqs);

  return (
    <section aria-labelledby="faq-heading" className="py-10 md:py-14">
      {/* JSON-LD structured data — invisible to users */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-3xl mx-auto px-4">
        <h2
          id="faq-heading"
          className="font-heading font-semibold text-2xl md:text-3xl text-foreground mb-8"
        >
          {title}
        </h2>

        <div className="space-y-3">
          {faqs.map(({ question, answer }, index) => (
            <details
              key={index}
              className="group border border-border rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-heading font-semibold text-base text-foreground hover:bg-muted/50 transition-colors duration-150 select-none">
                <span>{question}</span>
                {/* Chevron rotates when open */}
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed font-sans">
                {answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
