"use client";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  deleteLabel: string;
  confirmIntro: string;
  confirmDetail: string;
};

export function DeleteArticleButton({
  title,
  deleteLabel,
  confirmIntro,
  confirmDetail,
}: Props) {
  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      className="border-destructive/50 text-destructive hover:bg-destructive/10"
      onClick={(e) => {
        const label = title.length > 60 ? `${title.slice(0, 60)}…` : title;
        if (
          !confirm(`${confirmIntro} "${label}"?\n\n${confirmDetail}`)
        ) {
          e.preventDefault();
        }
      }}
    >
      {deleteLabel}
    </Button>
  );
}
