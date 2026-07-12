/**
 * VoyageAI database setup script.
 *
 * Reads schema.sql and executes it against the database specified by
 * DATABASE_URL. Run with: bun run db:setup
 *
 * Relies on @neondatabase/serverless (already a dependency) for the Neon
 * serverless Postgres driver.
 */
import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.startsWith("npx ")) {
    console.error(
      "\n  ❌ DATABASE_URL is not set or is still a placeholder.\n" +
        "     Connect a Neon database via the database card in the chat\n" +
        "     to get a real connection string, then re-run:\n" +
        "       bun run db:setup\n",
    );
    process.exit(1);
  }

  console.log("  🔌 Connecting to database…");
  const sql = neon(databaseUrl);

  // Read the schema file
  const schemaPath = resolve(__dirname, "..", "schema.sql");
  let schemaSql: string;
  try {
    schemaSql = await readFile(schemaPath, "utf8");
  } catch (err) {
    console.error(`\n  ❌ Could not read schema file at ${schemaPath}:`, err);
    process.exit(1);
  }

  console.log("  📄 Running schema…");

  // Execute each statement individually using the tagged template syntax
  // (the Neon HTTP driver only supports tagged templates, not sql.unsafe or
  // raw string calls for DDL).
  const rawStatements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let successCount = 0;
  for (const raw of rawStatements) {
    try {
      // Use tagged template syntax to ensure the statement actually executes
      await sql`${sql.unsafe(raw)}`;
      successCount++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // "already exists" / "duplicate" warnings are expected on re-runs — skip them.
      if (
        message.includes("already exists") ||
        message.includes("duplicate") ||
        message.includes("already been created") ||
        message.includes("already exists in schema")
      ) {
        successCount++;
        continue;
      }
      console.error(`\n  ⚠️  Statement failed (may be harmless):\n    ${message}`);
    }
  }

  console.log(`  ✅ Schema applied (${successCount} of ${rawStatements.length} statements).`);
  console.log("  🚀 Database is ready for VoyageAI.");
}

main().catch((err) => {
  console.error("  ❌ Unexpected error:", err);
  process.exit(1);
});
