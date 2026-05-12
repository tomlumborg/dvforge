import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { SolutionSchema, OptionSetSchema, EntitySchema } from "./model.js";
import fs from "fs";
import path from "path";

const SolutionFileSchema = z.object({ solution: SolutionSchema });
const OptionSetsFileSchema = z.object({ optionsets: z.array(OptionSetSchema) });
const EntitiesFileSchema = z.object({ entities: z.array(EntitySchema) });

const SCHEMAS = [
  { filename: "solution.schema.json",   schema: SolutionFileSchema,   glob: "solution.yml" },
  { filename: "optionsets.schema.json", schema: OptionSetsFileSchema, glob: "optionsets.yml" },
  { filename: "entities.schema.json",   schema: EntitiesFileSchema,   glob: "entities/*.yml" },
];

export function generate(projectDir: string): string[] {
  const schemasDir = path.join(projectDir, "schemas");
  fs.mkdirSync(schemasDir, { recursive: true });

  const written: string[] = [];
  for (const { filename, schema } of SCHEMAS) {
    const p = path.join(schemasDir, filename);
    fs.writeFileSync(p, JSON.stringify(zodToJsonSchema(schema), null, 2));
    written.push(p);
  }

  updateVscodeSettings(projectDir, schemasDir);
  return written;
}

function updateVscodeSettings(projectDir: string, schemasDir: string): void {
  const vscodeDir = path.join(projectDir, ".vscode");
  fs.mkdirSync(vscodeDir, { recursive: true });
  const settingsPath = path.join(vscodeDir, "settings.json");

  let settings: Record<string, unknown> = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    } catch {
      // ignore JSON parse errors, start fresh
    }
  }

  const rel = path.relative(projectDir, schemasDir).replace(/\\/g, "/");
  settings["yaml.schemas"] = Object.fromEntries(
    SCHEMAS.map(({ filename, glob }) => [`./${rel}/${filename}`, glob])
  );

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
}
