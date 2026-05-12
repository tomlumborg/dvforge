import { v5 as uuidv5 } from "uuid";
import { Scalar, stringify, parse } from "yaml";
import fs from "fs";
import path from "path";

export function prefixed(name: string, prefix: string): string {
  return `${prefix}_${name}`;
}

export function detUuid(seed: string): string {
  return uuidv5(seed, uuidv5.URL);
}

// Wraps a number in a YAML Scalar so it serialises as e.g. 1.0 not 1.
// Use this anywhere the Python source has a float literal like 1.0 or 9.2.
export function f(n: number): Scalar {
  const s = new Scalar(n);
  s.minFractionDigits = 1;
  return s;
}

export function writeYaml(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    stringify(data, {
      lineWidth: 0,
      nullStr: "",
      defaultStringType: "PLAIN",
      defaultKeyType: "PLAIN",
    }),
    "utf-8"
  );
}

export function readYaml(filePath: string): unknown {
  return parse(fs.readFileSync(filePath, "utf-8"));
}
