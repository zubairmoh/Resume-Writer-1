import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { users } from "../shared/schema";

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Database URL not found");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(pool);

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const hashedPasswordWriter = await bcrypt.hash("writer123", 10);
    const hashedPasswordClient = await bcrypt.hash("client123", 10);

    const testUsers = [
      {
        username: "admin",
        password: hashedPassword,
        email: "admin@proresumes.ca",
        fullName: "Admin User",
        role: "admin",
      },
      {
        username: "writer",
        password: hashedPasswordWriter,
        email: "writer@proresumes.ca",
        fullName: "Writer User",
        role: "writer",
      },
      {
        username: "client",
        password: hashedPasswordClient,
        email: "client@proresumes.ca",
        fullName: "Client User",
        role: "client",
      },
    ];

    for (const user of testUsers) {
      try {
        await db.insert(users).values(user).onConflictDoNothing();
        console.log(`✓ Created user: ${user.username}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`- User already exists: ${user.username}`);
        } else {
          throw error;
        }
      }
    }

    console.log("\nSeeding completed successfully!");
    await pool.end();
  } catch (error) {
    console.error("Seeding failed:", error);
    await pool.end();
    process.exit(1);
  }
}

seed();
