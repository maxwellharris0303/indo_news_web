import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Cpu,
  Globe2,
  GraduationCap,
  Landmark,
  LayoutList,
  LineChart,
  MapPin,
  MessageSquareQuote,
  PlaySquare,
  Scale,
  Sparkles,
  Trophy,
} from "lucide-react";

/** Icons for main nav / kanal links (by href). */
export const navIconByHref: Record<string, LucideIcon> = {
  "/nasional": Landmark,
  "/internasional": Globe2,
  "/daerah": MapPin,
  "/ekonomi": LineChart,
  "/politik-hukum": Scale,
  "/olahraga": Trophy,
  "/tekno": Cpu,
  "/edukasi": GraduationCap,
  "/gaya-hidup": Sparkles,
  "/multimedia": PlaySquare,
  "/opini": MessageSquareQuote,
  "/cek-fakta": BadgeCheck,
  "/indeks": LayoutList,
};

export function getNavIcon(href: string): LucideIcon {
  return navIconByHref[href] ?? LayoutList;
}
