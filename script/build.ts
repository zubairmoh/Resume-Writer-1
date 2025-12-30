import { build as viteBuild } from "vite";
import { writeFile, mkdir, rm } from "fs/promises";
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

  // 3. Create dummy server entry point to satisfy package.json command
  // Command is: "tsx script/build.ts && mv dist/index.cjs dist/server.js"
  // We need 'dist/index.cjs' to exist so 'mv' doesn't fail.
  
  // Create dist folder if vite didn't (unlikely)
  if (!existsSync("dist")) {
    await mkdir("dist", { recursive: true });
  }

  console.log("Creating dummy server file for Hostinger compatibility...");
  await writeFile(
    "dist/index.cjs", 
    "console.log('Frontend-only build. Server logic is bypassed.');"
  );

  console.log("Build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
