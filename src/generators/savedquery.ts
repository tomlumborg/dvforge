import { prefixed, detUuid } from "../utils.js";
import type { Entity } from "../model.js";

function _layout(
  idField: string,
  nameField: string,
  gridName: string = "resultset",
  rowName: string = "result",
  preview: number = 1
): Record<string, unknown> {
  return {
    grid: {
      "@name": gridName,
      "@jump": nameField,
      "@select": 1,
      "@icon": 1,
      "@preview": preview,
      row: {
        "@name": rowName,
        "@id": idField,
        cell: [
          { "@name": nameField, "@width": 300 },
          { "@name": "createdon", "@width": 125 },
        ],
      },
    },
  };
}

function _activeFilter(): Record<string, unknown> {
  return {
    "@type": "and",
    condition: { "@attribute": "statecode", "@operator": "eq", "@value": 0 },
  };
}

function _inactiveFilter(): Record<string, unknown> {
  return {
    "@type": "and",
    condition: { "@attribute": "statecode", "@operator": "eq", "@value": 1 },
  };
}

function _baseQuery(
  entityName: string,
  idField: string,
  nameField: string
): Record<string, unknown> {
  return {
    "@version": "1.0.0",
    "@mapping": "logical",
    entity: {
      "@name": entityName,
      attribute: [
        { "@name": idField },
        { "@name": nameField },
        { "@name": "createdon" },
      ],
    },
  };
}

