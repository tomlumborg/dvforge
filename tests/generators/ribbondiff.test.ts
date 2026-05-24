import { describe, it, expect } from "vitest";
import { generate, generateSystemTable } from "../../src/generators/ribbondiff.js";
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

describe("ribbondiff generator", () => {
  it("generates expected output for a custom entity", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for a system table entity", () => {
    const entity = makeEntity({ name: "account", display_name: "Account" });
    const result = generateSystemTable(entity);
    expect(result).toMatchSnapshot();
  });

  it("uses prefixed name in file path for custom entity", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    expect(Object.keys(result)[0]).toBe("entities/pfx_order/ribbondiffs/ribbondiff.yml");
  });

  it("uses bare name in file path for system table", () => {
    const entity = makeEntity({ name: "account" });
    const result = generateSystemTable(entity);
    expect(Object.keys(result)[0]).toBe("entities/account/ribbondiffs/ribbondiff.yml");
  });

  it("produces a single file per entity", () => {
    expect(Object.keys(generate(makeEntity(), BASE_PREFIX))).toHaveLength(1);
    expect(Object.keys(generateSystemTable(makeEntity({ name: "account" })))).toHaveLength(1);
  });
});
