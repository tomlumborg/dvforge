# dvforge

A Python CLI that compiles compact human-friendly YAML schema files into a full Microsoft Dataverse-compatible YAML solution tree, ready for `pac solution pack`.

## Purpose

Writing Dataverse solutions by hand means managing hundreds of deeply nested XML/YAML files. dvforge lets you describe your solution in a handful of small, readable YAML files and generates the complete output tree — entities, attributes, forms, saved queries, option sets, relationships, ribbon diffs, publisher config, and solution manifests.

## Tech Stack

- **Python 3.10+**
- **pydantic v2** — input schema validation
- **ruamel.yaml** — YAML read/write with key-order preservation
- **click** — CLI

## Repository Layout

```
dvforge/                      ← repo root
├── dvforge/
│   ├── __main__.py           ← CLI entry point
│   ├── model.py              ← pydantic models
│   ├── loader.py             ← reads input YAML → Config
│   ├── compiler.py           ← orchestrates all generators
│   ├── utils.py              ← prefixed(), det_uuid(), write_yaml(), read_yaml()
│   └── generators/
│       ├── attribute.py      ← entity columns + system attributes
│       ├── entity.py         ← entity.yml
│       ├── formxml.py        ← main / card / quick forms
│       ├── optionset.py      ← global option sets
│       ├── publisher.py      ← publisher.yml
│       ├── relationship.py   ← system + custom relationships
│       ├── ribbondiff.py     ← empty ribbon scaffold
│       ├── savedquery.py     ← 7 standard views per entity
│       └── solution.py       ← solution.yml, components, root components
└── requirements.txt
```

## CLI Usage

```bash
# Standard managed build
python -m dvforge --input path/to/dataverse/output --output path/to/output

# Unmanaged solution
python -m dvforge --input path/to/dataverse/output --output path/to/output --unmanaged

# Override version
python -m dvforge --input path/to/dataverse/output --output path/to/output --version 1.2.0.0

# Dry run (print paths, write nothing)
python -m dvforge --input path/to/dataverse/output --output path/to/output --dry-run
```

Then pack with PAC:
```bash
pac solution pack --zipfile MySolution.zip --folder .\output\.
```

## Input Format

### `solution.yml`
```yaml
solution:
  name: output
  display_name: My Solution
  version: 1.0.0.0
  publisher:
    name: TheSummit
    display_name: TheSummit
    prefix: ts
    option_value_prefix: 12687
```

### `optionsets.yml`
```yaml
optionsets:
  - name: deal_stage          # no prefix — compiler adds ts_
    display_name: deal_stage
    options:
      - label: Talks Open
        value: 1
      - label: Verbal Agreement
        value: 2
```

### `entities/*.yml`
```yaml
entities:
  - name: deal                # no prefix — compiler adds ts_
    display_name: Deal
    display_name_plural: Deals
    description:
    ownership: user           # user | organization
    columns:
      - name: name
        type: string
        display_name: Name
        required: true
        max_length: 850

      - name: account
        type: lookup
        display_name: Account
        related_table: account  # references another entity (no prefix)

      - name: stage_choice
        type: choice
        display_name: Stage
        option_set: deal_stage  # references an option set (no prefix)

    relationships:
      - related_table: account   # the "one" side entity
        lookup_column: account   # the FK column on THIS entity
```

**Rules:**
- Prefix (`ts_`) is never written in input files — the compiler adds it everywhere
- Relationships are defined on the entity that owns the lookup column (the "many" side)
- Only one-to-many relationships are supported
- Column types: `string`, `lookup`, `choice`
- `choice` requires `option_set`; `lookup` requires `related_table`

## What Gets Generated Per Entity

| Generator | Output |
|-----------|--------|
| `entity.py` | `entities/{ts_name}/entity.yml` |
| `attribute.py` | One file per column + ~14 system attributes (createdby, createdon, ownerid, statecode, statuscode, etc.) |
| `formxml.py` | Main, card, and quick forms with deterministic UUIDs |
| `savedquery.py` | 7 standard views: Active, Inactive, My Records, Advanced Find, Associated, Lookup, Quick Find |
| `ribbondiff.py` | Empty ribbon scaffold |
| `relationship.py` | 6 system relationships (BusinessUnit, CreatedBy, ModifiedBy, Owner, Team, User) + custom lookup relationships |

Global generators: `publisher.py`, `optionset.py`, `solution.py` (solution.yml, solutioncomponents.yml, rootcomponents.yml, missingdependencies.yml).

## Key Design Decisions

- **Prefix applied at compile time** — input files are prefix-free; the compiler stamps `{prefix}_` on all names
- **Output directory wiped on build** — `shutil.rmtree` then recreate, ensuring no stale files
- **Deterministic UUIDs** — forms and saved queries use `uuid5(DNS_NAMESPACE, seed)` so rebuilds produce identical output and git diffs are clean
- **Managed by default** — pass `--unmanaged` to override
- **System attributes/relationships always injected** — every entity automatically gets the full Dataverse system field set

## Known Cosmetic Differences vs Dataverse Export

These are functionally equivalent; Dataverse import ignores them:

- **Null trailing space**: Dataverse export writes `LookupTypes: ` (trailing space); we write `LookupTypes:`. Both are valid YAML null.
- **UUID folder names**: Our deterministic UUIDs differ from the original Dataverse-generated ones — this is by design.
