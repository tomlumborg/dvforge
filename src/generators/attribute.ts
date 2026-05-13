import { floatScalar, prefixed } from "../utils.js";
import type { Column, Entity } from "../model.js";

const _MODIFIABLE: Record<string, unknown> = {
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
};

function _displayname(description: string): Record<string, unknown> {
  return { displayname: { "@description": description, "@languagecode": 1033 } };
}

function _description(text: string): Record<string, unknown> {
  return { Description: { "@description": text, "@languagecode": 1033 } };
}

function _attr(data: Record<string, unknown>): Record<string, unknown> {
  return { attribute: data };
}

function _base(
  physical: string,
  attrType: string,
  name: string,
  required: string,
  update: number,
  read: number,
  create: number,
  isCustom: number,
  audit: number,
  version: string | ReturnType<typeof floatScalar>,
  displayMask: string = "",
  ime: string = "auto"
): Record<string, unknown> {
  const d: Record<string, unknown> = {
    "@PhysicalName": physical,
    Type: attrType,
    Name: name,
    LogicalName: name,
    RequiredLevel: required,
  };
  if (displayMask) {
    d["DisplayMask"] = displayMask;
  }
  d["ImeMode"] = ime;
  d["ValidForUpdateApi"] = update;
  d["ValidForReadApi"] = read;
  d["ValidForCreateApi"] = create;
  d["IsCustomField"] = isCustom;
  d["IsAuditEnabled"] = audit;
  d["IsSecured"] = 0;
  d["IntroducedVersion"] = version;
  Object.assign(d, _MODIFIABLE);
  return d;
}

// ── Custom attribute generators ───────────────────────────────────────────────

function _primaryKey(entityName: string, prefix: string): [string, Record<string, unknown>] {
  const fullEntity = prefixed(entityName, prefix);
  const fieldName = `${fullEntity}id`;
  const physical = `${fullEntity}Id`;
  const d = _base(
    physical,
    "primarykey",
    fieldName,
    "systemrequired",
    0, 1, 1,
    0, 0, floatScalar(1.0),
    "ValidForAdvancedFind|RequiredForGrid"
  );
  d["CanModifyRequirementLevelSettings"] = 0;
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 1;
  d["IsRetrievable"] = 1;
  d["IsLocalizable"] = 0;
  d["displaynames"] = _displayname(entityName);
  d["Descriptions"] = _description("Unique identifier for entity instances");
  return [fieldName, _attr(d)];
}

function _customString(col: Column, prefix: string): [string, Record<string, unknown>] {
  const fullName = prefixed(col.name, prefix);
  const isNameField = col.primary_name;
  const reqLevel = col.required ? "required" : "none";

  let mask = isNameField
    ? "PrimaryName|ValidForAdvancedFind|ValidForForm|ValidForGrid"
    : "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const maxLen = col.max_length ?? 100;
  const d = _base(
    fullName, "nvarchar", fullName, reqLevel,
    1, 1, 1,
    1, 1, floatScalar(1.0),
    mask
  );
  d["AutoNumberFormat"] = "";
  d["IsSearchable"] = isNameField ? 1 : 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 1;
  d["IsLocalizable"] = 0;
  d["Format"] = "text";
  d["MaxLength"] = maxLen;
  d["Length"] = maxLen * 2;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}

function _customDatetime(col: Column, prefix: string): [string, Record<string, unknown>] {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "none";
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base(
    fullName, "datetime", fullName, reqLevel,
    1, 1, 1,
    1, 1, floatScalar(1.0),
    mask,
    "auto"
  );
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 0;
  d["IsLocalizable"] = 0;
  d["Format"] = "datetime";
  d["Behavior"] = 1;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}

function _customDateonly(col: Column, prefix: string): [string, Record<string, unknown>] {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "none";
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base(
    fullName, "datetime", fullName, reqLevel,
    1, 1, 1,
    1, 1, floatScalar(1.0),
    mask,
    "auto"
  );
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 0;
  d["IsLocalizable"] = 0;
  d["Format"] = "date";
  d["Behavior"] = 1;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}

