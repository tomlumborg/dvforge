import fs from "fs";
import path from "path";
import { z } from "zod";
import { readYaml } from "./utils.js";
import {
  Config,
  Entity,
  EntitySchema,
  OptionSet,
  OptionSetSchema,
  Solution,
  SolutionSchema,
} from "./model.js";

export function load(inputDir: string): Config {
  try {
    const solution = loadSolution(path.join(inputDir, "solution.yml"));
    const optionSets = loadOptionSets(path.join(inputDir, "optionsets.yml"));
    const entities = loadEntities(path.join(inputDir, "entities"));
    return { solution, option_sets: optionSets, entities };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
      throw new Error(`Invalid configuration:\n${issues}`);
    }
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`File not found: ${(err as NodeJS.ErrnoException).path}`);
    }
    throw err;
  }
}

function loadSolution(filePath: string): Solution {
  const raw = readYaml(filePath);
  const parsed = z.object({ solution: SolutionSchema }).parse(raw);
  return parsed.solution;
}

function loadOptionSets(filePath: string): OptionSet[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = readYaml(filePath);
  const parsed = z.object({ optionsets: z.array(OptionSetSchema).default([]) }).parse(raw);
  return parsed.optionsets;
}

function loadEntities(entitiesDir: string): Entity[] {
  if (!fs.existsSync(entitiesDir)) return [];
  const files = fs.readdirSync(entitiesDir).sort();
  const entities: Entity[] = [];
  for (const file of files) {
    if (!file.endsWith(".yml")) continue;
    const raw = readYaml(path.join(entitiesDir, file));
    const parsed = z.object({ entities: z.array(EntitySchema).default([]) }).parse(raw);
    entities.push(...parsed.entities);
  }
  return entities;
}
