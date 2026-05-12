# dvforge — Project Context & Migration Guide

## What this project is

`dvforge` is a CLI tool that compiles compact, human-friendly YAML files into a complete Microsoft Dataverse-compatible solution tree. The output is ready to be packed with `pac solution pack` for deployment.

The Python package lives in `python/`. This repo is mid-migration to a TypeScript npm package in `npx/` that is runnable via `npx dvforge`. The Python code is the source of truth — the TypeScript must produce **byte-for-byte identical YAML output**.

---

## Repository layout

```
python/                        ← existing Python package (do not modify)
  dvforge/
    __main__.py                ← CLI entry point (click)
    model.py                   ← Pydantic v2 data models
    loader.py                  ← reads input YAML → Config
    compiler.py                ← orchestrates all generators
    utils.py                   ← prefixed(), det_uuid(), write_yaml(), read_yaml()
    tester.py                  ← test/diff command
    schema_gen.py              ← JSON schema gen + .vscode update
    generators/
      entity.py
      attribute.py             ← largest (448 lines)
      formxml.py
      optionset.py
      publisher.py
      relationship.py
      ribbondiff.py
      savedquery.py
      solution.py
  schemas/                     ← generated JSON schemas (solution, optionsets, entities)
  pyproject.toml

npx/                           ← new TypeScript npm package (being built)
  package.json
  tsconfig.json
  tsup.config.ts
  cli.ts
  model.ts
  loader.ts
  compiler.ts
  utils.ts
  tester.ts
  schemaGen.ts
  generators/
    entity.ts
    attribute.ts
    formxml.ts
    optionset.ts
    publisher.ts
    relationship.ts
    ribbondiff.ts
    savedquery.ts
    solution.ts

.github/workflows/
  publish-npm.yml              ← npm publish workflow (to be created)
  python/.github/workflows/    ← PyPI workflows (already exist, do not modify)

plan.md                        ← step-by-step migration plan
```

---

## CLI interface (identical in Python and TypeScript)

```
dvforge build   --input <dir> --output <dir> [--version <ver>] [--unmanaged] [--dry-run]
dvforge test    --input <dir> --actual <dir> [--out <dir>] [--version <ver>]
                [--unmanaged] [--skip-build] [--ignore-key <key>]...
dvforge schema  [--output <dir>]
```

---

## Input file format

**`solution.yml`**
```yaml
solution:
  name: MySolution
  display_name: My Solution
  version: 1.0.0.0
  publisher:
    name: TheSummit
    display_name: TheSummit
    prefix: ts
    option_value_prefix: 12687
```

**`optionsets.yml`** (optional)
```yaml
optionsets:
  - name: deal_stage          # no prefix — dvforge adds ts_
    display_name: Deal Stage
    options:
      - label: Talks Open
        value: 1
```

**`entities/*.yml`**
```yaml
entities:
  - name: deal                # no prefix — dvforge adds ts_
    display_name: Deal
    display_name_plural: Deals
    ownership: user           # user | organization
    columns:
      - name: name
        type: string
        display_name: Name
        required: true
        primary_name: true
      - name: account
        type: lookup
        related_table: account
      - name: stage
        type: choice
        option_set: deal_stage
    relationships:
      - related_table: account
        lookup_column: account
```

Column types: `string`, `lookup`, `choice`, `datetime`, `dateonly`, `int`

---

## npm dependency choices

| npm package | Python equivalent | Why |
|---|---|---|
| `commander@12` | `click>=8` | Clean subcommand API |
| `yaml@2` | `ruamel.yaml` | Insertion-order preservation + `nullStr` option |
| `zod@3` | `pydantic>=2.0` | Runtime validation + TypeScript type inference |
| `zod-to-json-schema@3` | `pydantic BaseModel.model_json_schema()` | JSON schema generation |
| `uuid@10` | Python `uuid` stdlib | Identical RFC 4122 uuid5 implementation |
| `tsup@8` | `build` | Bundles everything to single `dist/cli.js` |
| `chalk@5` | click `secho` | Coloured diff output |

---

## Critical technical details (read before touching any file)

### 1. YAML serialisation options

`yaml.stringify` must be called with these options everywhere:

```ts
import { stringify } from "yaml";
stringify(data, {
  lineWidth: 0,           // ruamel default: no line wrapping
  nullStr: "",            // ruamel serialises Python None as blank, not "null"
  defaultStringType: "PLAIN",
  defaultKeyType: "PLAIN",
})
```

