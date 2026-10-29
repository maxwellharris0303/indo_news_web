import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Masuk KabarDesk</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Demo admin: admin@kabardesk.id / admin123 · Pembaca: pembaca@kabardesk.id /
        reader123
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
