"use client";

import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  Pause,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toggleSavedArticle } from "@/app/actions/user";
import { buildArticleSpeechText } from "@/lib/article/speech-text";
import { useArticleSpeech } from "@/hooks/use-article-speech";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ArticleToolbar({
  articleId,
  title,
  dek,
  summaryBullets,
  body,
  returnPath,
  initiallySaved,
}: {
  articleId: string;
  title: string;
  dek: string;
  summaryBullets: string[];
  body: string;
  returnPath: string;
  initiallySaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSaved(initiallySaved);
  }, [initiallySaved]);

  const speechText = useMemo(
    () =>
      buildArticleSpeechText({ title, dek, summaryBullets, body }),
    [title, dek, summaryBullets, body],
  );

  const { status: speechStatus, togglePlayPause, stop } =
    useArticleSpeech(speechText);

  const speechActive = speechStatus === "playing" || speechStatus === "paused";

  function onSave() {
    setSaveMessage(null);
    startTransition(async () => {
      const result = await toggleSavedArticle(articleId, returnPath);
      if (result.error === "login_required") {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(returnPath)}`,
        );
        return;
      }
      if (result.error === "server") {
        setSaveMessage("Gagal menyimpan. Coba lagi.");
        return;
      }
      if (result.ok) {
        setSaved(result.saved);
        setSaveMessage(
          result.saved ? "Artikel disimpan ke akun Anda." : "Artikel dihapus dari daftar simpan.",
        );
      }
    });
  }

  const listenLabel =
    speechStatus === "unsupported"
      ? "TTS tidak didukung"
      : speechStatus === "playing"
        ? "Jeda"
        : speechStatus === "paused"
          ? "Lanjutkan"
          : "Dengarkan";

  return (
    <div className="space-y-2">
      <div
        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
        role="group"
        aria-label="Aksi artikel"
      >
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant={speechActive ? "secondary" : "outline"}
            size="sm"
            className="min-h-11 w-full justify-center sm:w-auto"
            disabled={speechStatus === "unsupported" || !speechText.trim()}
            onClick={togglePlayPause}
            aria-pressed={speechActive}
            aria-label={
              speechStatus === "playing"
                ? "Jeda audio artikel"
                : speechStatus === "paused"
                  ? "Lanjutkan audio artikel"
                  : "Dengarkan artikel dengan suara"
            }
          >
            {speechStatus === "playing" ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : speechStatus === "paused" ? (
              <Play className="h-4 w-4" aria-hidden />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden />
            )}
            {listenLabel}
          </Button>
          {speechActive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 w-full justify-center sm:w-auto"
              onClick={stop}
              aria-label="Berhenti mendengarkan"
            >
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
              Berhenti
            </Button>
          ) : null}
        </div>

        <Button
          type="button"
          variant={saved ? "default" : "outline"}
          size="sm"
          className="min-h-11 w-full justify-center sm:w-auto"
          disabled={pending}
          onClick={onSave}
          aria-pressed={saved}
          aria-label={saved ? "Hapus dari artikel disimpan" : "Simpan artikel"}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : saved ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden />
          )}
          {saved ? "Disimpan" : "Simpan"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {speechStatus === "unsupported"
          ? "Browser Anda tidak mendukung baca suara. Coba Chrome atau Edge."
          : speechActive
            ? "Membacakan judul, ringkasan, dan isi artikel (suara perangkat)."
            : "Dengarkan: judul, ringkasan Baca cepat, dan teks artikel lengkap."}
      </p>

      {saveMessage ? (
        <p
          className={cn(
            "text-sm",
            saveMessage.startsWith("Gagal")
              ? "text-destructive"
              : "text-trust",
          )}
          role="status"
        >
          {saveMessage}
        </p>
      ) : null}
    </div>
  );
}