V8 preserves object literal insertion order for string keys (ES2015+), so plain `{}` objects are safe for key ordering.

### 2. Float values — the `f()` helper

JavaScript has no float/int distinction, so `1.0 === 1` and `yaml.stringify({v: 1.0})` outputs `v: 1` not `v: 1.0`. Python's ruamel.yaml outputs `v: 1.0` for Python `float` values.

**Fix:** `npx/utils.ts` exports a helper `f(n)` that wraps a number in a yaml `Scalar` with `type: 'FLOAT'`, forcing decimal output:

```ts
import { Scalar } from "yaml";
export function f(n: number): Scalar {
  const s = new Scalar(n);
  s.type = Scalar.FLOAT;
  return s;
}
```

Use `f(1.0)` anywhere the Python source has the literal `1.0` as a value. Use `f(9.2)` for `@SolutionPackageVersion`. Do NOT use `f()` where the Python source has the **string** `'1.0.0.0'` — those are already strings.

Places that need `f(1.0)`:
- All `IntroducedVersion` fields that come from Python `1.0` (entity, attribute, formxml, savedquery, relationship system attrs)
- `@version: 1.0` in savedquery fetch objects
- `IntroducedVersion` inside inline `optionset` objects in statecode/statuscode attributes

Places that do NOT need `f()`:
- `IntroducedVersion: '1.0.0.0'` (string) — custom lookup, custom choice columns
- `introduced_version='1.0.0.0'` (string) — custom relationships

### 3. Deterministic UUID

Python:
```python
uuid.uuid5(uuid.NAMESPACE_URL, seed)  # NAMESPACE_URL = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
```

TypeScript:
```ts
import { v5 as uuidv5 } from "uuid";
const NAMESPACE_URL = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
uuidv5(seed, NAMESPACE_URL)
```

Both implement RFC 4122 uuid5 identically — same seed → same UUID string.

### 4. `attribute.py` line 186 is a no-op

The Python line `d['ImeMode']  # custom lookups have no ImeMode in the output` is a bare dict read that does nothing. ImeMode stays in the object. Just include it normally in TypeScript.

### 5. Null values

`Descriptions: None` in Python → `Descriptions: null` in JS → `Descriptions:` (blank) in YAML output (handled by `nullStr: ""`).

### 6. `@`-prefixed keys

Keys like `@Name`, `@languagecode`, `@xsi:nil` are plain string keys in the YAML output. The `yaml` package serialises them unquoted — no special handling needed.

---

## Existing file contents you must match

The generated YAML output must match what the Python package produces. The Python generators are in `python/dvforge/generators/`. Read them before implementing the TypeScript equivalents.

---

## Step-by-step implementation

Each step below is self-contained. Start by reading the referenced Python file(s), then create the TypeScript file. Do not modify anything in `python/`.

---

### Step 1 — Scaffolding

**Goal:** Create the npm package root files.

Create these three files:

**`npx/package.json`**
```json
{
  "name": "dvforge",
  "version": "0.1.0",
  "description": "Compile compact YAML into a Dataverse solution tree",
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
    "@types/uuid": "^10",
    "tsup": "^8",
    "typescript": "^5"
  }
}
```

**`npx/tsconfig.json`**
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
  "include": ["."],
  "exclude": ["node_modules", "dist"]
}
```

**`npx/tsup.config.ts`**
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

**Verify:** `cd npx && npm install` should succeed with no errors.

---

### Step 2 — Data Models (`npx/model.ts`)

**Goal:** Port `python/dvforge/model.py` from Pydantic to Zod.

Read: `python/dvforge/model.py`

Each Pydantic `BaseModel` becomes a Zod schema. Use `z.infer<typeof XSchema>` for TypeScript types.

Models to port: `Publisher`, `Solution`, `OptionValue`, `OptionSet`, `Column`, `Relationship`, `Entity`, `Config`.

Key mappings:
- `Literal["a","b"]` → `z.enum(["a","b"])`
- `Optional[str] = None` → `z.string().nullish()`
- `bool = False` → `z.boolean().default(false)`
- `list[X] = []` → `z.array(XSchema).default([])`
- `@model_validator` on `Column` → `.superRefine()` replicating the four checks

The `Column` cross-field validator checks:
1. `type == "choice"` requires `option_set`
2. `type == "lookup"` requires `related_table`
3. `type` in `["datetime","dateonly","int"]` cannot have `related_table`
4. `type` in `["datetime","dateonly","int"]` cannot have `option_set`

Export the inferred types: `Publisher`, `Solution`, `OptionValue`, `OptionSet`, `Column`, `Relationship`, `Entity`, `Config`.
Also export the raw schemas for use in `schemaGen.ts`: `SolutionSchema`, `OptionSetSchema`, `EntitySchema`, etc.

**Verify:** `cd npx && npm run typecheck` passes (once all files exist; stub others as needed).

---

### Step 3 — Utilities (`npx/utils.ts`)

**Goal:** Port `python/dvforge/utils.py` and add the float helper.

Read: `python/dvforge/utils.py`

```ts
import { v5 as uuidv5, v5 } from "uuid";
import { Scalar, stringify, parse } from "yaml";
import fs from "fs";
import path from "path";

