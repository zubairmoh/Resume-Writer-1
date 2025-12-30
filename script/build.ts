import { build as viteBuild } from "vite";
import { build as esbuild } from "esbuild";
import { rm, writeFile } from "fs/promises";
import { existsSync } from "fs";

async function buildAll() {
  console.log("Starting build process...");

  // 1. Clean dist
  if (existsSync("dist")) {
    await rm("dist", { recursive: true, force: true });
  }
  
  // 2. Build Frontend (Vite)
  console.log("Building client (Vite)...");
  try {
    await viteBuild();
  } catch (error) {
    console.error("Vite build failed:", error);
    process.exit(1);
  }

  // 3. Build Server (esbuild) - output as CommonJS
  console.log("Building server (esbuild)...");
  try {
    await esbuild({
      entryPoints: ["server/index.ts"],
      bundle: true,
      platform: "node",
      target: "node20",
      outfile: "dist/server.cjs",
      format: "cjs",
      // Inline NODE_ENV as "production" to tree-shake vite dev code
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      external: [
        // Database drivers
        "pg-native",
        "better-sqlite3",
        "mysql2",
        "tedious",
        "oracledb",
        "pg-query-stream",
        // Vite and build tools (not needed in production - will be tree-shaken)
        "vite",
        "./vite",
        "@vitejs/plugin-react",
        "@replit/vite-plugin-cartographer",
        "@replit/vite-plugin-dev-banner",
        "@replit/vite-plugin-runtime-error-modal",
        "@tailwindcss/vite",
        "lightningcss",
        "@tailwindcss/oxide",
        "@tailwindcss/oxide-*",
        "tailwindcss",
        "autoprefixer",
        "postcss",
        "esbuild",
        "@babel/*",
        "tsx",
        "typescript",
      ],
      sourcemap: false,
      minify: false,
    });

    // Create an ESM wrapper that loads the CJS bundle
    await writeFile("dist/index.cjs", `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

require(join(__dirname, 'server.cjs'));
`);
  } catch (error) {
    console.error("Server build failed:", error);
    process.exit(1);
  }

  console.log("Build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
