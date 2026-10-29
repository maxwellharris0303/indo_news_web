"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pollAllRssFeedsAction } from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";

export function RssPollAllButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setMessage(null);
          try {
            const res = await pollAllRssFeedsAction();
            if (res.ok) {
              const total = res.results.reduce((n, r) => n + r.newItems, 0);
              const errors = res.results.filter((r) => r.error).length;
              setMessage(
                `Poll selesai: ${total} item baru${errors ? `, ${errors} feed error` : ""}.`,
              );
              router.refresh();
            }
          } catch {
            setMessage("Poll gagal.");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "…" : label}
      </Button>
      {message ? (
        <span className="text-sm text-muted-foreground">{message}</span>
      ) : null}
    </div>
  );
}