function _active(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameCol = entity.columns.find(c => c.primary_name);
  if (!nameCol) throw new Error(`Entity ${entity.name}: no primary_name column`);
  const nameField = prefixed(nameCol.name, prefix);
  const uid = detUuid(`${full}:sq:active`);

  const fetch = _baseQuery(full, idField, nameField) as Record<string, unknown>;
  (fetch["entity"] as Record<string, unknown>)["order"] = {
    "@attribute": nameField,
    "@descending": false,
  };
  (fetch["entity"] as Record<string, unknown>)["filter"] = _activeFilter();

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 0,
      isquickfindquery: 0,
      isprivate: 0,
      isdefault: 1,
      savedqueryid: `{${uid}}`,
      layoutxml: _layout(idField, nameField),
      querytype: 0,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `Active ${entity.display_name_plural}`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

function _inactive(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameCol = entity.columns.find(c => c.primary_name);
  if (!nameCol) throw new Error(`Entity ${entity.name}: no primary_name column`);
  const nameField = prefixed(nameCol.name, prefix);
  const uid = detUuid(`${full}:sq:inactive`);

  const fetch = _baseQuery(full, idField, nameField) as Record<string, unknown>;
  (fetch["entity"] as Record<string, unknown>)["order"] = {
    "@attribute": nameField,
    "@descending": false,
  };
  (fetch["entity"] as Record<string, unknown>)["filter"] = _inactiveFilter();

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 0,
      isquickfindquery: 0,
      isprivate: 0,
      isdefault: 0,
      savedqueryid: `{${uid}}`,
      layoutxml: _layout(idField, nameField),
      querytype: 0,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `Inactive ${entity.display_name_plural}`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

function _myRecords(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const uid = detUuid(`${full}:sq:my`);

  const fetch = {
    "@version": "1.0.0",
    "@mapping": "logical",
    "@output-format": "xml-platform",
    entity: {
      "@name": full,
      attribute: { "@name": idField },
      filter: {
        "@type": "and",
        condition: [
          { "@attribute": "statecode", "@operator": "eq", "@value": 0 },
          { "@attribute": "ownerid", "@operator": "eq-userid" },
        ],
      },
    },
  };

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 1,
      isquickfindquery: 0,
      isprivate: 0,
      isdefault: 1,
      savedqueryid: `{${uid}}`,
      querytype: 8192,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `My ${entity.display_name_plural}`,
          "@languagecode": langCode,
        },
      },
      Descriptions: {
        Description: {
          "@description": `Active ${entity.display_name_plural} owned by me`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

function _advancedFind(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameCol = entity.columns.find(c => c.primary_name);
  if (!nameCol) throw new Error(`Entity ${entity.name}: no primary_name column`);
  const nameField = prefixed(nameCol.name, prefix);
  const uid = detUuid(`${full}:sq:advanced`);

  const fetch = _baseQuery(full, idField, nameField) as Record<string, unknown>;
  (fetch["entity"] as Record<string, unknown>)["order"] = {
    "@attribute": nameField,
    "@descending": false,
  };

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 0,
      isquickfindquery: 0,
      isprivate: 0,
      isdefault: 1,
      savedqueryid: `{${uid}}`,
      layoutxml: _layout(idField, nameField),
      querytype: 1,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `${entity.display_name} Advanced Find View`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

function _associated(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameCol = entity.columns.find(c => c.primary_name);
  if (!nameCol) throw new Error(`Entity ${entity.name}: no primary_name column`);
  const nameField = prefixed(nameCol.name, prefix);
  const uid = detUuid(`${full}:sq:associated`);

  const fetch = _baseQuery(full, idField, nameField) as Record<string, unknown>;
  (fetch["entity"] as Record<string, unknown>)["order"] = {
    "@attribute": nameField,
    "@descending": false,
  };
  (fetch["entity"] as Record<string, unknown>)["filter"] = _activeFilter();

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 0,
      isquickfindquery: 0,
      isprivate: 0,
      isdefault: 1,
      savedqueryid: `{${uid}}`,
      layoutxml: _layout(idField, nameField, `${full}s`, full),
      querytype: 2,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `${entity.display_name} Associated View`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

function _lookupView(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameCol = entity.columns.find(c => c.primary_name);
  if (!nameCol) throw new Error(`Entity ${entity.name}: no primary_name column`);
  const nameField = prefixed(nameCol.name, prefix);
  const uid = detUuid(`${full}:sq:lookup`);

  const fetch = _baseQuery(full, idField, nameField) as Record<string, unknown>;
  (fetch["entity"] as Record<string, unknown>)["filter"] = _activeFilter();

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 0,
      isquickfindquery: 0,
      isprivate: 0,
      isdefault: 1,
      savedqueryid: `{${uid}}`,
      layoutxml: _layout(idField, nameField, `${full}s`, full, 0),
      querytype: 64,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `${entity.display_name} Lookup View`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

function _quickFind(entity: Entity, prefix: string, langCode: number): [string, Record<string, unknown>] {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameCol = entity.columns.find(c => c.primary_name);
  if (!nameCol) throw new Error(`Entity ${entity.name}: no primary_name column`);
  const nameField = prefixed(nameCol.name, prefix);
  const uid = detUuid(`${full}:sq:quickfind`);

  const fetch = {
    "@version": "1.0.0",
    "@mapping": "logical",
    entity: {
      "@name": full,
      attribute: [
        { "@name": idField },
        { "@name": nameField },
        { "@name": "createdon" },
      ],
      order: { "@attribute": nameField, "@descending": false },
      filter: [
        {
          "@type": "and",
          condition: { "@attribute": "statecode", "@operator": "eq", "@value": 0 },
        },
        {
          "@type": "or",
          "@isquickfindfields": 1,
          condition: { "@attribute": nameField, "@operator": "like", "@value": "{0}" },
        },
      ],
    },
  };

  const data = {
    savedquery: {
      IsCustomizable: 1,
      CanBeDeleted: 0,
      isquickfindquery: 1,
      isprivate: 0,
      isdefault: 1,
      savedqueryid: `{${uid}}`,
      layoutxml: _layout(idField, nameField),
      querytype: 4,
      fetchxml: { fetch },
      IntroducedVersion: "1.0.0",
      LocalizedNames: {
        LocalizedName: {
          "@description": `Quick Find Active ${entity.display_name_plural}`,
          "@languagecode": langCode,
        },
      },
    },
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}

export function generate(entity: Entity, prefix: string, langCode: number): Record<string, unknown> {
  const files: Record<string, unknown> = {};
  for (const [filePath, data] of [
    _active(entity, prefix, langCode),
    _inactive(entity, prefix, langCode),
    _myRecords(entity, prefix, langCode),
    _advancedFind(entity, prefix, langCode),
    _associated(entity, prefix, langCode),
    _lookupView(entity, prefix, langCode),
    _quickFind(entity, prefix, langCode),
  ]) {
    files[filePath] = data;
  }
  return files;
}
