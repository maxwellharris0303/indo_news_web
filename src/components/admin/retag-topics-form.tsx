"use client";

import { useFormStatus } from "react-dom";
import { retagUntaggedArticlesFormAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-4" variant="secondary" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function RetagTopicsForm({
  title,
  hint,
  buttonLabel,
  pendingLabel,
}: {
  title: string;
  hint: string;
  buttonLabel: string;
  pendingLabel: string;
}) {
  return (
    <form
      action={retagUntaggedArticlesFormAction}
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <SubmitButton label={buttonLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
