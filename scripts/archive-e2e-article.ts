import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const r = await prisma.article.updateMany({
    where: { slug: "e2e-automation-test-article" },
    data: { status: "ARCHIVED" },
  });
  console.log(`Archived E2E test article: ${r.count} row(s)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
