import { f, prefixed, detUuid } from "../utils.js";
import type { Entity } from "../model.js";

// classid for standard controls
const CLASSID_TEXT = "{4273EDBD-AC1D-40d3-9FB2-095C621B552D}";
const CLASSID_LOOKUP = "{270BD3DB-D9AF-4782-9025-509E298DEC0A}";
const CLASSID_STATUS = "{5D68B988-0661-4db2-BC3E-17598AD3BE6C}";

function _cell(
  uid: string,
  label: string,
  field: string,
  classid: string,
  disabled?: boolean
): Record<string, unknown> {
  const control: Record<string, unknown> = {
    "@id": field,
    "@classid": classid,
    "@datafieldname": field,
  };
  if (disabled !== undefined) {
    control["@disabled"] = disabled;
  }
  return {
    "@id": `{${uid}}`,
    labels: { label: { "@description": label, "@languagecode": 1033 } },
    control,
  };
}

function _emptyCell(uid: string): Record<string, unknown> {
  return {
    "@id": `{${uid}}`,
    "@showlabel": true,
    "@locklevel": 0,
    labels: { label: { "@description": "", "@languagecode": 1033 } },
  };
}

function _mainForm(entity: Entity, prefix: string): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const nameField = prefixed("name", prefix);
  const formUuid = detUuid(`${full}:main`);
  const tabUuid = detUuid(`${full}:main:tab`);
  const secUuid = detUuid(`${full}:main:section`);

  const rows = [
    { cell: _cell(detUuid(`${full}:main:cell:name`), "Name", nameField, CLASSID_TEXT) },
    { cell: _cell(detUuid(`${full}:main:cell:owner`), "Owner", "ownerid", CLASSID_LOOKUP) },
  ];

  const data = {
    systemform: {
      formid: `{${formUuid}}`,
      IntroducedVersion: f(1.0),
      FormPresentation: 1,
      FormActivationState: 1,
      form: {
        tabs: {
          tab: {
            "@verticallayout": true,
            "@id": `{${tabUuid}}`,
            "@IsUserDefined": 1,
            labels: { label: { "@description": "General", "@languagecode": 1033 } },
            columns: {
              column: {
                "@width": "100%",
                sections: {
                  section: {
                    "@showlabel": false,
                    "@showbar": false,
                    "@IsUserDefined": 0,
                    "@id": `{${secUuid}}`,
                    labels: { label: { "@description": "General", "@languagecode": 1033 } },
                    rows: { row: rows },
                  },
                },
              },
            },
          },
        },
      },
      IsCustomizable: 1,
      CanBeDeleted: 1,
      LocalizedNames: { LocalizedName: { "@description": "Information", "@languagecode": 1033 } },
      Descriptions: { Description: { "@description": "A form for this entity.", "@languagecode": 1033 } },
    },
  };

  const filePath = `entities/${full}/formxml/main/${formUuid}/systemform.yml`;
  return [filePath, data];
}

function _quickForm(entity: Entity, prefix: string): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const nameField = prefixed("name", prefix);
  const formUuid = detUuid(`${full}:quick`);
  const tabUuid = detUuid(`${full}:quick:tab`);
  const secUuid = detUuid(`${full}:quick:section`);

  const rows = [
    { cell: _cell(detUuid(`${full}:quick:cell:name`), "Name", nameField, CLASSID_TEXT) },
    { cell: _cell(detUuid(`${full}:quick:cell:owner`), "Owner", "ownerid", CLASSID_LOOKUP) },
  ];

  const data = {
    systemform: {
      formid: `{${formUuid}}`,
      IntroducedVersion: f(1.0),
      FormPresentation: 1,
      FormActivationState: 1,
      form: {
        tabs: {
          tab: {
            "@verticallayout": true,
            "@id": `{${tabUuid}}`,
            "@IsUserDefined": 1,
            labels: { label: { "@description": "", "@languagecode": 1033 } },
            columns: {
              column: {
                "@width": "100%",
                sections: {
                  section: {
                    "@showlabel": false,
                    "@showbar": false,
                    "@IsUserDefined": 0,
                    "@id": `{${secUuid}}`,
                    labels: { label: { "@description": "GENERAL", "@languagecode": 1033 } },
                    rows: { row: rows },
                  },
                },
              },
            },
          },
        },
      },
      IsCustomizable: 1,
      CanBeDeleted: 1,
      LocalizedNames: { LocalizedName: { "@description": "Information", "@languagecode": 1033 } },
    },
  };

  const filePath = `entities/${full}/formxml/quick/${formUuid}/systemform.yml`;
  return [filePath, data];
}

