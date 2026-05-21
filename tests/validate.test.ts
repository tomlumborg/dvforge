import { describe, it, expect } from "vitest";
import { validateRefs } from "../src/validate.js";
import type { Config } from "../src/model.js";

type Column = Config["entities"][number]["columns"][number];
type Relationship = Config["entities"][number]["relationships"][number];

const baseSolution: Config["solution"] = {
  name: "mysolution",
  display_name: "My Solution",
  version: "1.0.0.0",
  publisher: {
    name: "mypublisher",
    display_name: "My Publisher",
    prefix: "pfx",
    option_value_prefix: 10000,
  },
};

function col(
  overrides: Partial<Column> & Pick<Column, "name" | "type" | "display_name">,
): Column {
  return { required: false, primary_name: false, ...overrides };
}

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    solution: baseSolution,
    option_sets: [],
    entities: [
      {
        name: "account",
        display_name: "Account",
        display_name_plural: "Accounts",
        ownership: "user",
        columns: [
          col({
            name: "name",
            type: "string",
            display_name: "Name",
            primary_name: true,
          }),
        ],
        relationships: [],
      },
    ],
    ...overrides,
  };
}

describe("validateRefs", () => {
  it("passes on a valid config", () => {
    expect(() => validateRefs(makeConfig())).not.toThrow();
  });

  it("passes with a valid related_table on a column", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
            col({
              name: "contact_id",
              type: "lookup",
              display_name: "Contact",
              related_table: "contact",
            }),
          ],
          relationships: [],
        },
        {
          name: "contact",
          display_name: "Contact",
          display_name_plural: "Contacts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
          ],
          relationships: [],
        },
      ],
    });
    expect(() => validateRefs(config)).not.toThrow();
  });

  it("errors when a column related_table references an unknown entity", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
            col({
              name: "contact_id",
              type: "lookup",
              display_name: "Contact",
              related_table: "ghost",
            }),
          ],
          relationships: [],
        },
      ],
    });
    expect(() => validateRefs(config)).toThrow();
  });

  it("errors when a column option_set references an unknown option set", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
            col({
              name: "status",
              type: "choice",
              display_name: "Status",
              option_set: "ghost_set",
            }),
          ],
          relationships: [],
        },
      ],
    });
    expect(() => validateRefs(config)).toThrow();
  });

  it("errors when relationship related_table references an unknown entity", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
            col({
              name: "contact_id",
              type: "lookup",
              display_name: "Contact",
              related_table: "contact",
            }),
          ],
          relationships: [
            { related_table: "ghost", lookup_column: "contact_id" },
          ],
        },
      ],
    });
    expect(() => validateRefs(config)).toThrow();
  });

  it("errors when relationship lookup_column does not exist on the entity", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
          ],
          relationships: [
            { related_table: "account", lookup_column: "missing_col" },
          ],
        },
      ],
    });
    expect(() => validateRefs(config)).toThrow(
      "Entity 'account', relationship: lookup_column 'missing_col' does not exist on this entity",
    );
  });

  it("errors when relationship lookup_column exists but is not type 'lookup'", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
            col({ name: "ref_col", type: "string", display_name: "Ref" }),
          ],
          relationships: [
            { related_table: "account", lookup_column: "ref_col" },
          ],
        },
      ],
    });
    expect(() => validateRefs(config)).toThrow(
      "Entity 'account', relationship: lookup_column 'ref_col' must be of type 'lookup' (found 'string')",
    );
  });

  it("passes when column related_table references an existing_table entity", () => {
    const config = makeConfig({
      entities: [
        {
          name: "deal",
          display_name: "Deal",
          display_name_plural: "Deals",
          ownership: "user",
          columns: [
            col({ name: "name", type: "string", display_name: "Name", primary_name: true }),
            col({ name: "account_id", type: "lookup", display_name: "Account", related_table: "account" }),
          ],
          relationships: [],
        },
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          existing_table: true,
          columns: [],
          relationships: [],
        },
      ],
    });
    expect(() => validateRefs(config)).not.toThrow();
  });

  it("passes when relationship related_table references an existing_table entity", () => {
    const config = makeConfig({
      entities: [
        {
          name: "deal",
          display_name: "Deal",
          display_name_plural: "Deals",
          ownership: "user",
          columns: [
            col({ name: "name", type: "string", display_name: "Name", primary_name: true }),
            col({ name: "account_id", type: "lookup", display_name: "Account", related_table: "account" }),
          ],
          relationships: [
            { related_table: "account", lookup_column: "account_id" },
          ],
        },
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          existing_table: true,
          columns: [],
          relationships: [],
        },
      ],
    });
    expect(() => validateRefs(config)).not.toThrow();
  });

  it("errors when a name is declared as both a custom entity and an existing table", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({ name: "name", type: "string", display_name: "Name", primary_name: true }),
          ],
          relationships: [],
        },
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          existing_table: true,
          columns: [],
          relationships: [],
        },
      ],
    });
    expect(() => validateRefs(config)).toThrow(
      "Entity name 'account' is declared as both a custom entity and an existing table",
    );
  });

  it("accumulates multiple errors and throws them together", () => {
    const config = makeConfig({
      entities: [
        {
          name: "account",
          display_name: "Account",
          display_name_plural: "Accounts",
          ownership: "user",
          columns: [
            col({
              name: "name",
              type: "string",
              display_name: "Name",
              primary_name: true,
            }),
            col({
              name: "fk",
              type: "lookup",
              display_name: "FK",
              related_table: "unknown_entity",
            }),
            col({
              name: "status",
              type: "choice",
              display_name: "Status",
              option_set: "unknown_set",
            }),
          ],
          relationships: [
            { related_table: "also_unknown", lookup_column: "fk" },
          ],
        },
      ],
    });
    let thrownMessage = "";
    try {
      validateRefs(config);
    } catch (e) {
      thrownMessage = (e as Error).message;
    }
    expect(thrownMessage).toContain(
      "related_table 'unknown_entity' does not match any entity or existing table",
    );
    expect(thrownMessage).toContain(
      "option_set 'unknown_set' does not match any option set",
    );
    expect(thrownMessage).toContain(
      "related_table 'also_unknown' does not match any entity or existing table",
    );
  });
});
