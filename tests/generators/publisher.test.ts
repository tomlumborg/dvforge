import { describe, it, expect } from "vitest";
import { generate } from "../../src/generators/publisher.js";
import type { Publisher } from "../../src/model.js";

const minimalPublisher: Publisher = {
  name: "contoso",
  display_name: "Contoso",
  prefix: "con",
  option_value_prefix: 10000,
};

describe("publisher generator", () => {
  it("generates expected output for minimal valid input", () => {
    const result = generate(minimalPublisher);
    expect(result).toMatchSnapshot();
  });

  it("uses publisher name in file path", () => {
    const result = generate(minimalPublisher);
    expect(Object.keys(result)[0]).toBe("publishers/contoso/publisher.yml");
  });

  it("sets prefix and option value prefix on the output", () => {
    const result = generate(minimalPublisher);
    const data = Object.values(result)[0] as { Publisher: { CustomizationPrefix: string; CustomizationOptionValuePrefix: number } };
    expect(data.Publisher.CustomizationPrefix).toBe("con");
    expect(data.Publisher.CustomizationOptionValuePrefix).toBe(10000);
  });

  it("generates two addresses", () => {
    const result = generate(minimalPublisher);
    const data = Object.values(result)[0] as { Publisher: { Addresses: { Address: unknown[] } } };
    expect(data.Publisher.Addresses.Address).toHaveLength(2);
  });
});
