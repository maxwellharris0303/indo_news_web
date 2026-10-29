"use client";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
};

export function DeleteArticleButton({ title }: Props) {
  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      className="border-destructive/50 text-destructive hover:bg-destructive/10"
      onClick={(e) => {
        const label = title.length > 60 ? `${title.slice(0, 60)}…` : title;
        if (
          !confirm(
            `Hapus artikel "${label}"?\n\nTindakan ini permanen (komentar & simpanan terkait ikut terhapus).`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      Hapus
    </Button>
  );
}
