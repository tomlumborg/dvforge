import { describe, it, expect } from "vitest";
import { generate } from "../src/generators/solution.js";
import type { Config } from "../src/model.js";

const baseConfig: Config = {
  solution: {
    name: "mysolution",
    display_name: "My Solution",
    version: "1.0.0.0",
    language_code: 1033,
    publisher: {
      name: "MyPublisher",
      display_name: "My Publisher",
      prefix: "ts",
      option_value_prefix: 10000,
    },
  },
  option_sets: [],
  entities: [
    {
      name: "TransactionCurrency",
      display_name: "",
      display_name_plural: "",
      existing_table: true,
      ownership: "user",
      columns: [],
      relationships: [],
    },
    {
      name: "carehome",
      display_name: "Care Home",
      display_name_plural: "Care Homes",
      ownership: "user",
      columns: [],
      relationships: [],
    },
  ],
};

function componentPaths(result: Record<string, unknown>): string[] {
  const components = result["solutions/mysolution/solutioncomponents.yml"] as {
    SolutionComponents: { Component: Array<{ "@path": string }> };
  };
  return components.SolutionComponents.Component.map((c) => c["@path"]);
}

describe("solution generator", () => {
  it("sorts relationship component paths alphabetically regardless of input casing", () => {
    const componentFiles = [
      "entityrelationships/TransactionCurrency__ts_carehome_ts_currency/entityrelationship.yml",
      "entityrelationships/business_unit_ts_carehome/entityrelationship.yml",
      "entityrelationships/lk_ts_carehome_createdby/entityrelationship.yml",
      "entityrelationships/owner_ts_carehome/entityrelationship.yml",
      "entityrelationships/team_ts_carehome/entityrelationship.yml",
    ];

    const result = generate(baseConfig, false, componentFiles);
    const paths = componentPaths(result).filter((p) => p.startsWith("/entityrelationships/"));

    expect(paths).toEqual([
      "/entityrelationships/business_unit_ts_carehome",
      "/entityrelationships/lk_ts_carehome_createdby",
      "/entityrelationships/owner_ts_carehome",
      "/entityrelationships/team_ts_carehome",
      "/entityrelationships/transactioncurrency__ts_carehome_ts_currency",
    ]);
  });

  it("preserves publisher name casing in the publisher component path", () => {
    const result = generate(baseConfig, false, []);
    const paths = componentPaths(result);
    expect(paths).toContain("/publishers/MyPublisher");
  });
});
