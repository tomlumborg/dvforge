import { z } from "zod";

export const PublisherSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  prefix: z.string(),
  option_value_prefix: z.number().int(),
});

export const SolutionSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  version: z.string(),
  publisher: PublisherSchema,
});

export const OptionValueSchema = z.object({
  label: z.string(),
  value: z.number().int(),
});

export const OptionSetSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  options: z.array(OptionValueSchema),
});

export const ColumnSchema = z
  .object({
    name: z.string(),
    type: z.enum(["string", "lookup", "choice", "datetime", "dateonly", "int"]),
    display_name: z.string(),
    required: z.boolean().default(false),
    primary_name: z.boolean().default(false),
    max_length: z.number().int().nullish(),
    option_set: z.string().nullish(),
    related_table: z.string().nullish(),
  })
  .superRefine((col, ctx) => {
    if (col.type === "choice" && !col.option_set) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Column '${col.name}': choice columns must specify option_set`,
      });
    }
    if (col.type === "lookup" && !col.related_table) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Column '${col.name}': lookup columns must specify related_table`,
      });
    }
    if (["datetime", "dateonly", "int"].includes(col.type) && col.related_table) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Column '${col.name}': datetime/dateonly/int columns cannot specify related_table`,
      });
    }
    if (["datetime", "dateonly", "int"].includes(col.type) && col.option_set) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Column '${col.name}': datetime/dateonly/int columns cannot specify option_set`,
      });
    }
  });

export const RelationshipSchema = z.object({
  related_table: z.string(),
  lookup_column: z.string(),
});

export const EntitySchema = z
  .object({
    name: z.string(),
    display_name: z.string(),
    display_name_plural: z.string(),
    description: z.string().nullish(),
    ownership: z.enum(["user", "organization"]).default("user"),
    columns: z.array(ColumnSchema).default([]),
    relationships: z.array(RelationshipSchema).default([]),
  })
  .superRefine((entity, ctx) => {
    const primaryNameCount = entity.columns.filter((c) => c.primary_name).length;
    if (primaryNameCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Entity '${entity.name}': exactly one column must have primary_name: true (found ${primaryNameCount})`,
      });
    }

    const columnNames = entity.columns.map((c) => c.name);
    const duplicateColumns = columnNames.filter((n, i) => columnNames.indexOf(n) !== i);
    for (const name of [...new Set(duplicateColumns)]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Entity '${entity.name}': duplicate column name '${name}'`,
      });
    }

    const lookupColumns = entity.relationships.map((r) => r.lookup_column);
    const duplicateLookups = lookupColumns.filter((n, i) => lookupColumns.indexOf(n) !== i);
    for (const name of [...new Set(duplicateLookups)]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Entity '${entity.name}': lookup_column '${name}' is used in more than one relationship`,
      });
    }
  });

export const ConfigSchema = z.object({
  solution: SolutionSchema,
  option_sets: z.array(OptionSetSchema),
  entities: z.array(EntitySchema),
});

export type Publisher = z.infer<typeof PublisherSchema>;
export type Solution = z.infer<typeof SolutionSchema>;
export type OptionValue = z.infer<typeof OptionValueSchema>;
export type OptionSet = z.infer<typeof OptionSetSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type Config = z.infer<typeof ConfigSchema>;
