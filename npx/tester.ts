import os from "os";
import path from "path";
import fs from "fs";
import { readYaml } from "./utils.js";
import { load } from "./loader.js";
import { compile } from "./compiler.js";

// chalk@5 is ESM-only; use dynamic import to satisfy Node16 module resolution
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _chalk: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getChalk(): Promise<any> {
  if (!_chalk) {
    _chalk = (await import("chalk")).default;
  }
  return _chalk;
}

type DiffTuple = [path: string, forgeVal: unknown, actualVal: unknown];

function diff(
  a: unknown,
  b: unknown,
  p: string,
  ignore: Set<string>
): DiffTuple[] {
  const results: DiffTuple[] = [];

  if (
    a !== null &&
    b !== null &&
    typeof a === "object" &&
    typeof b === "object" &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const keys = Array.from(
      new Set([...Object.keys(aObj), ...Object.keys(bObj)])
    ).sort();
    for (const k of keys) {
      if (ignore.has(k)) continue;
      const kp = p ? `${p}.${k}` : k;
      if (!(k in aObj)) {
        results.push([kp, "<missing>", bObj[k]]);
      } else if (!(k in bObj)) {
        results.push([kp, aObj[k], "<missing>"]);
      } else {
        results.push(...diff(aObj[k], bObj[k], kp, ignore));
      }
    }
  } else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      results.push([p, `<list len=${a.length}>`, `<list len=${b.length}>`]);
    } else {
      for (let i = 0; i < a.length; i++) {
        results.push(...diff(a[i], b[i], `${p}[${i}]`, ignore));
      }
    }
  } else {
    if (a !== b) {
      results.push([p, a, b]);
    }
  }

  return results;
}

function rglob(dir: string, ext: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...rglob(full, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

export async function run(opts: {
  inputDir: string;
  actual: string;
  outDir: string | null;
  solVersion: string | null;
  unmanaged: boolean;
  skipBuild: boolean;
  ignore: Set<string>;
}): Promise<boolean> {
  const { inputDir, actual, outDir, solVersion, unmanaged, skipBuild, ignore } =
    opts;

  const chalk = await getChalk();

  const useTmp = outDir === null;
  const tmpDir = useTmp
    ? fs.mkdtempSync(path.join(os.tmpdir(), "dvforge_test_"))
    : null;
  const buildDir = outDir ?? tmpDir!;

  let ok = false;

  try {
    if (!skipBuild) {
      const config = load(inputDir);
      if (solVersion) {
        config.solution.version = solVersion;
      }
      console.log(`Building: ${config.solution.name} v${config.solution.version}`);
      compile(config, buildDir, !unmanaged);
      console.log();
    }

    if (!fs.existsSync(buildDir)) {
      process.stderr.write(chalk.red(`Output directory not found: ${buildDir}\n`));
      return false;
    }

    const forgeAbsolute = rglob(buildDir, ".yml");
    const actualAbsolute = rglob(actual, ".yml");

    const forgeRelSet = new Set(
      forgeAbsolute.map((p) => path.relative(buildDir, p))
    );
    const actualRelSet = new Set(
      actualAbsolute.map((p) => path.relative(actual, p))
    );

    const onlyForge = [...forgeRelSet]
      .filter((f) => !actualRelSet.has(f))
      .sort();
    const onlyActual = [...actualRelSet]
      .filter((f) => !forgeRelSet.has(f))
      .sort();
    const shared = [...forgeRelSet]
      .filter((f) => actualRelSet.has(f))
      .sort();

    let matched = 0;
    const diffedFiles: [string, DiffTuple[]][] = [];

    for (const rel of shared) {
      const forgePath = path.join(buildDir, rel);
      const actualPath = path.join(actual, rel);
      const diffs = diff(
        readYaml(forgePath),
        readYaml(actualPath),
        "",
        ignore
      );
      if (diffs.length > 0) {
        diffedFiles.push([rel, diffs]);
      } else {
        matched++;
      }
    }

    for (const [rel, diffs] of diffedFiles) {
      console.log(chalk.yellow(`\n${"─".repeat(60)}`));
      console.log(chalk.bold(chalk.yellow(`DIFF  ${rel}`)));
      console.log(chalk.yellow("─".repeat(60)));
      for (const [p, forgeVal, actualVal] of diffs) {
        console.log(`  ${p}`);
        console.log(chalk.cyan(`    forge:  ${JSON.stringify(forgeVal)}`));
        console.log(chalk.green(`    actual: ${JSON.stringify(actualVal)}`));
      }
    }

    if (onlyForge.length > 0) {
      console.log(chalk.magenta(`\n${"─".repeat(60)}`));
      console.log(
        chalk.bold(
          chalk.magenta(`Only in forge output (${onlyForge.length} files):`)
        )
      );
      for (const f of onlyForge) {
        console.log(chalk.magenta(`  + ${f}`));
      }
    }

    if (onlyActual.length > 0) {
      console.log(chalk.blue(`\n${"─".repeat(60)}`));
      console.log(
        chalk.bold(
          chalk.blue(`Only in actual output (${onlyActual.length} files):`)
        )
      );
      for (const f of onlyActual) {
        console.log(chalk.blue(`  - ${f}`));
      }
    }

    console.log(`\n${"═".repeat(60)}`);
    const total = shared.length + onlyForge.length + onlyActual.length;
    ok =
      diffedFiles.length === 0 &&
      onlyForge.length === 0 &&
      onlyActual.length === 0;
    const summary =
      `  Files: ${total} total  |  ` +
      `${matched} matched  |  ` +
      `${diffedFiles.length} with diffs  |  ` +
      `${onlyForge.length} only-forge  |  ` +
      `${onlyActual.length} only-actual`;
    console.log(
      ok
        ? chalk.bold(chalk.green(summary))
        : chalk.bold(chalk.red(summary))
    );
    console.log("═".repeat(60));
  } finally {
    if (useTmp && tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  return ok;
}
