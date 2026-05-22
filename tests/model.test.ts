import { describe, it, expect } from "vitest";
import { ColumnSchema, EntitySchema } from "../src/model.js";

function baseEntity(overrides: object = {}) {
  return {
    name: "account",
    display_name: "Account",
    display_name_plural: "Accounts",
    columns: [
      {
        name: "name",
        type: "string",
        display_name: "Name",
        primary_name: true,
      },
    ],
    relationships: [],
    ...overrides,
  };
}

describe("ColumnSchema", () => {
  describe("string", () => {
    it("cannot have related_table", () => {
      const result = ColumnSchema.safeParse({
        name: "col",
        type: "string",
        display_name: "Col",
        related_table: "account",
      });
      expect(result.success).toBe(false);
    });

    it("cannot have option_set", () => {
      const result = ColumnSchema.safeParse({
        name: "col",
        type: "string",
        display_name: "Col",
        option_set: "my_set",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("int", () => {
    it("cannot have related_table", () => {
      const result = ColumnSchema.safeParse({
        name: "col",
        type: "int",
        display_name: "Col",
        related_table: "account",
      });
      expect(result.success).toBe(false);
    });

    it("cannot have option_set", () => {
      const result = ColumnSchema.safeParse({
        name: "col",
        type: "int",
        display_name: "Col",
        option_set: "my_set",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("dates", () => {
    it.each(["datetime", "dateonly"] as const)(
      "%s type cannot have related_table",
      (type) => {
        const result = ColumnSchema.safeParse({
          name: "col",
          type,
          display_name: "Col",
          related_table: "account",
        });
        expect(result.success).toBe(false);
      },
    );

    it.each(["datetime", "dateonly"] as const)(
      "%s type cannot have option_set",
      (type) => {
        const result = ColumnSchema.safeParse({
          name: "col",
          type,
          display_name: "Col",
          option_set: "my_set",
        });
        expect(result.success).toBe(false);
      },
    );
  });

  describe("lookup", () => {
    it("requires related_table", () => {
      const result = ColumnSchema.safeParse({
        name: "contact_id",
        type: "lookup",
        display_name: "Contact",
      });
      expect(result.success).toBe(false);
    });

    it("passes with related_table", () => {
      const result = ColumnSchema.safeParse({
        name: "contact_id",
        type: "lookup",
        display_name: "Contact",
        related_table: "contact",
      });
      expect(result.success).toBe(true);
    });

    it("cannot have option_set", () => {
      const result = ColumnSchema.safeParse({
        name: "contact_id",
        type: "lookup",
        display_name: "Contact",
        related_table: "contact",
        option_set: "my_set",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("choice", () => {
    it("requires option_set", () => {
      const result = ColumnSchema.safeParse({
        name: "status",
        type: "choice",
        display_name: "Status",
      });
      expect(result.success).toBe(false);
    });

    it("passes with option_set", () => {
      const result = ColumnSchema.safeParse({
        name: "status",
        type: "choice",
        display_name: "Status",
        option_set: "my_status_set",
      });
      expect(result.success).toBe(true);
    });

    it("cannot have related_table", () => {
      const result = ColumnSchema.safeParse({
        name: "status",
        type: "choice",
        display_name: "Status",
        related_table: "status_table",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("EntitySchema", () => {
  it("pass with one primary_name columns", () => {
    const result = EntitySchema.safeParse(
      baseEntity({
        columns: [
          {
            name: "name",
            type: "string",
            display_name: "Name",
            primary_name: true,
          },
        ],
      }),
    );
    expect(result.success).toBe(true);
  });

  it("fails with zero primary_name columns", () => {
    const result = EntitySchema.safeParse(
      baseEntity({
        columns: [
          {
            name: "name",
            type: "string",
            display_name: "Name",
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("fails with more than one primary_name column", () => {
    const result = EntitySchema.safeParse(
      baseEntity({
        columns: [
          {
            name: "name",
            type: "string",
            display_name: "Name",
            primary_name: true,
          },
          {
            name: "alt",
            type: "string",
            display_name: "Alt",
            primary_name: true,
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("fails with duplicate column names", () => {
    const result = EntitySchema.safeParse(
      baseEntity({
        columns: [
          {
            name: "name",
            type: "string",
            display_name: "Name",
            primary_name: true,
          },
          {
            name: "name",
            type: "string",
            display_name: "Name Again",
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("fails with duplicate lookup_column across relationships", () => {
    const result = EntitySchema.safeParse(
      baseEntity({
        columns: [
          {
            name: "name",
            type: "string",
            display_name: "Name",
            primary_name: true,
          },
          {
            name: "contact_id",
            type: "lookup",
            display_name: "Contact",
            related_table: "contact",
          },
        ],
        relationships: [
          {
            related_table: "contact",
            lookup_column: "contact_id",
          },
          {
            related_table: "contact_other",
            lookup_column: "contact_id",
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("parses a valid entity with all column types", () => {
    const result = EntitySchema.safeParse({
      name: "account",
      display_name: "Account",
      display_name_plural: "Accounts",
      columns: [
        {
          name: "name",
          type: "string",
          display_name: "Name",
          primary_name: true,
        },
        {
          name: "contact_id",
          type: "lookup",
          display_name: "Contact",
          related_table: "contact",
        },
        {
          name: "status",
          type: "choice",
          display_name: "Status",
          option_set: "status_set",
        },
        {
          name: "created_on",
          type: "datetime",
          display_name: "Created On",
        },
        {
          name: "birth_date",
          type: "dateonly",
          display_name: "Birth Date",
        },
        {
          name: "count",
          type: "int",
          display_name: "Count",
        },
      ],
      relationships: [
        {
          related_table: "contact",
          lookup_column: "contact_id",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ownership).toBe("user");
      expect(result.data.columns).toHaveLength(6);
    }
  });
});

describe("EntitySchema existing_table", () => {
  it("passes with existing_table: true and no columns", () => {
    const result = EntitySchema.safeParse({
      name: "account",
      existing_table: true,
    });
    expect(result.success).toBe(true);
  });

  it("does not require primary_name column when existing_table is true", () => {
    const result = EntitySchema.safeParse({
      name: "account",
      existing_table: true,
      columns: [{ name: "name", type: "string", display_name: "Name" }],
    });
    expect(result.success).toBe(true);
  });

  it("existing_table defaults to undefined (falsy) when not set", () => {
    const result = EntitySchema.safeParse(baseEntity());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.existing_table).toBeUndefined();
    }
  });
});
