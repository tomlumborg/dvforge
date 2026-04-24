# dvforge

Compile compact, human-friendly YAML into a complete Microsoft Dataverse solution tree — ready to pack with `pac solution pack`.

## Install

```bash
pip install -r requirements.txt
```

Requires Python 3.10+.

## Quick start

1. Create an input directory with the files described below.
2. Run dvforge:

```bash
python -m dvforge --input ./my-solution --output ./output
```

3. Pack with PAC:

```bash
pac solution pack --zipfile MySolution.zip --folder .\output\.
```

## CLI options

| Flag | Description |
|------|-------------|
| `--input` | Path to your input YAML directory (required) |
| `--output` | Path to write the compiled solution files (required) |
| `--version` | Override the solution version, e.g. `1.2.0.0` |
| `--unmanaged` | Generate an unmanaged solution (default: managed) |
| `--dry-run` | Print output paths without writing any files |

## Input files

Your input directory should contain:

```
my-solution/
├── solution.yml
├── optionsets.yml      (optional)
└── entities/
    ├── deal.yml
    └── contact.yml     (one or more entity files)
```

### `solution.yml`

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

### `optionsets.yml`

```yaml
optionsets:
  - name: deal_stage          # no prefix — dvforge adds ts_
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
  - name: deal                # no prefix — dvforge adds ts_
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
        related_table: account  # references another entity, no prefix

      - name: stage_choice
        type: choice
        display_name: Stage
        option_set: deal_stage  # references an option set, no prefix

    relationships:
      - related_table: account   # the "one" side entity
        lookup_column: account   # the FK column on this entity
```

**Column types:** `string`, `lookup`, `choice`
- `choice` requires `option_set`
- `lookup` requires `related_table`

**Prefixes:** never write the publisher prefix in your input files — dvforge stamps `{prefix}_` on all names at compile time.

**Relationships:** defined on the entity that holds the lookup column (the "many" side). Only one-to-many is supported.

## What gets generated

For each entity:
- `entity.yml`
- One attribute file per column, plus ~14 system attributes (createdby, createdon, ownerid, statecode, statuscode, etc.)
- Main, card, and quick forms
- 7 standard views (Active, Inactive, My Records, Advanced Find, Associated, Lookup, Quick Find)
- Empty ribbon scaffold
- 6 system relationships + any custom lookup relationships

Globally: `publisher.yml`, option set files, `solution.yml`, `solutioncomponents.yml`, `rootcomponents.yml`, `missingdependencies.yml`.

The output directory is wiped and recreated on every build — no stale files.
