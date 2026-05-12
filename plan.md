# dvforge — Python → NPX Migration Plan

## Context

`dvforge` compiles compact YAML into a Microsoft Dataverse solution tree. The Python package lives in `python/`. The repo was recently reorganised to clear the root for a new npm package. Goal: a TypeScript package in `npx/` runnable via `npx dvforge` with identical CLI interface and identical YAML output.

---

## Step 1 — Scaffolding

Create `npx/` as the npm package root.

**Files to create:**

- `npx/package.json`
- `npx/tsconfig.json`
- `npx/tsup.config.ts`

**`npx/package.json`** (key fields):
```json
{
  "name": "dvforge",
  "version": "0.1.0",
  "bin": { "dvforge": "./dist/cli.js" },
  "files": ["dist"],
  "engines": { "node": ">=18" },
  "scripts": {
    "build": "tsup",
    "postbuild": "chmod +x dist/cli.js",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "chalk": "^5",
    "commander": "^12",
    "uuid": "^10",
    "yaml": "^2",
    "zod": "^3",
    "zod-to-json-schema": "^3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "tsup": "^8",
    "typescript": "^5"
  }
}
```

**`npx/tsup.config.ts`**:
```ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["cli.ts"],
  format: ["cjs"],
  target: "node18",
  bundle: true,
  shims: true,
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
});
```

**`npx/tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["."]
}
```

---

## Step 2 — Data Models (`npx/model.ts`)

Port `python/dvforge/model.py` (Pydantic → Zod).

Each Pydantic model becomes a Zod schema. Infer TypeScript types with `z.infer<typeof ...>`.

Key mappings:
| Python | TypeScript/Zod |
|---|---|
| `Literal["a","b"]` | `z.enum(["a","b"])` |
| `Optional[str] = None` | `z.string().nullish()` |
| `bool = False` | `z.boolean().default(false)` |
| `@model_validator` cross-field check | `.superRefine(...)` on Column schema |

Models to port: `Publisher`, `Solution`, `OptionValue`, `OptionSet`, `Column` (with cross-field validator), `Relationship`, `Entity`, `Config`.

---

## Step 3 — Utilities (`npx/utils.ts`)

Port `python/dvforge/utils.py`.

```ts
import { v5 as uuidv5 } from "uuid";
import { Scalar, stringify, parse } from "yaml";
import fs from "fs";
import path from "path";

const NAMESPACE_URL = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export const prefixed = (name: string, prefix: string) => `${prefix}_${name}`;
export const detUuid = (seed: string) => uuidv5(seed, NAMESPACE_URL);

// Wraps a JS number in a YAML Scalar that serialises as e.g. 1.0 not 1
export function f(n: number): Scalar {
  const s = new Scalar(n);
  s.type = Scalar.FLOAT;
  return s;
}

export function writeYaml(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, stringify(data, {
    lineWidth: 0,
    nullStr: "",
    defaultStringType: "PLAIN",
    defaultKeyType: "PLAIN",
  }), "utf-8");
}

export function readYaml(filePath: string): unknown {
  return parse(fs.readFileSync(filePath, "utf-8"));
}
```

**UUID note:** `NAMESPACE_URL` is Python's `uuid.NAMESPACE_URL`. Both runtimes implement RFC 4122 v5 identically — same seed → same output.

**Float note:** JavaScript has no float/int distinction, so `1.0 → 1` in YAML. The `f()` helper wraps values in a yaml `Scalar` with type `FLOAT` so they serialise as `1.0`.

---

## Step 4 — Loader (`npx/loader.ts`)

Port `python/dvforge/loader.py`.

Reads three YAML sources and returns a typed `Config`:
1. `{input}/solution.yml` — parse then validate with `SolutionFileSchema`
2. `{input}/optionsets.yml` — optional, validate with `OptionSetsFileSchema`
3. `{input}/entities/*.yml` — sorted glob, validate each with `EntitiesFileSchema`

Use `fs.readdirSync(...).sort()` for sorted glob. Use `readYaml` + Zod parse for validation.

---

## Step 5 — Simple Generators

Port these four generators (all straightforward dict → object translations):

### `npx/generators/ribbondiff.ts`
Port `python/dvforge/generators/ribbondiff.py`. Fixed structure, no float values.

### `npx/generators/publisher.ts`
Port `python/dvforge/generators/publisher.py`. Contains `_nil()` helper returning `{ '@xsi:nil': true, '@xmlns:xsi': '...' }` and an `_address()` builder.

### `npx/generators/optionset.ts`
Port `python/dvforge/generators/optionset.py`. Note: `IntroducedVersion: '1.0.0.0'` is a **string** here (not a float) — no `f()` needed.

### `npx/generators/entity.ts`
Port `python/dvforge/generators/entity.py`. Note: `IntroducedVersion: f(1.0)` — this IS a float in the Python source.

---

## Step 6 — Attribute Generator (`npx/generators/attribute.ts`)

Port `python/dvforge/generators/attribute.py` (the largest file, 448 lines). Lives at `npx/generators/attribute.ts`.

Key points:
- `_base()` returns a plain object with fixed insertion order — maintain key order exactly
- `_MODIFIABLE` constant merged in at end of `_base()` — spread it in the same position
- Float values: `version=1.0` → pass `f(1.0)` at every `_base()` call that uses `1.0`; `version='1.0.0.0'` (string) → no wrapper needed
- `_custom_lookup` line 186 (`d['ImeMode']`) is a no-op read in Python — **ImeMode stays in the object**. Just include it normally in TypeScript
- `statecode` and `statuscode` attributes use inline `optionset` objects with `IntroducedVersion: f(1.0)`
- System `_slookup`, `_sdatetime`, `_sint` helpers all use `version=1.0` → `f(1.0)`

