# Contributing to dvforge

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
git clone https://github.com/tomlumborg/dvforge.git
cd dvforge
npm install
```

## Development

```bash
npm run build          # compile with tsup
npm run typecheck      # type-check without emitting
npm test               # run tests once
npm run test:watch     # run tests in watch mode
npm run test:coverage  # run tests with coverage report
```

After building, you can run the CLI locally:

```bash
node dist/cli.js build --input ./my-solution --output ./output
```

Or link it globally so the `dvforge` command points to your local build:

```bash
npm link
dvforge build --input ./my-solution --output ./output
```

Run `npm unlink -g dvforge` when you're done.

## Project structure

```
src/
  cli.ts          entry point — Commander commands
  compiler.ts     orchestrates the build pipeline
  loader.ts       parses and validates input YAML
  validate.ts     Zod schemas for input validation
  model.ts        shared types
  generators/     one file per output artefact type
  schemaGen.ts    `dvforge schema` command implementation
  tester.ts       test utilities
  utils.ts        shared helpers
tests/            Vitest test files
```

## Making changes

1. Fork the repo and create a branch from `main`.
2. Write or update tests for any behaviour you change.
3. Run `npm run typecheck && npm test` before pushing — both must pass.
4. Open a pull request against `main` with a clear description of what changed and why.

### Things to contribute

- Fixing Bugs
- New options - dvforge was built to cover a simple set of requirements, this can be expanded to cover more options.

## Reporting bugs

Open an issue and please include:
- dvforge version (`npx dvforge --version`)
- Node.js version (`node --version`)
- The input YAML that triggered the problem (redact any sensitive values)
- The full error output
