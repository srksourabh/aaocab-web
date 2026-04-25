"use client";

import { useState, useEffect } from "react";
import { BadgeCheck } from "lucide-react";

interface CompetitorPrice {
  name: string;
  price: number;
  lastUpdated: string;
}

interface PricingData {
  aaocab: number;
  competitors: CompetitorPrice[];
}

interface PriceComparisonProps {
  from: string;
  to: string;
}

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-32 mb-3" />
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded-xl w-28" />
        ))}
      </div>
    </div>
  );
}

export default function PriceComparison({ from, to }: PriceComparisonProps) {
  const [data, setData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!from || !to) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const params = new URLSearchParams({ from, to });
    fetch(`/api/pricing?${params.toString()}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<PricingData>;
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [from, to]);

  if (loading) return <LoadingSkeleton />;
  if (!data) return null;

  const allPrices = [data.aaocab, ...data.competitors.map((c) => c.price)];
  const lowestPrice = Math.min(...allPrices);
  const aaocabIsLowest = data.aaocab === lowestPrice;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Price Comparison (Sedan)
        </p>
        {aaocabIsLowest && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#24B7A4] text-white">
            <BadgeCheck size={12} aria-hidden="true" />
            Lowest price
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* AaoCab price — always first */}
        <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-2 border-primary bg-primary/5 min-w-[90px]">
          <span className="text-xs font-medium text-muted-foreground">
            AaoCab
          </span>
          <span className="font-heading font-bold text-base text-primary">
            ₹{data.aaocab.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Competitor prices */}
        {data.competitors.map((c) => (
          <div
            key={c.name}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-border bg-background min-w-[90px]"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {c.name}
            </span>
            <span className="font-heading font-semibold text-base text-foreground">
              ₹{c.price.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
