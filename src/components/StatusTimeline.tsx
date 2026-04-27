"use client";

import { CheckCircle2, Circle } from "lucide-react";

const TIMELINE_STEPS = [
  { key: "confirmed", label: "Booking Confirmed" },
  { key: "driver_assigned", label: "Driver Assigned" },
  { key: "in_route", label: "Driver En Route" },
  { key: "in_progress", label: "Trip In Progress" },
  { key: "completed", label: "Trip Completed" },
] as const;

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  driver_assigned: 2,
  en_route: 3,
  in_route: 3,
  in_progress: 4,
  completed: 5,
};

interface Props {
  status: string;
}

export default function StatusTimeline({ status }: Props) {
  const currentOrder = STATUS_ORDER[status] ?? 1;

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map(({ key, label }, idx) => {
        const stepOrder = idx + 1;
        const isDone = currentOrder >= stepOrder;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={key} className="flex gap-3">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              {isDone ? (
                <CheckCircle2
                  size={20}
                  className="text-[#24B7A4] shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  size={20}
                  className="text-border shrink-0"
                  aria-hidden="true"
                />
              )}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 my-1 min-h-[20px] ${
                    isDone && currentOrder > stepOrder
                      ? "bg-[#24B7A4]"
                      : "bg-border"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
            {/* Label */}
            <p
              className={`text-sm pb-4 ${
                isDone
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
