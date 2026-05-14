import { Config } from "./model.js";

type Column = Config["entities"][number]["columns"][number];
type Relationship = Config["entities"][number]["relationships"][number];

// Cross-reference checks run after all files are loaded — Zod validates each file in isolation
// so these references can only be verified once the full config is assembled.
export function validateRefs(config: Config): void {
  const entityNames = new Set(config.entities.map((e) => e.name));
  const optionSetNames = new Set(config.option_sets.map((o) => o.name));
  const errors: string[] = [];

  for (const entity of config.entities) {
    for (const col of entity.columns) {
      errors.push(...columnRelatedTableMatchesEntity(entity.name, col, entityNames));
      errors.push(...columnOptionSetMatchesOptionSet(entity.name, col, optionSetNames));
    }
    for (const rel of entity.relationships) {
      errors.push(...relationshipTableMatchesEntity(entity.name, rel, entityNames));
      errors.push(...relationshipLookupColumnExistsAndIsLookupType(entity.name, rel, entity.columns));
    }
  }

  if (errors.length > 0) {
    throw new Error(`Reference validation failed:\n${errors.map((e) => `  ${e}`).join("\n")}`);
  }
}

function columnRelatedTableMatchesEntity(entityName: string, col: Column, entityNames: Set<string>): string[] {
  if (col.related_table && !entityNames.has(col.related_table)) {
    return [`Entity '${entityName}', column '${col.name}': related_table '${col.related_table}' does not match any entity`];
  }
  return [];
}

function columnOptionSetMatchesOptionSet(entityName: string, col: Column, optionSetNames: Set<string>): string[] {
  if (col.option_set && !optionSetNames.has(col.option_set)) {
    return [`Entity '${entityName}', column '${col.name}': option_set '${col.option_set}' does not match any option set`];
  }
  return [];
}

function relationshipTableMatchesEntity(entityName: string, rel: Relationship, entityNames: Set<string>): string[] {
  if (!entityNames.has(rel.related_table)) {
    return [`Entity '${entityName}', relationship: related_table '${rel.related_table}' does not match any entity`];
  }
  return [];
}

function relationshipLookupColumnExistsAndIsLookupType(entityName: string, rel: Relationship, columns: Column[]): string[] {
  const col = columns.find((c) => c.name === rel.lookup_column);
  if (!col) {
    return [`Entity '${entityName}', relationship: lookup_column '${rel.lookup_column}' does not exist on this entity`];
  }
  if (col.type !== "lookup") {
    return [`Entity '${entityName}', relationship: lookup_column '${rel.lookup_column}' must be of type 'lookup' (found '${col.type}')`];
  }
  return [];
}
