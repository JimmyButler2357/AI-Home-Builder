"use client";

import { useState } from "react";

export default function ReportButton({ itemId }: { itemId: string }) {
  const [sent, setSent] = useState(false);
  if (sent) return <p className="text-xs text-muted">Thanks — this item has been reported for review.</p>;
  return (
    <button
      onClick={async () => {
        setSent(true);
        try {
          await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemId }),
          });
        } catch {
          /* best effort */
        }
      }}
      className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
    >
      Report this image
    </button>
  );
}
