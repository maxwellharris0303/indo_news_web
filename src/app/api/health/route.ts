import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { ok: true, db: "ok", ts: new Date().toISOString() },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return Response.json(
      { ok: false, db: "error", error: message, ts: new Date().toISOString() },
      { status: 503 },
    );
  }
}
