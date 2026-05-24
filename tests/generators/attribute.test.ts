import { describe, it, expect } from "vitest";
import { generate } from "../../src/generators/attribute.js";
import type { Column, Entity } from "../../src/model.js";

const BASE_PREFIX = "dvforge";

function makeEntity(columns: Column[]): Entity {
  return {
    name: "deal",
    display_name: "Deal",
    display_name_plural: "Deals",
    description: null,
    ownership: "user",
    columns,
    relationships: [],
  };
}

function col(overrides: Partial<Column> & { name: string; type: Column["type"]; display_name: string }): Column {
  return {
    required: false,
    primary_name: false,
    max_length: null,
    option_set: null,
    related_table: null,
    ...overrides,
  };
}

const nameCol = col({ name: "name", type: "string", display_name: "Name", primary_name: true });

describe("attribute generator", () => {
  it("generates expected output for minimal valid input (string column)", () => {
    const entity = makeEntity([nameCol]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for lookup column", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "account", type: "lookup", display_name: "Account", related_table: "account" }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for choice column", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "stage_choice", type: "choice", display_name: "Stage", option_set: "deal_stage" }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for datetime column", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "won_at", type: "datetime", display_name: "Won At" }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for dateonly column", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "due_date", type: "dateonly", display_name: "Due Date" }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for int column", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "quantity", type: "int", display_name: "Quantity" }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output when required is true", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "ref_number", type: "string", display_name: "Reference Number", required: true }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output when required is false", () => {
    const entity = makeEntity([
      nameCol,
      col({ name: "ref_number", type: "string", display_name: "Reference Number", required: false }),
    ]);
    const result = generate(entity, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });
});
