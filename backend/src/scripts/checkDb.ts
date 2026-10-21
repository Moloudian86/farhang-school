import { prisma } from "../config/prisma";

/**
 * Friendly database check for beginners.
 * Run with:  npm run db:check
 */
async function main() {
  console.log("Checking the connection to MySQL ...");
  await prisma.$queryRaw`SELECT 1`;
  console.log("OK: connected to MySQL.");

  const tables = await prisma.$queryRaw<{ TABLE_NAME: string }[]>`
    SELECT TABLE_NAME FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '_prisma_migrations'
    ORDER BY TABLE_NAME
  `;

  console.log(`OK: the database has ${tables.length} tables:`);
  for (const t of tables) console.log("  - " + t.TABLE_NAME);

  if (tables.length === 0) {
    console.log("\nNo tables yet. Run the migration command from SETUP-DATABASE.md (step 7).");
  }
}

main()
  .catch((error) => {
    console.error("\nFAILED: could not read the database.");
    console.error(error.message ?? error);
    console.error("\nOpen SETUP-DATABASE.md and look at the 'If something goes wrong' section.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
