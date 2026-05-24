import { describe, it, expect } from "vitest";
import { generate } from "../../src/generators/solution.js";
import type { Config } from "../../src/model.js";

const baseConfig: Config = {
  solution: {
    name: "my_solution",
    display_name: "My Solution",
    version: "1.0.0",
    publisher: {
      name: "contoso",
      display_name: "Contoso",
      prefix: "con",
      option_value_prefix: 10000,
    },
  },
  option_sets: [],
  entities: [],
};

const sampleComponentFiles = [
  "entities/con_order/attributes/con_orderid.yml",
  "entities/con_order/attributes/con_name.yml",
  "entities/con_order/formxml/main/some-uuid/systemform.yml",
  "entities/con_order/formxml/quick/some-uuid/systemform.yml",
  "entities/con_order/formxml/card/some-uuid/systemform.yml",
  "entities/con_order/ribbondiffs/ribbondiff.yml",
  "entities/con_order/savedqueries/uuid-1/savedquery.yml",
  "entityrelationships/owner_con_order/entityrelationship.yml",
];

describe("solution generator", () => {
  it("generates expected output for unmanaged solution with no components", () => {
    const result = generate(baseConfig, false, []);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output for managed solution with no components", () => {
    const result = generate(baseConfig, true, []);
    expect(result).toMatchSnapshot();
  });

  it("sets Managed to 1 when managed is true", () => {
    const result = generate(baseConfig, true, []);
    const sol = result["solutions/my_solution/solution.yml"] as {
      ImportExportXml: { SolutionManifest: { Managed: number } };
    };
    expect(sol.ImportExportXml.SolutionManifest.Managed).toBe(1);
  });

  it("sets Managed to 0 when managed is false", () => {
    const result = generate(baseConfig, false, []);
    const sol = result["solutions/my_solution/solution.yml"] as {
      ImportExportXml: { SolutionManifest: { Managed: number } };
    };
    expect(sol.ImportExportXml.SolutionManifest.Managed).toBe(0);
  });

  it("generates exactly four solution files", () => {
    const result = generate(baseConfig, false, []);
    expect(Object.keys(result)).toHaveLength(4);
    expect(Object.keys(result)).toContain("solutions/my_solution/solution.yml");
    expect(Object.keys(result)).toContain("solutions/my_solution/solutioncomponents.yml");
    expect(Object.keys(result)).toContain("solutions/my_solution/rootcomponents.yml");
    expect(Object.keys(result)).toContain("solutions/my_solution/missingdependencies.yml");
  });

  it("generates expected output with component files and custom entity", () => {
    const config: Config = {
      ...baseConfig,
      entities: [
        {
          name: "order",
          display_name: "Order",
          display_name_plural: "Orders",
          description: null,
          ownership: "user",
          columns: [],
          relationships: [],
        },
      ],
    };
    const result = generate(config, false, sampleComponentFiles);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output with existing table entity", () => {
    const config: Config = {
      ...baseConfig,
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          description: null,
          ownership: "user",
          existing_table: true,
          columns: [],
          relationships: [],
        },
      ],
    };
    const result = generate(config, false, []);
    expect(result).toMatchSnapshot();
  });

  it("generates expected output with option sets", () => {
    const config: Config = {
      ...baseConfig,
      option_sets: [
        { name: "status_type", display_name: "Status Type", options: [{ label: "Active", value: 100000 }] },
      ],
    };
    const result = generate(config, false, []);
    expect(result).toMatchSnapshot();
  });
});
