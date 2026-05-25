import { describe, it, expect } from "vitest";
import { generate } from "../src/generators/relationship.js";
import type { Entity } from "../src/model.js";

function makeEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    name: "deal",
    display_name: "Deal",
    display_name_plural: "Deals",
    ownership: "user",
    columns: [],
    relationships: [],
    ...overrides,
  };
}

describe("relationship generator", () => {
  it("prefixes related_table for a custom entity", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "contact", lookup_column: "contact_id" }],
    });
    const files = generate(entity, "ts", new Set(), 1033);
    const keys = Object.keys(files);
    const relKey = keys.find((k) => k.includes("contact"));
    expect(relKey).toBeDefined();
    // relationship name starts with prefixed custom entity name
    expect(relKey).toMatch(/entityrelationships\/ts__ts_contact__/);

    const rel = Object.values(files).find((_, i) => keys[i].includes("contact")) as Record<string, unknown>;
    const er = (rel as { EntityRelationship: Record<string, unknown> }).EntityRelationship;
    expect(er["ReferencedEntityName"]).toBe("ts_contact");
  });

  it("does not prefix related_table for a system table", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "account", lookup_column: "account_id" }],
    });
    const systemTableNames = new Set(["account"]);
    const files = generate(entity, "ts", systemTableNames, 1033);
    const keys = Object.keys(files);
    const relKey = keys.find((k) => k.includes("account"));
    expect(relKey).toBeDefined();
    // relationship name starts with bare system table name, not ts_account__
    expect(relKey).toMatch(/entityrelationships\/ts__account__/);

    const rel = Object.values(files).find((_, i) => keys[i].includes("account")) as Record<string, unknown>;
    const er = (rel as { EntityRelationship: Record<string, unknown> }).EntityRelationship;
    expect(er["ReferencedEntityName"]).toBe("account");
  });

  it("still prefixes the referencing entity and lookup column for system table relationships", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "account", lookup_column: "account_id" }],
    });
    const systemTableNames = new Set(["account"]);
    const files = generate(entity, "ts", systemTableNames, 1033);
    const keys = Object.keys(files);
    const relKey = keys.find((k) => k.includes("account"));
    expect(relKey).toBeDefined();

    const rel = Object.values(files).find((_, i) => keys[i].includes("account")) as Record<string, unknown>;
    const er = (rel as { EntityRelationship: Record<string, unknown> }).EntityRelationship;
    expect(er["ReferencingEntityName"]).toBe("ts_deal");
    expect(er["ReferencingAttributeName"]).toBe("ts_account_id");
  });
});
