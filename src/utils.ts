import { v5 as uuidv5 } from "uuid";
import { Scalar, stringify, parse } from "yaml";
import fs from "fs";
import path from "path";

export function prefixed(name: string, prefix: string): string {
  return `${prefix}_${name}`;
}

const DVFORGE_NAMESPACE = "3aade439-8a5c-5a2b-bbc7-58af78221838";

export function detUuid(seed: string): string {
  return uuidv5(seed, DVFORGE_NAMESPACE);
}

export function floatScalar(n: number, fractionDigits = 1): Scalar {
  const s = new Scalar(n);
  s.minFractionDigits = fractionDigits;
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
