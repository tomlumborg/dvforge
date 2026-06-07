import { prefixed } from "../utils.js";
import type { Column, Entity } from "../model.js";

const _DEFAULTS: Record<string, unknown> = {
  IsCustomizable: 1,
  IsRenameable: 1,
  CanModifySearchSettings: 1,
  CanModifyRequirementLevelSettings: 1,
  CanModifyAdditionalSettings: 1,
  SourceType: 0,
  IsGlobalFilterEnabled: 0,
  IsSortableEnabled: 0,
  CanModifyGlobalFilterSettings: 1,
  CanModifyIsSortableSettings: 1,
  IsDataSourceSecret: 0,
  IsSecured: 0,
};

type AttrEntry = [string, Record<string, unknown>];

interface BaseConfig {
  physical: string;
  type: string;
  name: string;
  required: string;
  update: number;
  read: number;
  create: number;
  isCustom: number;
  audit: number;
  version: string;
  displayMask?: string;
  ime?: string;
  searchable?: number;
  filterable?: number;
  retrievable?: number;
  localizable?: number;
}

function _displayname(description: string, langCode: number): Record<string, unknown> {
  return { displayname: { "@description": description, "@languagecode": langCode } };
}

function _description(text: string, langCode: number): Record<string, unknown> {
  return { Description: { "@description": text, "@languagecode": langCode } };
}

function _attr(data: Record<string, unknown>): Record<string, unknown> {
  return { attribute: data };
}

function _reqLevel(required: boolean): string {
  return required ? "required" : "none";
}

function _base(cfg: BaseConfig): Record<string, unknown> {
  const d: Record<string, unknown> = {
    "@PhysicalName": cfg.physical,
    Type: cfg.type,
    Name: cfg.name,
    LogicalName: cfg.name,
    RequiredLevel: cfg.required,
  };
  if (cfg.displayMask) {
    d["DisplayMask"] = cfg.displayMask;
  }
  d["ImeMode"] = cfg.ime ?? "auto";
  d["ValidForUpdateApi"] = cfg.update;
  d["ValidForReadApi"] = cfg.read;
  d["ValidForCreateApi"] = cfg.create;
  d["IsCustomField"] = cfg.isCustom;
  d["IsAuditEnabled"] = cfg.audit;
  d["IsSearchable"] = cfg.searchable ?? 0;
  d["IsFilterable"] = cfg.filterable ?? 0;
  d["IsRetrievable"] = cfg.retrievable ?? 0;
  d["IsLocalizable"] = cfg.localizable ?? 0;
  d["IntroducedVersion"] = cfg.version;
  Object.assign(d, _DEFAULTS);
  return d;
}

// ── Custom attributes ───────────────────────────────────────────────

function _primaryKey(entityName: string, prefix: string, langCode: number): AttrEntry {
  const fullEntity = prefixed(entityName, prefix);
  const fieldName = `${fullEntity}id`;
  const physical = `${fullEntity}Id`;
  const d = _base({
    physical, type: "primarykey", name: fieldName, required: "systemrequired",
    update: 0, read: 1, create: 1,
    isCustom: 0, audit: 0,
    version: "1.0.0",
    displayMask: "ValidForAdvancedFind|RequiredForGrid",
    filterable: 1, retrievable: 1,
  });
  d["CanModifyRequirementLevelSettings"] = 0;
  d["displaynames"] = _displayname(entityName, langCode);
  d["Descriptions"] = _description("Unique identifier for entity instances", langCode);
  return [fieldName, _attr(d)];
}

