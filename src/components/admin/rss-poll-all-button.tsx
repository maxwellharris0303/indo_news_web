"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pollAllRssFeedsAction } from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";

export function RssPollAllButton({
  label,
  pollingLabel,
  hint,
}: {
  label: string;
  pollingLabel: string;
  hint: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex max-w-md flex-col items-end gap-1">
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setMessage(hint);
          try {
            const res = await pollAllRssFeedsAction();
            if (res.ok) {
              const total = res.results.reduce((n, r) => n + r.newItems, 0);
              const errors = res.results.filter((r) => r.error).length;
              const lines = res.results
                .filter((r) => r.newItems > 0 || r.error)
                .map((r) =>
                  r.error
                    ? `${r.name}: ERR`
                    : `${r.name}: +${r.newItems}`,
                );
              setMessage(
                `Poll selesai: ${total} item baru${errors ? `, ${errors} feed error` : ""}.${lines.length ? ` (${lines.join(", ")})` : ""}`,
              );
              router.refresh();
            } else {
              setMessage("Poll gagal.");
            }
          } catch (e) {
            const msg =
              e instanceof Error ? e.message : "Poll gagal (timeout?).";
            setMessage(msg.includes("fetch") ? "Poll gagal — coba lagi." : msg);
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? pollingLabel : label}
      </Button>
      {message ? (
        <span className="text-right text-xs text-muted-foreground sm:text-sm">
          {message}
        </span>
      ) : null}
    </div>
  );
}