function _customInt(col: Column, prefix: string): [string, Record<string, unknown>] {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "none";
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }

  const d = _base(
    fullName, "int", fullName, reqLevel,
    1, 1, 1,
    1, 1, floatScalar(1.0),
    mask,
    "disabled"
  );
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 0;
  d["IsLocalizable"] = 0;
  d["Format"] = "none";
  d["MinValue"] = -2147483648;
  d["MaxValue"] = 2147483647;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}

function _customLookup(col: Column, prefix: string): [string, Record<string, unknown>] {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "recommended";
  const d = _base(
    fullName, "lookup", fullName, reqLevel,
    1, 1, 1,
    1, 0, "1.0.0.0",
    "ValidForAdvancedFind|ValidForForm|ValidForGrid",
    "auto"
  );
  // Python line 186 d['ImeMode'] is a no-op bare dict read — ImeMode stays in object
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 0;
  d["IsLocalizable"] = 0;
  d["LookupStyle"] = "single";
  d["LookupTypes"] = null;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}

function _customChoice(col: Column, prefix: string): [string, Record<string, unknown>] {
  const fullName = prefixed(col.name, prefix);
  const optionSetName = col.option_set ? prefixed(col.option_set, prefix) : "";
  const reqLevel = col.required ? "required" : "none";
  const d = _base(
    fullName, "picklist", fullName, reqLevel,
    1, 1, 1,
    1, 1, "1.0.0.0",
    "ValidForAdvancedFind|ValidForForm|ValidForGrid"
  );
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 0;
  d["IsLocalizable"] = 0;
  d["AppDefaultValue"] = -1;
  d["OptionSetName"] = optionSetName;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}

// ── System attribute definitions ──────────────────────────────────────────────