function _customString(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const isNameField = col.primary_name;
  const reqLevel = _reqLevel(col.required);

  let mask = isNameField
    ? "PrimaryName|ValidForAdvancedFind|ValidForForm|ValidForGrid"
    : "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const maxLen = col.max_length ?? 100;
  const d = _base({
    physical: fullName, type: "nvarchar", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 1,
    version: "1.0.0",
    displayMask: mask,
    searchable: isNameField ? 1 : 0, retrievable: 1,
  });
  d["AutoNumberFormat"] = "";
  d["Format"] = "text";
  d["MaxLength"] = maxLen;
  d["Length"] = maxLen * 2;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

function _customDatetime(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = _reqLevel(col.required);
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base({
    physical: fullName, type: "datetime", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 1,
    version: "1.0.0",
    displayMask: mask, ime: "auto",
  });
  d["Format"] = "datetime";
  d["Behavior"] = 1;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

function _customDateonly(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = _reqLevel(col.required);
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base({
    physical: fullName, type: "datetime", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 1,
    version: "1.0.0",
    displayMask: mask, ime: "auto",
  });
  d["Format"] = "date";
  d["Behavior"] = 1;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

function _customInt(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = _reqLevel(col.required);
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base({
    physical: fullName, type: "int", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 1,
    version: "1.0.0",
    displayMask: mask, ime: "disabled",
  });
  d["Format"] = "none";
  d["MinValue"] = -2147483648;
  d["MaxValue"] = 2147483647;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

function _customLookup(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = _reqLevel(col.required);
  const d = _base({
    physical: fullName, type: "lookup", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 0,
    version: "1.0.0",
    displayMask: "ValidForAdvancedFind|ValidForForm|ValidForGrid", ime: "auto",
  });
  d["LookupStyle"] = "single";
  d["LookupTypes"] = null;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

function _customFloat(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = _reqLevel(col.required);
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base({
    physical: fullName, type: "float", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 1,
    version: "1.0.0",
    displayMask: mask, ime: "auto",
  });
  d["MinValue"] = col.min_value ?? 0;
  d["MaxValue"] = col.max_value ?? 1000000000;
  d["Accuracy"] = col.decimal_precision ?? 2;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

function _customChoice(col: Column, prefix: string, langCode: number): AttrEntry {
  const fullName = prefixed(col.name, prefix);
  const optionSetName = col.option_set ? prefixed(col.option_set, prefix) : "";
  const reqLevel = _reqLevel(col.required);
  const d = _base({
    physical: fullName, type: "picklist", name: fullName, required: reqLevel,
    update: 1, read: 1, create: 1,
    isCustom: 1, audit: 1,
    version: "1.0.0",
    displayMask: "ValidForAdvancedFind|ValidForForm|ValidForGrid",
  });
  d["AppDefaultValue"] = -1;
  d["OptionSetName"] = optionSetName;
  d["displaynames"] = _displayname(col.display_name, langCode);
  d["Descriptions"] = _description("", langCode);
  return [fullName, _attr(d)];
}

// ── System attributes ──────────────────────────────────────────────

function _systemAttributes(entity: Entity, prefix: string, langCode: number): AttrEntry[] {
  const fullEntity = prefixed(entity.name, prefix);

  function _slookup(
    physical: string,
    name: string,
    display: string,
    desc: string,
    mask: string = "ValidForAdvancedFind|ValidForForm|ValidForGrid",
    audit: number = 0,
    filterable: number = 0,
    logical: boolean = false,
    create: number = 0
  ): AttrEntry {
    const d = _base({
      physical, type: "lookup", name, required: "none",
      update: 0, read: 1, create,
      isCustom: 0, audit,
      version: "1.0.0",
      displayMask: mask,
      filterable,
    });
    if (logical) {
      d["IsLogical"] = 1;
    }
    d["LookupStyle"] = "single";
    d["LookupTypes"] = null;
    d["displaynames"] = _displayname(display, langCode);
    d["Descriptions"] = _description(desc, langCode);
    return [name, _attr(d)];
  }

  function _sdatetime(
    physical: string,
    name: string,
    display: string,
    desc: string,
    fmt: string = "datetime",
    filterable: number = 0,
    retrievable: number = 0,
    create: number = 0,
    audit: number = 0,
    mask: string = "ValidForAdvancedFind|ValidForForm|ValidForGrid"
  ): AttrEntry {
    const d = _base({
      physical, type: "datetime", name, required: "none",
      update: 0, read: 1, create,
      isCustom: 0, audit,
      version: "1.0.0",
      displayMask: mask, ime: "inactive",
      filterable, retrievable,
    });
    d["Format"] = fmt;
    d["CanChangeDateTimeBehavior"] = 0;
    d["Behavior"] = 1;
    d["displaynames"] = _displayname(display, langCode);
    d["Descriptions"] = _description(desc, langCode);
    return [name, _attr(d)];
  }

  function _sint(
    physical: string,
    name: string,
    display: string,
    desc: string,
    fmt: string = "",
    minVal: number = -1,
    maxVal: number = 2147483647,
    create: number = 1,
    update: number = 1,
    audit: number = 0,
    mask: string = "",
    ime: string = "auto"
  ): AttrEntry {
    const d = _base({
      physical, type: "int", name, required: "none",
      update, read: 1, create,
      isCustom: 0, audit,
      version: "1.0.0",
      displayMask: mask, ime,
    });
    d["Format"] = fmt;
    d["MinValue"] = minVal;
    d["MaxValue"] = maxVal;
    d["displaynames"] = _displayname(display, langCode);
    d["Descriptions"] = _description(desc, langCode);
    return [name, _attr(d)];
  }

  const attrs: AttrEntry[] = [
    _slookup("CreatedBy", "createdby", "Created By",
      "Unique identifier of the user who created the record."),
    _sdatetime("CreatedOn", "createdon", "Created On",
      "Date and time when the record was created.",
      "datetime", 1, 1),
    _slookup("CreatedOnBehalfBy", "createdonbehalfby", "Created By (Delegate)",
      "Unique identifier of the delegate user who created the record."),
    _sint("ImportSequenceNumber", "importsequencenumber",
      "Import Sequence Number",
      "Sequence number of the import that created this record.",
      "", -2147483648, 2147483647,
      1, 0, 1,
      "ValidForAdvancedFind", "disabled"),
    _slookup("ModifiedBy", "modifiedby", "Modified By",
      "Unique identifier of the user who modified the record."),
    _sdatetime("ModifiedOn", "modifiedon", "Modified On",
      "Date and time when the record was modified.",
      "datetime", 1, 1),
    _slookup("ModifiedOnBehalfBy", "modifiedonbehalfby", "Modified By (Delegate)",
      "Unique identifier of the delegate user who modified the record."),
    _sdatetime("OverriddenCreatedOn", "overriddencreatedon", "Record Created On",
      "Date and time that the record was migrated.",
      "date", 0, 0, 1, 1,
      "ValidForAdvancedFind|ValidForGrid"),
    [
      "ownerid",
      _attr({
        ..._base({
          physical: "OwnerId", type: "owner", name: "ownerid", required: "systemrequired",
          update: 1, read: 1, create: 1,
          isCustom: 0, audit: 1,
          version: "1.0.0",
          displayMask: "ValidForAdvancedFind|ValidForForm|ValidForGrid|RequiredForForm",
          filterable: 1,
        }),
        LookupStyle: "single",
        LookupTypes: {
          LookupType: [
            { "@id": "00000000-0000-0000-0000-000000000000", "#text": 8 },
            { "@id": "00000000-0000-0000-0000-000000000000", "#text": 9 },
          ],
        },
        displaynames: _displayname("Owner", langCode),
        Descriptions: _description("Owner Id", langCode),
      }),
    ],
    _slookup("OwningBusinessUnit", "owningbusinessunit", "Owning Business Unit",
      "Unique identifier for the business unit that owns the record",
      "ValidForAdvancedFind|ValidForForm|ValidForGrid", 1, 1),
    _slookup("OwningTeam", "owningteam", "Owning Team",
      "Unique identifier for the team that owns the record.",
      "", 0, 0, true),
    _slookup("OwningUser", "owninguser", "Owning User",
      "Unique identifier for the user that owns the record.",
      "", 0, 0, true),
    [
      "statecode",
      _attr({
        ..._base({
          physical: "statecode", type: "state", name: "statecode", required: "systemrequired",
          update: 1, read: 1, create: 0,
          isCustom: 0, audit: 1,
          version: "1.0.0",
          displayMask: "ValidForAdvancedFind|ValidForForm|ValidForGrid",
          filterable: 1,
        }),
        optionset: {
          "@Name": `${fullEntity}_statecode`,
          OptionSetType: "state",
          IntroducedVersion: "1.0.0",
          IsCustomizable: 1,
          displaynames: _displayname("Status", langCode),
          Descriptions: _description(`Status of the ${entity.display_name}`, langCode),
          states: {
            state: [
              {
                "@value": 0,
                "@defaultstatus": 1,
                "@invariantname": "Active",
                labels: { label: { "@description": "Active", "@languagecode": langCode } },
              },
              {
                "@value": 1,
                "@defaultstatus": 2,
                "@invariantname": "Inactive",
                labels: { label: { "@description": "Inactive", "@languagecode": langCode } },
              },
            ],
          },
        },
        displaynames: _displayname("Status", langCode),
        Descriptions: _description(`Status of the ${entity.name}`, langCode),
      }),
    ],
    [
      "statuscode",
      _attr({
        ..._base({
          physical: "statuscode", type: "status", name: "statuscode", required: "none",
          update: 1, read: 1, create: 1,
          isCustom: 0, audit: 1,
          version: "1.0.0",
          displayMask: "ValidForAdvancedFind|ValidForForm|ValidForGrid",
        }),
        optionset: {
          "@Name": `${fullEntity}_statuscode`,
          OptionSetType: "status",
          IntroducedVersion: "1.0.0",
          IsCustomizable: 1,
          displaynames: _displayname("Status Reason", langCode),
          Descriptions: _description(`Reason for the status of the ${entity.display_name}`, langCode),
          statuses: {
            status: [
              {
                "@value": 1,
                "@state": 0,
                labels: { label: { "@description": "Active", "@languagecode": langCode } },
              },
              {
                "@value": 2,
                "@state": 1,
                labels: { label: { "@description": "Inactive", "@languagecode": langCode } },
              },
            ],
          },
        },
        displaynames: _displayname("Status Reason", langCode),
        Descriptions: _description(`Reason for the status of the ${entity.name}`, langCode),
      }),
    ],
    _sint("TimeZoneRuleVersionNumber", "timezoneruleversionnumber",
      "Time Zone Rule Version Number", "For internal use only."),
    _sint("UTCConversionTimeZoneCode", "utcconversiontimezonecode",
      "UTC Conversion Time Zone Code",
      "Time zone code that was in use when the record was created."),
  ];
  return attrs;
}

// ── Generator entry ────────────────────────────────────────────────────────

export function generate(entity: Entity, prefix: string, langCode: number): Record<string, unknown> {
  const fullEntity = prefixed(entity.name, prefix);
  const base = `entities/${fullEntity}/attributes`;
  const files: Record<string, unknown> = {};

  const [pkName, pkData] = _primaryKey(entity.name, prefix, langCode);
  files[`${base}/${pkName}.yml`] = pkData;

  const generators: Record<string, (col: Column, prefix: string, lc: number) => AttrEntry> = {
    string: _customString,
    lookup: _customLookup,
    datetime: _customDatetime,
    dateonly: _customDateonly,
    int: _customInt,
    float: _customFloat,
    choice: _customChoice,
  };

  for (const col of entity.columns) {
    const gen = generators[col.type];
    if (!gen) throw new Error(`Unsupported column type: ${col.type}`);
    const [name, data] = gen(col, prefix, langCode);
    files[`${base}/${name}.yml`] = data;
  }

  for (const [sysName, sysData] of _systemAttributes(entity, prefix, langCode)) {
    files[`${base}/${sysName}.yml`] = sysData;
  }

  return files;
}
