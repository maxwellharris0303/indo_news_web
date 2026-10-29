"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pollRssFeedAction } from "@/app/actions/admin-rss";
import { Button } from "@/components/ui/button";

export function RssFeedPollButton({
  feedId,
  label,
  pollingLabel,
}: {
  feedId: string;
  label: string;
  pollingLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setFlash(null);
          try {
            const res = await pollRssFeedAction(feedId);
            if (!res.ok) {
              setFlash(res.error);
              return;
            }
            const r = res.result;
            if (r.error) {
              setFlash(r.error);
            } else if (r.notModified) {
              setFlash("304 — tidak ada perubahan");
            } else {
              setFlash(
                r.newItems > 0
                  ? `+${r.newItems} item baru`
                  : "0 item baru (feed OK)",
              );
            }
            router.refresh();
          } catch {
            setFlash("Poll gagal");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? pollingLabel : label}
      </Button>
      {flash ? (
        <span className="max-w-[12rem] text-right text-xs text-muted-foreground">
          {flash}
        </span>
      ) : null}
    </div>
  );
}
