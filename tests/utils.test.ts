import { describe, it, expect } from "vitest";
import { prefixed, detUuid, floatScalar } from "../src/utils.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("prefixed", () => {
  it("returns prefix_name", () => {
    expect(prefixed("name", "pfx")).toBe("pfx_name");
  });

  it("handles multi-word names", () => {
    expect(prefixed("my_column", "cr123")).toBe("cr123_my_column");
  });
});

describe("detUuid", () => {
  it("returns a valid UUID string", () => {
    expect(detUuid("test-seed")).toMatch(UUID_RE);
  });

  it("is deterministic — same seed yields same UUID", () => {
    expect(detUuid("dvforge-seed")).toBe(detUuid("dvforge-seed"));
  });

  it("different seeds produce different UUIDs", () => {
    expect(detUuid("seed-a")).not.toBe(detUuid("seed-b"));
  });
});

describe("floatScalar", () => {
  it("sets minFractionDigits to 1 by default", () => {
    const s = floatScalar(1.0);
    expect(s.minFractionDigits).toBe(1);
    expect(s.value).toBe(1.0);
  });

  it("sets minFractionDigits to the provided value", () => {
    const s = floatScalar(3.14, 2);
    expect(s.minFractionDigits).toBe(2);
    expect(s.value).toBe(3.14);
  });

  it("sets minFractionDigits to 0 when specified", () => {
    const s = floatScalar(42, 0);
    expect(s.minFractionDigits).toBe(0);
  });
});
