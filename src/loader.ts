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

function formatZodError(filePath: string, err: z.ZodError): Error {
  const issues = err.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  return new Error(`${path.relative(process.cwd(), filePath)}:\n${issues}`);
}

export function load(inputDir: string): Config {
  try {
    const solution = loadSolution(path.join(inputDir, "solution.yml"));
    const optionSets = loadOptionSets(path.join(inputDir, "optionsets.yml"));
    const entities = loadEntities(path.join(inputDir, "entities"));
    return { solution, option_sets: optionSets, entities };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`File not found: ${(err as NodeJS.ErrnoException).path}`);
    }
    throw err;
  }
}

function loadSolution(filePath: string): Solution {
  try {
    const raw = readYaml(filePath);
    const parsed = z.object({ solution: SolutionSchema }).parse(raw);
    return parsed.solution;
  } catch (err) {
    if (err instanceof z.ZodError) throw formatZodError(filePath, err);
    throw err;
  }
}

function loadOptionSets(filePath: string): OptionSet[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = readYaml(filePath);
    const parsed = z.object({ optionsets: z.array(OptionSetSchema).default([]) }).parse(raw);
    return parsed.optionsets;
  } catch (err) {
    if (err instanceof z.ZodError) throw formatZodError(filePath, err);
    throw err;
  }
}

function loadEntities(entitiesDir: string): Entity[] {
  if (!fs.existsSync(entitiesDir)) return [];
  const files = fs.readdirSync(entitiesDir).sort();
  const entities: Entity[] = [];
  for (const file of files) {
    if (!file.endsWith(".yml")) continue;
    const filePath = path.join(entitiesDir, file);
    try {
      const raw = readYaml(filePath);
      const parsed = z.object({ entities: z.array(EntitySchema).default([]) }).parse(raw);
      entities.push(...parsed.entities);
    } catch (err) {
      if (err instanceof z.ZodError) throw formatZodError(filePath, err);
      throw err;
    }
  }
  return entities;
}
