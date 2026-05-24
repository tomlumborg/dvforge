import { describe, it, expect } from "vitest";
import { generate } from "../../src/generators/optionset.js";
import type { OptionSet } from "../../src/model.js";

const BASE_PREFIX = "pfx";

const minimalOptionSet: OptionSet = {
  name: "order_status",
  display_name: "Order Status",
  options: [
    { label: "Pending", value: 100000 },
    { label: "Active", value: 100001 },
    { label: "Closed", value: 100002 },
  ],
};

describe("optionset generator", () => {
  it("generates expected output for minimal valid input", () => {
    const result = generate(minimalOptionSet, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });

  it("uses prefixed name in file path", () => {
    const result = generate(minimalOptionSet, BASE_PREFIX);
    expect(Object.keys(result)[0]).toBe("optionsets/pfx_order_status/optionset.yml");
  });

  it("generates one option entry per option value", () => {
    const result = generate(minimalOptionSet, BASE_PREFIX);
    const data = Object.values(result)[0] as { optionset: { options: { option: unknown[] } } };
    expect(data.optionset.options.option).toHaveLength(3);
  });

  it("generates expected output for a single-option set", () => {
    const single: OptionSet = {
      name: "flag",
      display_name: "Flag",
      options: [{ label: "Yes", value: 100000 }],
    };
    const result = generate(single, BASE_PREFIX);
    expect(result).toMatchSnapshot();
  });
});
