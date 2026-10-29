import type { CategorySlug } from "@/lib/site";

export type VerificationStatus = "verified" | "investigation" | "hoax";

export type FactCheckVerdict = "benar" | "salah" | "menyesatkan" | "tidak_dapat_diverifikasi";

export interface Author {
  id: string;
  name: string;
  title?: string;
  bio?: string;
}

export interface Region {
  slug: string;
  name: string;
  province: string;
}

export interface Topic {
  slug: string;
  name: string;
  description: string;
}

export interface Article {
  id: string;
  slug: string;
  category: CategorySlug;
  title: string;
  dek: string;
  body: string;
  summaryBullets: string[];
  publishedAt: string;
  updatedAt?: string;
  correctionNote?: string;
  authorId: string;
  authorName?: string;
  topicSlugs: string[];
  regionSlug?: string;
  imageUrl: string;
  imageCaption: string;
  imageCredit: string;
  verificationStatus: VerificationStatus;
  sources: string[];
  featuredLevel: 0 | 1 | 2 | 3;
  isBreaking: boolean;
  breakingExpiresAt?: string;
  viewCount: number;
}

export interface FactCheck {
  slug: string;
  claim: string;
  verdict: FactCheckVerdict;
  explanation: string;
  sources: string[];
  publishedAt: string;
  relatedArticleSlugs: string[];
}

export interface MarketSnapshot {
  usdIdr: number;
  usdIdrChange: number;
  ihsg: number;
  ihsgChange: number;
  goldBuy: number;
}