function _systemAttributes(entity: Entity, prefix: string): Array<[string, Record<string, unknown>]> {
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
  ): [string, Record<string, unknown>] {
    const d = _base(
      physical, "lookup", name, "none",
      0, 1, create,
      0, audit, floatScalar(1.0),
      mask
    );
    d["IsSearchable"] = 0;
    d["IsFilterable"] = filterable;
    d["IsRetrievable"] = 0;
    d["IsLocalizable"] = 0;
    if (logical) {
      d["IsLogical"] = 1;
    }
    d["LookupStyle"] = "single";
    d["LookupTypes"] = null;
    d["displaynames"] = _displayname(display);
    d["Descriptions"] = _description(desc);
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
  ): [string, Record<string, unknown>] {
    const d = _base(
      physical, "datetime", name, "none",
      0, 1, create,
      0, audit, floatScalar(1.0),
      mask,
      "inactive"
    );
    d["IsSearchable"] = 0;
    d["IsFilterable"] = filterable;
    d["IsRetrievable"] = retrievable;
    d["IsLocalizable"] = 0;
    d["Format"] = fmt;
    d["CanChangeDateTimeBehavior"] = 0;
    d["Behavior"] = 1;
    d["displaynames"] = _displayname(display);
    d["Descriptions"] = _description(desc);
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
  ): [string, Record<string, unknown>] {
    const d = _base(
      physical, "int", name, "none",
      update, 1, create,
      0, audit, floatScalar(1.0),
      mask, ime
    );
    d["IsSearchable"] = 0;
    d["IsFilterable"] = 0;
    d["IsRetrievable"] = 0;
    d["IsLocalizable"] = 0;
    d["Format"] = fmt;
    d["MinValue"] = minVal;
    d["MaxValue"] = maxVal;
    d["displaynames"] = _displayname(display);
    d["Descriptions"] = _description(desc);
    return [name, _attr(d)];
  }

  const attrs: Array<[string, Record<string, unknown>]> = [
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
        ..._base(
          "OwnerId", "owner", "ownerid", "systemrequired",
          1, 1, 1,
          0, 1, floatScalar(1.0),
          "ValidForAdvancedFind|ValidForForm|ValidForGrid|RequiredForForm"
        ),
        IsSearchable: 0,
        IsFilterable: 1,
        IsRetrievable: 0,
        IsLocalizable: 0,
        LookupStyle: "single",
        LookupTypes: {
          LookupType: [
            { "@id": "00000000-0000-0000-0000-000000000000", "#text": 8 },
            { "@id": "00000000-0000-0000-0000-000000000000", "#text": 9 },
          ],
        },
        displaynames: _displayname("Owner"),
        Descriptions: _description("Owner Id"),
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
        ..._base(
          "statecode", "state", "statecode", "systemrequired",
          1, 1, 0,
          0, 1, floatScalar(1.0),
          "ValidForAdvancedFind|ValidForForm|ValidForGrid"
        ),
        IsSearchable: 0,
        IsFilterable: 1,
        IsRetrievable: 0,
        IsLocalizable: 0,
        optionset: {
          "@Name": `${fullEntity}_statecode`,
          OptionSetType: "state",
          IntroducedVersion: floatScalar(1.0),
          IsCustomizable: 1,
          displaynames: _displayname("Status"),
          Descriptions: _description(`Status of the ${entity.display_name}`),
          states: {
            state: [
              {
                "@value": 0,
                "@defaultstatus": 1,
                "@invariantname": "Active",
                labels: { label: { "@description": "Active", "@languagecode": 1033 } },
              },
              {
                "@value": 1,
                "@defaultstatus": 2,
                "@invariantname": "Inactive",
                labels: { label: { "@description": "Inactive", "@languagecode": 1033 } },
              },
            ],
          },
        },
        displaynames: _displayname("Status"),
        Descriptions: _description(`Status of the ${entity.name}`),
      }),
    ],
    [
      "statuscode",
      _attr({
        ..._base(
          "statuscode", "status", "statuscode", "none",
          1, 1, 1,
          0, 1, floatScalar(1.0),
          "ValidForAdvancedFind|ValidForForm|ValidForGrid"
        ),
        IsSearchable: 0,
        IsFilterable: 0,
        IsRetrievable: 0,
        IsLocalizable: 0,
        optionset: {
          "@Name": `${fullEntity}_statuscode`,
          OptionSetType: "status",
          IntroducedVersion: floatScalar(1.0),
          IsCustomizable: 1,
          displaynames: _displayname("Status Reason"),
          Descriptions: _description(`Reason for the status of the ${entity.display_name}`),
          statuses: {
            status: [
              {
                "@value": 1,
                "@state": 0,
                labels: { label: { "@description": "Active", "@languagecode": 1033 } },
              },
              {
                "@value": 2,
                "@state": 1,
                labels: { label: { "@description": "Inactive", "@languagecode": 1033 } },
              },
            ],
          },
        },
        displaynames: _displayname("Status Reason"),
        Descriptions: _description(`Reason for the status of the ${entity.name}`),
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

// ── Public entry point ────────────────────────────────────────────────────────

export function generate(entity: Entity, prefix: string): Record<string, unknown> {
  const fullEntity = prefixed(entity.name, prefix);
  const base = `entities/${fullEntity}/attributes`;
  const files: Record<string, unknown> = {};

  const [pkName, pkData] = _primaryKey(entity.name, prefix);
  files[`${base}/${pkName}.yml`] = pkData;

  for (const col of entity.columns) {
    let name: string;
    let data: Record<string, unknown>;
    if (col.type === "string") {
      [name, data] = _customString(col, prefix);
    } else if (col.type === "lookup") {
      [name, data] = _customLookup(col, prefix);
    } else if (col.type === "datetime") {
      [name, data] = _customDatetime(col, prefix);
    } else if (col.type === "dateonly") {
      [name, data] = _customDateonly(col, prefix);
    } else if (col.type === "int") {
      [name, data] = _customInt(col, prefix);
    } else if (col.type === "choice") {
      [name, data] = _customChoice(col, prefix);
    } else {
      throw new Error(`Unsupported column type: ${col.type}`);
    }
    files[`${base}/${name}.yml`] = data;
  }

  for (const [sysName, sysData] of _systemAttributes(entity, prefix)) {
    files[`${base}/${sysName}.yml`] = sysData;
  }

  return files;
}