---

## Step 7 — Remaining Generators

### `npx/generators/relationship.ts`
Port `python/dvforge/generators/relationship.py`.

Key: `_rel()` conditionally inserts `CascadeRollupView` and `IsValidForAdvancedFind` between `CascadeUnshare` and `ReferencingAttributeName` when `is_custom=true`. Maintain this key order exactly.
System relationships use `introduced_version=1.0` → `f(1.0)`. Custom relationships use `'1.0.0.0'` string.

### `npx/generators/formxml.ts`
Port `python/dvforge/generators/formxml.py`. Three form builders: main, quick, card. All use `detUuid()` for deterministic IDs. Use `f(1.0)` for `IntroducedVersion`.

### `npx/generators/savedquery.ts`
Port `python/dvforge/generators/savedquery.py`. Seven view builders. Use `f(1.0)` for `IntroducedVersion` and `@version`.

### `npx/generators/solution.ts`
Port `python/dvforge/generators/solution.py`. The `_component_paths()` sort logic must be ported exactly — it determines solution component ordering. `@SolutionPackageVersion` is `f(9.2)`.

---

## Step 8 — Compiler (`npx/compiler.ts`)

Port `python/dvforge/compiler.py` into `npx/compiler.ts`. Orchestrates all generators, collects a `Map<string, unknown>`, then:
1. `fs.rmSync(outputDir, { recursive: true, force: true })`
2. `fs.mkdirSync(outputDir, { recursive: true })`
3. Write each file via `writeYaml`

Generator call order must match Python exactly:
`publisher → optionsets → per-entity (entity, attribute, formxml, savedquery, ribbondiff, relationship) → solution`

---

## Step 9 — CLI (`npx/cli.ts`)

Port `python/dvforge/__main__.py` using `commander` into `npx/cli.ts`.

Three subcommands:
- `build` — `--input` (required), `--output` (required), `--version`, `--unmanaged`, `--dry-run`
- `test` — `--input` (required), `--actual` (required), `--out`, `--version`, `--unmanaged`, `--skip-build`, `--ignore-key` (repeatable collector)
- `schema` — `--output` (default: `.`)

Note: `--ignore-key` is repeatable in click (`multiple=True`). In commander use a collector:
```ts
.option("--ignore-key <key>", "...", (v, acc: string[]) => [...acc, v], [])
```

---

## Step 10 — Tester (`npx/tester.ts`)

Port `python/dvforge/tester.py`.

- Recursive `_diff()` function: compare two parsed YAML values, return array of `[path, forgeVal, actualVal]` triples
- Use `os.tmpdir()` + random suffix when `outDir` is not provided (replaces Python's `tempfile.TemporaryDirectory`)
- Coloured output via `chalk`: cyan for forge values, green for actual, yellow/magenta/blue for section headers

Default ignored keys (always applied): `@version`, `Managed` — plus any `--ignore-key` values passed by the user.

---

## Step 11 — Schema Generator (`npx/schemaGen.ts`)

Port `python/dvforge/schema_gen.py`.

Port `python/dvforge/schema_gen.py` into `npx/schemaGen.ts`. Use `zod-to-json-schema` to convert Zod schemas to JSON Schema objects. Wrap each in an envelope schema matching the Python `_SolutionFile`, `_OptionSetsFile`, `_EntitiesFile` wrappers.

Write JSON with `JSON.stringify(..., null, 2)`. Read/merge `.vscode/settings.json` with graceful JSON parse failure.

---

## Step 12 — Build & Verify

```bash
cd npx
npm install
npm run build      # tsup bundles to dist/cli.js
npm run typecheck  # tsc --noEmit
```

Then verify UUID compatibility:
```bash
node -e "const {v5}=require('uuid'); console.log(v5('ts_deal:main','6ba7b810-9dad-11d1-80b4-00c04fd430c8'))"
python3 -c "import uuid; print(uuid.uuid5(uuid.NAMESPACE_URL, 'ts_deal:main'))"
# Both should print the same UUID
```

Then do a build diff against Python output:
```bash
dvforge build --input ./test-fixture --output /tmp/py-out     # Python
node dist/cli.js build --input ./test-fixture --output /tmp/ts-out  # TypeScript
diff -r /tmp/py-out /tmp/ts-out
```

Fix any float formatting differences by adding `f()` wrappers until diff is clean.

---

## Step 13 — CI Workflow

Create `.github/workflows/publish-npm.yml`:

```yaml
name: Publish to npm
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: npx
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Existing `python/.github/workflows/publish.yml` (PyPI) is unchanged.

---

## Dependency Reference

| npm package | Python equivalent | Purpose |
|---|---|---|
| `commander@12` | `click>=8` | CLI subcommands and options |
| `yaml@2` | `ruamel.yaml` | YAML parse/stringify with key-order preservation |
| `zod@3` | `pydantic>=2.0` | Runtime validation + TypeScript type inference |
| `zod-to-json-schema@3` | `pydantic BaseModel.model_json_schema()` | Generate JSON schemas for `schema` command |
| `uuid@10` | Python `uuid` stdlib | Deterministic uuid5 (identical output to Python) |
| `tsup@8` | `build` | Bundle all source to single `dist/cli.js` |
| `chalk@5` | click `secho` | Coloured diff output in tester |