function _cardForm(entity: Entity, prefix: string): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const nameField = prefixed("name", prefix);
  const formUuid = detUuid(`${full}:card`);
  const tabUuid = detUuid(`${full}:card:tab`);

  const secUid = (key: string) => detUuid(`${full}:card:${key}`);

  const colorCol = {
    "@width": "25%",
    sections: {
      section: {
        "@name": "ColorStrip",
        "@showlabel": false,
        "@showbar": false,
        "@columns": 1,
        "@IsUserDefined": 0,
        "@id": `{${secUid("colorstrip")}}`,
        labels: { label: { "@description": "ColorStrip", "@languagecode": 1033 } },
      },
    },
  };

  const headerCell = {
    "@id": `{${detUuid(`${full}:card:hcell:status`)}}`,
    "@showlabel": true,
    "@locklevel": 0,
    labels: { label: { "@description": "Status Reason", "@languagecode": 1033 } },
    control: {
      "@id": "statuscode",
      "@classid": CLASSID_STATUS,
      "@datafieldname": "statuscode",
      "@disabled": false,
    },
  };

  const detailCell = {
    "@id": `{${detUuid(`${full}:card:dcell:name`)}}`,
    "@showlabel": true,
    "@locklevel": 0,
    labels: { label: { "@description": "Name", "@languagecode": 1033 } },
    control: {
      "@id": nameField,
      "@classid": CLASSID_TEXT,
      "@datafieldname": nameField,
      "@disabled": false,
    },
  };

  const footerCells = [
    {
      "@id": `{${detUuid(`${full}:card:fcell:owner`)}}`,
      "@showlabel": true,
      "@locklevel": 0,
      labels: { label: { "@description": "Owner", "@languagecode": 1033 } },
      control: {
        "@id": "ownerid",
        "@classid": CLASSID_LOOKUP,
        "@datafieldname": "ownerid",
        "@disabled": false,
      },
    },
    {
      "@id": `{${detUuid(`${full}:card:fcell:createdon`)}}`,
      "@showlabel": true,
      "@locklevel": 0,
      labels: { label: { "@description": "Created On", "@languagecode": 1033 } },
      control: {
        "@id": "createdon",
        "@classid": CLASSID_LOOKUP,
        "@datafieldname": "createdon",
        "@disabled": false,
      },
    },
    _emptyCell(detUuid(`${full}:card:fcell:empty1`)),
    _emptyCell(detUuid(`${full}:card:fcell:empty2`)),
  ];

  const contentCol = {
    "@width": "75%",
    sections: {
      section: [
        {
          "@name": "CardHeader",
          "@showlabel": false,
          "@showbar": false,
          "@columns": 111,
          "@id": `{${secUid("cardheader")}}`,
          "@IsUserDefined": 0,
          labels: { label: { "@description": "Header", "@languagecode": 1033 } },
          rows: {
            row: {
              cell: [
                headerCell,
                _emptyCell(detUuid(`${full}:card:hcell:empty1`)),
                _emptyCell(detUuid(`${full}:card:hcell:empty2`)),
              ],
            },
          },
        },
        {
          "@name": "CardDetails",
          "@showlabel": false,
          "@showbar": false,
          "@columns": 1,
          "@id": `{${secUid("carddetails")}}`,
          "@IsUserDefined": 0,
          labels: { label: { "@description": "Details", "@languagecode": 1033 } },
          rows: { row: { cell: detailCell } },
        },
        {
          "@name": "CardFooter",
          "@showlabel": false,
          "@columns": 1111,
          "@showbar": false,
          "@id": `{${secUid("cardfooter")}}`,
          "@IsUserDefined": 0,
          labels: { label: { "@description": "Footer", "@languagecode": 1033 } },
          rows: { row: { cell: footerCells } },
        },
      ],
    },
  };

  const data = {
    systemform: {
      formid: `{${formUuid}}`,
      IntroducedVersion: f(1.0),
      FormPresentation: 1,
      FormActivationState: 1,
      form: {
        tabs: {
          tab: {
            "@name": "general",
            "@verticallayout": true,
            "@id": `{${tabUuid}}`,
            "@IsUserDefined": 0,
            labels: { label: { "@description": "", "@languagecode": 1033 } },
            columns: { column: [colorCol, contentCol] },
          },
        },
      },
      IsCustomizable: 1,
      CanBeDeleted: 1,
      LocalizedNames: { LocalizedName: { "@description": "Information", "@languagecode": 1033 } },
      Descriptions: { Description: { "@description": "A card form for this entity.", "@languagecode": 1033 } },
    },
  };

  const filePath = `entities/${full}/formxml/card/${formUuid}/systemform.yml`;
  return [filePath, data];
}

export function generate(entity: Entity, prefix: string): Record<string, unknown> {
  const files: Record<string, unknown> = {};
  for (const [filePath, data] of [_mainForm(entity, prefix), _quickForm(entity, prefix), _cardForm(entity, prefix)]) {
    files[filePath] = data;
  }
  return files;
}
