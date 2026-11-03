import { prisma } from "../src/lib/db";

async function main() {
  const rows = await prisma.rssItem.findMany({
    where: { status: "FAILED" },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      lastError: true,
      title: true,
      updatedAt: true,
      feed: { select: { name: true, scrapeMode: true } },
    },
  });

  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = (r.lastError ?? "(no error)").slice(0, 160);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  console.log("Recent FAILED items:", rows.length);
  console.log("\nError summary:");
  for (const [err, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n}x  ${err}`);
  }
  console.log("\nSample:");
  for (const r of rows.slice(0, 8)) {
    console.log(
      `  [${r.feed.name} / ${r.feed.scrapeMode}] ${r.title.slice(0, 50)}…`,
    );
    console.log(`    → ${(r.lastError ?? "").slice(0, 220)}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
