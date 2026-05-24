import { describe, it, expect } from "vitest";
import { generate } from "../../src/generators/relationship.js";
import type { Entity } from "../../src/model.js";

const BASE_PREFIX = "pfx";

function makeEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    name: "order",
    display_name: "Order",
    display_name_plural: "Orders",
    description: null,
    ownership: "user",
    columns: [],
    relationships: [],
    ...overrides,
  };
}

describe("relationship generator", () => {
  it("generates expected output for entity with no custom relationships", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for entity with a custom relationship to another custom entity", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "product", lookup_column: "product_id" }],
    });
    const result = generate(entity, BASE_PREFIX, new Set());
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for entity with a relationship to a system table", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "account", lookup_column: "account_id" }],
    });
    const result = generate(entity, BASE_PREFIX, new Set(["account"]));
    expect(result).toMatchSnapshot();
  });

  it("includes six system relationship files for every entity", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    const sysKeys = Object.keys(result).filter((k) =>
      ["business_unit_", "lk_", "owner_", "team_", "user_"].some((prefix) =>
        k.includes(prefix)
      )
    );
    expect(sysKeys).toHaveLength(6);
  });

  it("prefixes referenced entity name for a custom table relationship", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "product", lookup_column: "product_id" }],
    });
    const files = generate(entity, BASE_PREFIX, new Set());
    const relKey = Object.keys(files).find((k) => k.includes("product"));
    expect(relKey).toBeDefined();
    const rel = files[relKey!] as { EntityRelationship: { ReferencedEntityName: string } };
    expect(rel.EntityRelationship.ReferencedEntityName).toBe("pfx_product");
  });

  it("does not prefix referenced entity name for a system table relationship", () => {
    const entity = makeEntity({
      relationships: [{ related_table: "account", lookup_column: "account_id" }],
    });
    const files = generate(entity, BASE_PREFIX, new Set(["account"]));
    const relKey = Object.keys(files).find((k) => k.includes("account__"));
    expect(relKey).toBeDefined();
    const rel = files[relKey!] as { EntityRelationship: { ReferencedEntityName: string } };
    expect(rel.EntityRelationship.ReferencedEntityName).toBe("account");
  });
});
