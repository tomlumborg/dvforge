import fs from "fs";
import path from "path";
import { z } from "zod";
import { readYaml } from "./utils.js";
import {
  Config,
  Column,
  Entity,
  OptionSet,
  OptionSetSchema,
  Relationship,
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
    const raw = readYaml(path.join(entitiesDir, file)) as Record<string, unknown>;
    const list = (raw["entities"] as unknown[] | undefined) ?? [];
    for (const ent of list) {
      entities.push(parseEntity(ent as Record<string, unknown>));
    }
  }
  return entities;
}

function parseEntity(raw: Record<string, unknown>): Entity {
  const columns = ((raw["columns"] as unknown[] | null | undefined) ?? []).map((c) =>
    parseColumn(c as Record<string, unknown>)
  );
  const relationships = ((raw["relationships"] as unknown[] | null | undefined) ?? []).map(
    (r) => parseRelationship(r as Record<string, unknown>)
  );
  return {
    name: raw["name"] as string,
    display_name: raw["display_name"] as string,
    display_name_plural: raw["display_name_plural"] as string,
    description: (raw["description"] as string | null | undefined) ?? null,
    ownership: (raw["ownership"] as "user" | "organization" | undefined) ?? "user",
    columns,
    relationships,
  } satisfies Entity;
}

function parseColumn(raw: Record<string, unknown>): Column {
  return {
    name: raw["name"] as string,
    type: raw["type"] as Column["type"],
    display_name: raw["display_name"] as string,
    required: (raw["required"] as boolean | undefined) ?? false,
    primary_name: (raw["primary_name"] as boolean | undefined) ?? false,
    max_length: (raw["max_length"] as number | null | undefined) ?? null,
    option_set: (raw["option_set"] as string | null | undefined) ?? null,
    related_table: (raw["related_table"] as string | null | undefined) ?? null,
  } satisfies Column;
}

function parseRelationship(raw: Record<string, unknown>): Relationship {
  return {
    related_table: raw["related_table"] as string,
    lookup_column: raw["lookup_column"] as string,
  } satisfies Relationship;
}
