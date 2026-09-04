/**
 * Invoke `convex run <function> <jsonArgs>` via the Convex CLI's own JS
 * entry point (node_modules/convex/bin/main.js) instead of shelling out to
 * `npx`/`npx.cmd`. This avoids Windows-specific breakage: `execFileSync`
 * can't invoke `.cmd` files without `shell: true`, and `shell: true` runs
 * the command through cmd.exe, which mangles JSON args containing quotes
 * before they ever reach the CLI. Invoking `node <main.js> ...` directly
 * passes args as real argv with no shell parsing in between.
 */

import { execFileSync } from "child_process";
import { createRequire } from "module";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);

export function convexRun(functionName: string, args: unknown): string {
  // convex/package.json's "exports" map doesn't expose "./bin/main.js" as an
  // importable subpath, so resolve the package root (which is exported) and
  // join the CLI's known relative path onto it instead of importing it.
  const pkgRoot = dirname(require.resolve("convex/package.json"));
  const mainJs = join(pkgRoot, "bin", "main.js");
  const cliArgs = [mainJs, "run", functionName, JSON.stringify(args)];
  // Set CONVEX_RUN_PROD=1 to target the production deployment instead of dev.
  if (process.env.CONVEX_RUN_PROD === "1") {
    cliArgs.push("--prod");
  }
  return execFileSync(process.execPath, cliArgs, {
    encoding: "utf8",
  });
}
