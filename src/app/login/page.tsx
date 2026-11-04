import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { NoTranslateBrand } from "@/components/brand/no-translate-brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-serif text-2xl font-bold">
        Masuk <NoTranslateBrand as="span">{site.name}</NoTranslateBrand>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Gunakan akun redaksi atau pembaca yang sudah terdaftar.
      </p>
      <div className="mt-8 border border-border bg-card p-6">
        <LoginForm />
      </div>
    </div>
  );
}
