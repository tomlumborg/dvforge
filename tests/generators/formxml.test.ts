import { describe, it, expect } from "vitest";
import { generate } from "../../src/generators/formxml.js";
import type { Entity } from "../../src/model.js";

const BASE_PREFIX = "pfx";

function makeEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    name: "order",
    display_name: "Order",
    display_name_plural: "Orders",
    description: null,
    ownership: "user",
    columns: [
      {
        name: "name",
        type: "string",
        display_name: "Name",
        required: false,
        primary_name: true,
        max_length: null,
        option_set: null,
        related_table: null,
      },
    ],
    relationships: [],
    ...overrides,
  };
}

describe("formxml generator", () => {
  it("generates expected output for minimal valid input", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates exactly three forms (main, quick, card)", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    const keys = Object.keys(result);
    expect(keys).toHaveLength(3);
    expect(keys.some((k) => k.includes("/main/"))).toBe(true);
    expect(keys.some((k) => k.includes("/quick/"))).toBe(true);
    expect(keys.some((k) => k.includes("/card/"))).toBe(true);
  });

  it("uses prefixed entity name in file paths", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    for (const key of Object.keys(result)) {
      expect(key).toMatch(/^entities\/pfx_order\/formxml\//);
    }
  });

  it("produces stable deterministic UUIDs for the same input", () => {
    const first = generate(makeEntity(), BASE_PREFIX);
    const second = generate(makeEntity(), BASE_PREFIX);
    expect(Object.keys(first)).toEqual(Object.keys(second));
  });
});
