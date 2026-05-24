import { describe, it, expect } from "vitest";
import { generate, generateSystemTable } from "../../src/generators/entity.js";
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

describe("entity generator", () => {
  it("generates expected output for minimal valid input", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates UserOwned entity when ownership is user", () => {
    const result = generate(makeEntity({ ownership: "user" }), BASE_PREFIX);
    const entityData = Object.values(result)[0] as { Entity: { EntityInfo: { entity: { OwnershipTypeMask: string } } } };
    expect(entityData.Entity.EntityInfo.entity.OwnershipTypeMask).toBe("UserOwned");
    expect(result).toMatchSnapshot();
  });

  it("generates OrganizationOwned entity when ownership is organization", () => {
    const result = generate(makeEntity({ ownership: "organization" }), BASE_PREFIX);
    const entityData = Object.values(result)[0] as { Entity: { EntityInfo: { entity: { OwnershipTypeMask: string } } } };
    expect(entityData.Entity.EntityInfo.entity.OwnershipTypeMask).toBe("OrganizationOwned");
    expect(result).toMatchSnapshot();
  });

  it("generates system table with unmodified flag", () => {
    const entity = makeEntity({ name: "account", display_name: "Account" });
    const result = generateSystemTable(entity);
    expect(result).toMatchSnapshot();
  });

  it("uses prefixed name in file path for custom entity", () => {
    const result = generate(makeEntity(), BASE_PREFIX);
    expect(Object.keys(result)[0]).toBe("entities/pfx_order/entity.yml");
  });

  it("uses bare name in file path for system table", () => {
    const entity = makeEntity({ name: "account" });
    const result = generateSystemTable(entity);
    expect(Object.keys(result)[0]).toBe("entities/account/entity.yml");
  });
});
