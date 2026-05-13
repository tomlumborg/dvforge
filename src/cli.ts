import { Command } from "commander";
import path from "path";
import { load } from "./loader.js";
import { compile } from "./compiler.js";
import { run as testerRun } from "./tester.js";
import { generate as schemaGenerate } from "./schemaGen.js";

const program = new Command();
program.name("dvforge");

// ── build ─────────────────────────────────────────────────────────────────────

program
  .command("build")
  .requiredOption("--input <dir>", "Path to input YAML directory")
  .requiredOption("--output <dir>", "Path to write compiled solution files")
  .option("--version <ver>", "Override solution version (e.g. 1.2.0.0)")
  .option("--unmanaged", "Generate an unmanaged solution (default: managed)", false)
  .option("--dry-run", "Print output paths without writing files", false)
  .action((opts: { input: string; output: string; version?: string; unmanaged: boolean; dryRun: boolean }) => {
    try {
      const config = load(opts.input);

      if (opts.version) {
        config.solution.version = opts.version;
      }

      const managed = !opts.unmanaged;

      console.log(`Solution : ${config.solution.name} v${config.solution.version} (${opts.unmanaged ? "unmanaged" : "managed"})`);
      console.log(`Publisher: ${config.solution.publisher.name} (${config.solution.publisher.prefix}_)`);
      console.log(`Entities : ${config.entities.map((e) => e.name).join(", ")}`);
      console.log(`Input    : ${opts.input}`);
      console.log(`Output   : ${opts.output}`);

      if (opts.dryRun) {
        console.log("\n[dry-run] No files written.");
        return;
      }

      compile(config, opts.output, managed);
      console.log("\nDone.");
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// ── test ──────────────────────────────────────────────────────────────────────

program
  .command("test")
  .requiredOption("--input <dir>", "dvforge input directory")
  .requiredOption("--actual <dir>", "pac solution unpack directory to compare against")
  .option("--out <dir>", "Save build output here instead of a temp dir (dir is kept after the run)")
  .option("--version <ver>", "Override solution version (e.g. 1.0.0.1)")
  .option("--unmanaged", "Generate an unmanaged solution (default: managed)", false)
  .option("--skip-build", "Skip building; requires --out pointing at existing output", false)
  .option(
    "--ignore-key <key>",
    "YAML key to skip in comparison (repeatable)",
    (v: string, acc: string[]) => [...acc, v],
    [] as string[]
  )
  .action(
    async (opts: {
      input: string;
      actual: string;
      out?: string;
      version?: string;
      unmanaged: boolean;
      skipBuild: boolean;
      ignoreKey: string[];
    }) => {
      try {
        if (opts.skipBuild && !opts.out) {
          console.error("error: --skip-build requires --out <existing output directory>");
          process.exit(1);
        }

        // known keys to ignore
        const ignore = new Set([...opts.ignoreKey, "@version", "Managed"]);

        const ok = await testerRun({
          inputDir: opts.input,
          actual: opts.actual,
          outDir: opts.out ?? null,
          solVersion: opts.version ?? null,
          unmanaged: opts.unmanaged,
          skipBuild: opts.skipBuild,
          ignore,
        });

        process.exit(ok ? 0 : 1);
      } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
      }
    }
  );

// ── schema ────────────────────────────────────────────────────────────────────

program
  .command("schema")
  .option("--output <dir>", "Project root to write schemas into (default: current directory)", ".")
  .action((opts: { output: string }) => {
    const outputDir = path.resolve(opts.output);
    const written = schemaGenerate(outputDir);
    for (const p of written) {
      console.log(`  ${path.relative(outputDir, p)}`);
    }
    console.log("\n.vscode/settings.json updated.");
  });

program.parse();
