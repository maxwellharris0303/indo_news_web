"use client";

import { Bookmark, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleSavedArticle } from "@/app/actions/user";
import { Button } from "@/components/ui/button";

export function ArticleToolbar({
  articleId,
  title,
  summaryText,
  initiallySaved,
}: {
  articleId: string;
  title: string;
  summaryText: string;
  initiallySaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const result = await toggleSavedArticle(articleId);
      if (result.error === "login_required") {
        router.push("/login");
        return;
      }
      if (result.ok) setSaved(result.saved);
    });
  }

  function onListen() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${title}. ${summaryText}`);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 w-full justify-center sm:w-auto"
        onClick={onListen}
      >
        <Volume2 className="h-4 w-4" />
        Dengarkan
      </Button>
      <Button
        type="button"
        variant={saved ? "default" : "outline"}
        size="sm"
        className="min-h-11 w-full justify-center sm:w-auto"
        disabled={pending}
        onClick={onSave}
      >
        <Bookmark className="h-4 w-4" />
        {saved ? "Disimpan" : "Simpan"}
      </Button>
    </div>
  );
}
