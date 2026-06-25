#!/usr/bin/env node
/**
 * One-time local-dev setup.
 *
 * Makes `arx` and `agentreflex` real commands on your PATH, pointing at the local
 * build. Agent hook configs stay portable ("arx hook --agent …") — exactly what a
 * published install produces — so nothing machine-specific is ever written into a
 * project. Re-run is safe (idempotent); rebuilds are picked up automatically since
 * the shims point at dist/.
 *
 *   pnpm dev:setup     then restart your terminal (or source your shell rc)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repo, "packages", "cli", "dist", "cli.js");
const binDir = path.join(os.homedir(), ".agentreflex", "bin");
const MARKER = "# agentreflex dev bin";
const isWin = process.platform === "win32";

// 1. Ensure the CLI is built.
if (!fs.existsSync(cli)) {
  console.log("building packages…");
  execFileSync("pnpm", ["-r", "--filter", "./packages/*", "build"], {
    cwd: repo,
    stdio: "inherit",
  });
}

// 2. Write launcher shims that delegate to the local build via whatever `node` is
//    on PATH (nvm-friendly). These persist across rebuilds.
fs.mkdirSync(binDir, { recursive: true });
for (const name of ["arx", "agentreflex"]) {
  if (isWin) {
    fs.writeFileSync(path.join(binDir, `${name}.cmd`), `@echo off\r\nnode "${cli}" %*\r\n`);
  } else {
    const shim = path.join(binDir, name);
    fs.writeFileSync(shim, `#!/bin/sh\nexec node "${cli}" "$@"\n`);
    fs.chmodSync(shim, 0o755);
  }
}
console.log(`✓ arx + agentreflex  →  ${binDir.replace(os.homedir(), "~")}`);

// 3. Put the bin dir on PATH (idempotent), per the user's shell.
if (isWin) {
  console.log("\nAdd the bin dir to your PATH (one time), e.g. in PowerShell:");
  console.log(`  setx PATH "$env:PATH;${binDir}"`);
  console.log("then open a new terminal.");
} else {
  const home = os.homedir();
  const shell = process.env.SHELL || "";
  let rc;
  if (shell.includes("zsh")) rc = path.join(home, ".zshrc");
  else if (shell.includes("fish")) rc = path.join(home, ".config", "fish", "config.fish");
  else if (shell.includes("bash"))
    rc = fs.existsSync(path.join(home, ".bashrc"))
      ? path.join(home, ".bashrc")
      : path.join(home, ".bash_profile");
  else rc = path.join(home, ".profile");

  const block = rc.endsWith("config.fish")
    ? `\n${MARKER}\nfish_add_path ${binDir}\n`
    : `\n${MARKER}\nexport PATH="${binDir}:$PATH"\n`;

  fs.mkdirSync(path.dirname(rc), { recursive: true });
  const current = fs.existsSync(rc) ? fs.readFileSync(rc, "utf8") : "";
  const rcShort = rc.replace(home, "~");
  if (current.includes(MARKER)) {
    console.log(`✓ PATH entry already present in ${rcShort}`);
  } else {
    fs.appendFileSync(rc, block);
    console.log(`✓ PATH entry added to ${rcShort}`);
  }
  console.log(`\nRestart your terminal (or: source ${rcShort}), then try:`);
  console.log("  arx doctor");
}
