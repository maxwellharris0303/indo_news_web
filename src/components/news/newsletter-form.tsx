"use client";

import { useState } from "react";
import { newsletterSubscribeAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ compact }: { compact?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className={
        compact
          ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
          : "mt-4 space-y-3"
      }
      action={async (formData) => {
        setPending(true);
        setMessage(null);
        const result = await newsletterSubscribeAction(formData);
        setPending(false);
        setMessage(
          result.ok
            ? "Terima kasih! Anda terdaftar di newsletter KabarDesk."
            : result.error ?? "Gagal mendaftar",
        );
      }}
    >
      <Input
        name="email"
        type="email"
        required
        placeholder="Email Anda"
        className={compact ? "min-h-11 sm:flex-1" : "min-h-11"}
      />
      <Button
        type="submit"
        disabled={pending}
        className={compact ? "min-h-11 shrink-0" : "min-h-11 w-full sm:w-auto"}
      >
        {pending ? "Mendaftar..." : "Langganan"}
      </Button>
      {message && (
        <p
          className={`text-sm ${message.includes("Terima") ? "text-emerald-600" : "text-destructive"} ${compact ? "mt-1 basis-full sm:mt-0" : ""}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
