"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AdminLocale } from "@/lib/admin-locale";

type Value = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
};

const AdminLocaleContext = createContext<Value | null>(null);

export function AdminLocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: AdminLocale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<AdminLocale>(initialLocale);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <AdminLocaleContext.Provider value={value}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale(): Value {
  const ctx = useContext(AdminLocaleContext);
  if (!ctx) {
    throw new Error("useAdminLocale must be used within AdminLocaleProvider");
  }
  return ctx;
}