const NAMESPACE_URL = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export function prefixed(name: string, prefix: string): string {
  return `${prefix}_${name}`;
}

export function detUuid(seed: string): string {
  return uuidv5(seed, NAMESPACE_URL);
}

// Wraps a number in a YAML Scalar so it serialises as e.g. 1.0 not 1.
// Use this anywhere the Python source has a float literal like 1.0 or 9.2.
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

**Verify UUID compatibility manually:**
```bash
node -e "const {v5}=require('uuid'); console.log(v5('ts_deal:main','6ba7b810-9dad-11d1-80b4-00c04fd430c8'))"
python3 -c "import uuid; print(uuid.uuid5(uuid.NAMESPACE_URL, 'ts_deal:main'))"
# Both should print the same string
```

---

### Step 4 — Loader (`npx/loader.ts`)

**Goal:** Port `python/dvforge/loader.py`.

Read: `python/dvforge/loader.py`

Reads three YAML sources and returns a typed `Config`:
1. `{inputDir}/solution.yml` — parse, validate via Zod
2. `{inputDir}/optionsets.yml` — optional (return `[]` if missing), validate via Zod
3. `{inputDir}/entities/*.yml` — sorted with `readdirSync(...).sort()`, validate each via Zod

Use `readYaml` from `utils.ts`. Throw helpful errors on validation failure (Zod's `.parse()` does this automatically).

Export: `function load(inputDir: string): Config`

---

### Step 5 — Simple Generators

**Goal:** Port four straightforward generators.

#### `npx/generators/ribbondiff.ts`

Read: `python/dvforge/generators/ribbondiff.py`

Fixed-structure object. No float values. Returns `Record<string, unknown>` keyed by relative file path.

```ts
export function generate(entity: Entity, prefix: string): Record<string, unknown> { ... }
```

#### `npx/generators/publisher.ts`

Read: `python/dvforge/generators/publisher.py`

Contains:
- `nil()` helper: `{ '@xsi:nil': true, '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance' }`
- `address(number)` builder using spread of `_NIL_BEFORE` and `_NIL_AFTER` arrays
- No float values (`CustomizationOptionValuePrefix` is an integer, not `1.0`)

#### `npx/generators/optionset.ts`

Read: `python/dvforge/generators/optionset.py`

Note: `IntroducedVersion: '1.0.0.0'` here is a **string** in the Python source — no `f()` needed.

#### `npx/generators/entity.ts`

Read: `python/dvforge/generators/entity.py`

Note: `IntroducedVersion: f(1.0)` — this IS a Python float in the source. Use `f(1.0)`.

---

### Step 6 — Attribute Generator (`npx/generators/attribute.ts`)

**Goal:** Port `python/dvforge/generators/attribute.py` (448 lines, most complex file).

Read: `python/dvforge/generators/attribute.py`

Structure:
- `_MODIFIABLE` constant (shared object spread into all attributes)
- `_base(physical, attrType, name, required, update, read, create, isCustom, audit, version, displayMask, ime)` — builds fixed-order preamble
- Custom column generators: `_primaryKey`, `_customString`, `_customDatetime`, `_customDateonly`, `_customInt`, `_customLookup`, `_customChoice`
- `_systemAttributes(entity, prefix)` — returns 14 system attribute tuples
- `generate(entity, prefix)` — entry point

Key details:
- **`_base()` key order must match Python exactly** — the fixed insertion order is significant
- Float values: all calls to `_base()` with `version=1.0` (a Python float) → use `f(1.0)` in TypeScript. Calls with `version='1.0.0.0'` (string) → plain string
- `_custom_lookup` line 186 (`d['ImeMode']`) is a no-op in Python — ImeMode stays in the object with value `'auto'` from `_base()`. Include ImeMode normally
- `statecode` and `statuscode` are inline objects. Their nested `optionset` objects contain `IntroducedVersion: f(1.0)`
- System attribute helpers `_slookup`, `_sdatetime`, `_sint` all use `version=1.0` → `f(1.0)`
- `ownerid` has `LookupTypes` with an array of two items; other lookups have `LookupTypes: null`

The return type for each generator is `tuple[fieldName: string, data: Record<string, unknown>]` (following the Python `(name, dict)` pattern). Assemble into `Record<string, unknown>` keyed by file path in `generate()`.

---

### Step 7 — Relationship Generator (`npx/generators/relationship.ts`)

**Goal:** Port `python/dvforge/generators/relationship.py`.

Read: `python/dvforge/generators/relationship.py`

Key detail — `_rel()` inserts `CascadeRollupView` and `IsValidForAdvancedFind` conditionally **between** `CascadeUnshare` and `ReferencingAttributeName`. This key insertion position matters for YAML output order:

```ts
const er: Record<string, unknown> = {
  '@Name': name,
  EntityRelationshipType: 'OneToMany',
  // ... all keys up to CascadeUnshare ...
  CascadeUnshare: 'NoCascade',
};
if (isCustom) {
  er['CascadeRollupView'] = 'NoCascade';
  er['IsValidForAdvancedFind'] = 1;
}
er['ReferencingAttributeName'] = referencingAttr;
er['RelationshipDescription'] = { ... };
```

Float values:
- System relationships: `introduced_version=1.0` (Python float) → `f(1.0)`
- Custom relationships: `introduced_version='1.0.0.0'` (Python string) → plain string `'1.0.0.0'`

---

### Step 8 — Form Generator (`npx/generators/formxml.ts`)

**Goal:** Port `python/dvforge/generators/formxml.py`.

Read: `python/dvforge/generators/formxml.py`

Three form builders: `_mainForm`, `_quickForm`, `_cardForm`. All use `detUuid(seed)` for deterministic IDs. Seeds are strings like `"${full}:main"`, `"${full}:main:tab"`, etc.

Use `f(1.0)` for all `IntroducedVersion` fields (they are Python `1.0` floats).

The `_cell` helper and `_emptyCell` helper build cell objects — port them exactly.

Export: `generate(entity: Entity, prefix: string): Record<string, unknown>`

---

### Step 9 — Saved Query Generator (`npx/generators/savedquery.ts`)

**Goal:** Port `python/dvforge/generators/savedquery.py`.

Read: `python/dvforge/generators/savedquery.py`

Seven view builders: `_active`, `_inactive`, `_myRecords`, `_advancedFind`, `_associated`, `_lookupView`, `_quickFind`.

Use `f(1.0)` for:
- `IntroducedVersion: f(1.0)` in all savedquery objects
- `'@version': f(1.0)` in all fetch objects (these are Python `1.0` floats)

---

### Step 10 — Solution Generator (`npx/generators/solution.ts`)

**Goal:** Port `python/dvforge/generators/solution.py`.

Read: `python/dvforge/generators/solution.py`

The `_componentPaths()` function determines solution component ordering — port the sort/grouping logic exactly:
1. Per entity: entity base path, then sorted attribute paths, then forms (card/main/quick), then ribbondiffs dir, then sorted savedquery paths
2. Then sorted entity relationship paths
3. Then option set paths
4. Then publisher path

Use `f(9.2)` for `'@SolutionPackageVersion': f(9.2)` (Python `9.2` float).

Outputs four files: `solution.yml`, `solutioncomponents.yml`, `rootcomponents.yml`, `missingdependencies.yml`.

---

### Step 11 — Compiler (`npx/compiler.ts`)

**Goal:** Port `python/dvforge/compiler.py`.

Read: `python/dvforge/compiler.py`

Orchestrates all generators. Generator call order must match Python exactly:

```ts
import * as publisher from "./generators/publisher.js";
import * as optionset from "./generators/optionset.js";
import * as entity from "./generators/entity.js";
import * as attribute from "./generators/attribute.js";
import * as formxml from "./generators/formxml.js";
import * as savedquery from "./generators/savedquery.js";
import * as ribbondiff from "./generators/ribbondiff.js";
import * as relationship from "./generators/relationship.js";
import * as solution from "./generators/solution.js";

export function compile(config: Config, outputDir: string, managed = true): void {
  const prefix = config.solution.publisher.prefix;
  const files = new Map<string, unknown>();

  // publisher
  for (const [k,v] of Object.entries(publisher.generate(config.solution.publisher)))
    files.set(k, v);

  // option sets
  for (const os of config.optionSets)
    for (const [k,v] of Object.entries(optionset.generate(os, prefix)))
      files.set(k, v);

  // per-entity
  for (const ent of config.entities) {
    for (const gen of [entity, attribute, formxml, savedquery, ribbondiff, relationship])
      for (const [k,v] of Object.entries(gen.generate(ent, prefix)))
        files.set(k, v);
  }

  // solution last — needs all component paths
  for (const [k,v] of Object.entries(solution.generate(config, managed, [...files.keys()])))
    files.set(k, v);

  // clean output dir, write all files
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  for (const [relPath, data] of files)
    writeYaml(path.join(outputDir, relPath), data);
}
```

---

### Step 12 — CLI (`npx/cli.ts`)

**Goal:** Port `python/dvforge/__main__.py` using commander.

Read: `python/dvforge/__main__.py`

```ts
#!/usr/bin/env node
import { Command } from "commander";
import { load } from "./loader.js";
import { compile } from "./compiler.js";

const program = new Command();
program.name("dvforge");

program
  .command("build")
  .requiredOption("--input <dir>", "Path to input YAML directory")
  .requiredOption("--output <dir>", "Path to write compiled solution files")
  .option("--version <ver>", "Override solution version")
  .option("--unmanaged", "Generate an unmanaged solution", false)
  .option("--dry-run", "Print output paths without writing files", false)
  .action(async (opts) => { /* ... */ });

program
  .command("test")
  .requiredOption("--input <dir>", "dvforge input directory")
  .requiredOption("--actual <dir>", "pac solution unpack directory to compare")
  .option("--out <dir>", "Save build output here")
  .option("--version <ver>", "Override solution version")
  .option("--unmanaged", "Generate an unmanaged solution", false)
  .option("--skip-build", "Skip building; requires --out", false)
  .option("--ignore-key <key>", "YAML key to skip in comparison (repeatable)",
    (v: string, acc: string[]) => [...acc, v], [] as string[])
  .action(async (opts) => { /* ... */ });

program
  .command("schema")
  .option("--output <dir>", "Project root to write schemas into", ".")
  .action(async (opts) => { /* ... */ });

program.parse();
```

The `test` command always adds `@version` and `Managed` to the ignore set (same as Python).

Mirror the Python console output exactly (the `click.echo` lines in `__main__.py`).

---

### Step 13 — Tester (`npx/tester.ts`)

**Goal:** Port `python/dvforge/tester.py`.

Read: `python/dvforge/tester.py`

```ts
import chalk from "chalk";
import os from "os";
import path from "path";
import fs from "fs";
import { readYaml } from "./utils.js";
import { load } from "./loader.js";
import { compile } from "./compiler.js";

type DiffTuple = [path: string, forgeVal: unknown, actualVal: unknown];

function diff(a: unknown, b: unknown, p: string, ignore: Set<string>): DiffTuple[] { ... }

export async function run(opts: {
  inputDir: string;
  actual: string;
  outDir: string | null;
  solVersion: string | null;
  unmanaged: boolean;
  skipBuild: boolean;
  ignore: Set<string>;
}): Promise<boolean> { ... }
```

The `diff()` function is recursive:
- Both dicts: iterate sorted union of keys (skip ignored), recurse
- Both arrays: compare lengths; if equal, recurse element-by-element
- Otherwise: direct equality check

For the temp directory: use `fs.mkdtempSync(path.join(os.tmpdir(), 'dvforge_test_'))` and clean up in a `finally` block when `outDir` was not provided.

Coloured output:
- `chalk.yellow` — section separators and DIFF header
- `chalk.cyan` — forge values
- `chalk.green` — actual values and matched summary
- `chalk.magenta` — only-in-forge section
- `chalk.blue` — only-in-actual section
- `chalk.red` / `chalk.green` — final summary line (red if failures, green if all matched)

---

### Step 14 — Schema Generator (`npx/schemaGen.ts`)

**Goal:** Port `python/dvforge/schema_gen.py`.

Read: `python/dvforge/schema_gen.py`

Use `zod-to-json-schema` to convert Zod schemas to JSON Schema objects. Wrap each in an envelope:

```ts
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { SolutionSchema, OptionSetSchema, EntitySchema } from "./model.js";

const SolutionFileSchema = z.object({ solution: SolutionSchema });
const OptionSetsFileSchema = z.object({ optionsets: z.array(OptionSetSchema) });
const EntitiesFileSchema = z.object({ entities: z.array(EntitySchema) });

const SCHEMAS = [
  { filename: "solution.schema.json",   schema: SolutionFileSchema,    glob: "solution.yml" },
  { filename: "optionsets.schema.json", schema: OptionSetsFileSchema,  glob: "optionsets.yml" },
  { filename: "entities.schema.json",   schema: EntitiesFileSchema,    glob: "entities/*.yml" },
];

export function generate(projectDir: string): string[] {
  const schemasDir = path.join(projectDir, "schemas");
  fs.mkdirSync(schemasDir, { recursive: true });

  const written: string[] = [];
  for (const { filename, schema } of SCHEMAS) {
    const p = path.join(schemasDir, filename);
    fs.writeFileSync(p, JSON.stringify(zodToJsonSchema(schema), null, 2));
    written.push(p);
  }

  updateVscodeSettings(projectDir, schemasDir);
  return written;
}
```

`updateVscodeSettings`: read existing `.vscode/settings.json` (graceful fallback to `{}`), set `yaml.schemas` key, write back with `JSON.stringify(..., null, 4)` (4 spaces like Python).

---

### Step 15 — Build & Typecheck

**Goal:** Confirm everything compiles.

```bash
cd npx
npm install
npm run build
npm run typecheck
```

Fix any type errors. Then verify UUID compatibility:

```bash
node -e "const {v5}=require('uuid'); console.log(v5('ts_deal:main','6ba7b810-9dad-11d1-80b4-00c04fd430c8'))"
python3 -c "import uuid; print(uuid.uuid5(uuid.NAMESPACE_URL, 'ts_deal:main'))"
```

Both should print: `4c3f2b1a-...` (same string).

---

### Step 16 — Diff Verification

**Goal:** Confirm TypeScript output is byte-for-byte identical to Python output.

Create a minimal test fixture with one entity and one column of each type. Run both implementations and diff:

```bash
# Build with Python
cd python && pip install -e . && dvforge build --input ../test-fixture --output /tmp/py-out

# Build with TypeScript
cd npx && node dist/cli.js build --input ../test-fixture --output /tmp/ts-out

# Diff
diff -r /tmp/py-out /tmp/ts-out
```

If there are `1.0` vs `1` differences, find the generator and add `f()` wrapper. Re-run until diff is clean.

---

### Step 17 — CI Workflow

**Goal:** Add npm publish GitHub Actions workflow.

Create `.github/workflows/publish-npm.yml` (note: this is at the repo root, not inside `python/`):

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

The existing `python/.github/workflows/publish.yml` (PyPI) is unchanged.

---

## Completion checklist

- [ ] Step 1: `npx/package.json`, `npx/tsconfig.json`, `npx/tsup.config.ts`
- [ ] Step 2: `npx/model.ts`
- [ ] Step 3: `npx/utils.ts`
- [ ] Step 4: `npx/loader.ts`
- [ ] Step 5: `npx/generators/ribbondiff.ts`, `publisher.ts`, `optionset.ts`, `entity.ts`
- [ ] Step 6: `npx/generators/attribute.ts`
- [ ] Step 7: `npx/generators/relationship.ts`
- [ ] Step 8: `npx/generators/formxml.ts`
- [ ] Step 9: `npx/generators/savedquery.ts`
- [ ] Step 10: `npx/generators/solution.ts`
- [ ] Step 11: `npx/compiler.ts`
- [ ] Step 12: `npx/cli.ts`
- [ ] Step 13: `npx/tester.ts`
- [ ] Step 14: `npx/schemaGen.ts`
- [ ] Step 15: Build & typecheck pass
- [ ] Step 16: Diff verification clean
- [ ] Step 17: `.github/workflows/publish-npm.yml`
