#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// cli.ts
var import_commander = require("commander");
var import_path6 = __toESM(require("path"));

// loader.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));

// utils.ts
var import_uuid = require("uuid");
var import_yaml = require("yaml");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function prefixed(name, prefix) {
  return `${prefix}_${name}`;
}
function detUuid(seed) {
  return (0, import_uuid.v5)(seed, import_uuid.v5.URL);
}
function f(n) {
  const s = new import_yaml.Scalar(n);
  s.minFractionDigits = 1;
  return s;
}
function writeYaml(filePath, data) {
  import_fs.default.mkdirSync(import_path.default.dirname(filePath), { recursive: true });
  import_fs.default.writeFileSync(
    filePath,
    (0, import_yaml.stringify)(data, {
      lineWidth: 0,
      nullStr: "",
      defaultStringType: "PLAIN",
      defaultKeyType: "PLAIN"
    }),
    "utf-8"
  );
}
function readYaml(filePath) {
  return (0, import_yaml.parse)(import_fs.default.readFileSync(filePath, "utf-8"));
}

// loader.ts
function load(inputDir) {
  const solution = loadSolution(import_path2.default.join(inputDir, "solution.yml"));
  const optionSets = loadOptionSets(import_path2.default.join(inputDir, "optionsets.yml"));
  const entities = loadEntities(import_path2.default.join(inputDir, "entities"));
  return { solution, option_sets: optionSets, entities };
}
function loadSolution(filePath) {
  const raw = readYaml(filePath);
  const sol = raw["solution"];
  const pub = sol["publisher"];
  return {
    name: sol["name"],
    display_name: sol["display_name"],
    version: sol["version"],
    publisher: {
      name: pub["name"],
      display_name: pub["display_name"],
      prefix: pub["prefix"],
      option_value_prefix: pub["option_value_prefix"]
    }
  };
}
function loadOptionSets(filePath) {
  if (!import_fs2.default.existsSync(filePath)) return [];
  const raw = readYaml(filePath);
  const list = raw["optionsets"] ?? [];
  return list.map((os2) => {
    const o = os2;
    const options = (o["options"] ?? []).map((opt) => {
      const v = opt;
      return { label: v["label"], value: v["value"] };
    });
    return {
      name: o["name"],
      display_name: o["display_name"],
      options
    };
  });
}
function loadEntities(entitiesDir) {
  if (!import_fs2.default.existsSync(entitiesDir)) return [];
  const files = import_fs2.default.readdirSync(entitiesDir).sort();
  const entities = [];
  for (const file of files) {
    if (!file.endsWith(".yml")) continue;
    const raw = readYaml(import_path2.default.join(entitiesDir, file));
    const list = raw["entities"] ?? [];
    for (const ent of list) {
      entities.push(parseEntity(ent));
    }
  }
  return entities;
}
function parseEntity(raw) {
  const columns = (raw["columns"] ?? []).map(
    (c) => parseColumn(c)
  );
  const relationships = (raw["relationships"] ?? []).map(
    (r) => parseRelationship(r)
  );
  return {
    name: raw["name"],
    display_name: raw["display_name"],
    display_name_plural: raw["display_name_plural"],
    description: raw["description"] ?? null,
    ownership: raw["ownership"] ?? "user",
    columns,
    relationships
  };
}
function parseColumn(raw) {
  return {
    name: raw["name"],
    type: raw["type"],
    display_name: raw["display_name"],
    required: raw["required"] ?? false,
    primary_name: raw["primary_name"] ?? false,
    max_length: raw["max_length"] ?? null,
    option_set: raw["option_set"] ?? null,
    related_table: raw["related_table"] ?? null
  };
}
function parseRelationship(raw) {
  return {
    related_table: raw["related_table"],
    lookup_column: raw["lookup_column"]
  };
}

// compiler.ts
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));

// generators/publisher.ts
var _NIL_BEFORE = [
  "City",
  "County",
  "Country",
  "Fax",
  "FreightTermsCode",
  "ImportSequenceNumber",
  "Latitude",
  "Line1",
  "Line2",
  "Line3",
  "Longitude",
  "Name",
  "PostalCode",
  "PostOfficeBox",
  "PrimaryContactName"
];
var _NIL_AFTER = [
  "StateOrProvince",
  "Telephone1",
  "Telephone2",
  "Telephone3",
  "TimeZoneRuleVersionNumber",
  "UPSZone",
  "UTCOffset",
  "UTCConversionTimeZoneCode"
];
function nil() {
  return { "@xsi:nil": true, "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance" };
}
function address(number) {
  const before = {};
  for (const f2 of _NIL_BEFORE) before[f2] = nil();
  const after = {};
  for (const f2 of _NIL_AFTER) after[f2] = nil();
  return {
    AddressNumber: number,
    AddressTypeCode: 1,
    ...before,
    ShippingMethodCode: 1,
    ...after
  };
}
function generate(publisher) {
  const data = {
    Publisher: {
      UniqueName: publisher.name,
      LocalizedNames: {
        LocalizedName: {
          "@description": publisher.display_name,
          "@languagecode": 1033
        }
      },
      Descriptions: null,
      EMailAddress: nil(),
      SupportingWebsiteUrl: nil(),
      CustomizationPrefix: publisher.prefix,
      CustomizationOptionValuePrefix: publisher.option_value_prefix,
      Addresses: {
        Address: [address(1), address(2)]
      }
    }
  };
  return { [`publishers/${publisher.name}/publisher.yml`]: data };
}

// generators/optionset.ts
function generate2(optionset, prefix) {
  const fullName = prefixed(optionset.name, prefix);
  const data = {
    optionset: {
      "@Name": fullName,
      "@localizedName": optionset.display_name,
      OptionSetType: "picklist",
      IsGlobal: 1,
      IntroducedVersion: "1.0.0.0",
      IsCustomizable: 1,
      ExternalTypeName: "",
      displaynames: {
        displayname: {
          "@description": optionset.display_name,
          "@languagecode": 1033
        }
      },
      Descriptions: {
        Description: {
          "@description": "",
          "@languagecode": 1033
        }
      },
      options: {
        option: optionset.options.map((opt) => ({
          "@value": opt.value,
          "@ExternalValue": "",
          "@IsHidden": 0,
          labels: {
            label: {
              "@description": opt.label,
              "@languagecode": 1033
            }
          },
          Descriptions: {
            Description: {
              "@description": "",
              "@languagecode": 1033
            }
          }
        }))
      }
    }
  };
  return { [`optionsets/${fullName}/optionset.yml`]: data };
}

// generators/entity.ts
var entity_exports = {};
__export(entity_exports, {
  generate: () => generate3
});
function generate3(entity, prefix) {
  const fullName = prefixed(entity.name, prefix);
  const ownership = entity.ownership === "user" ? "UserOwned" : "OrganizationOwned";
  const data = {
    Entity: {
      Name: {
        "@LocalizedName": entity.display_name,
        "@OriginalName": entity.display_name,
        "#text": fullName
      },
      EntityInfo: {
        entity: {
          "@Name": fullName,
          LocalizedNames: {
            LocalizedName: {
              "@description": entity.display_name,
              "@languagecode": 1033
            }
          },
          LocalizedCollectionNames: {
            LocalizedCollectionName: {
              "@description": entity.display_name_plural,
              "@languagecode": 1033
            }
          },
          Descriptions: {
            Description: {
              "@description": entity.description ?? "",
              "@languagecode": 1033
            }
          },
          EntitySetName: `${fullName}s`,
          IsDuplicateCheckSupported: 1,
          IsBusinessProcessEnabled: 0,
          IsRequiredOffline: 0,
          IsInteractionCentricEnabled: 0,
          IsCollaboration: 0,
          AutoRouteToOwnerQueue: 0,
          IsConnectionsEnabled: 0,
          EntityColor: "",
          IsDocumentManagementEnabled: 0,
          AutoCreateAccessTeams: 0,
          IsOneNoteIntegrationEnabled: 0,
          IsKnowledgeManagementEnabled: 0,
          IsSLAEnabled: 0,
          IsDocumentRecommendationsEnabled: 0,
          IsBPFEntity: 0,
          OwnershipTypeMask: ownership,
          IsAuditEnabled: 0,
          IsRetrieveAuditEnabled: 0,
          IsRetrieveMultipleAuditEnabled: 0,
          IsActivity: 0,
          ActivityTypeMask: "",
          IsActivityParty: 0,
          IsReplicated: 0,
          IsReplicationUserFiltered: 0,
          IsMailMergeEnabled: 1,
          IsVisibleInMobile: 0,
          IsVisibleInMobileClient: 0,
          IsReadOnlyInMobileClient: 0,
          IsOfflineInMobileClient: 0,
          DaysSinceRecordLastModified: 0,
          MobileOfflineFilters: "",
          IsMapiGridEnabled: 1,
          IsReadingPaneEnabled: 1,
          IsQuickCreateEnabled: 0,
          SyncToExternalSearchIndex: 0,
          IntroducedVersion: f(1),
          IsCustomizable: 1,
          IsRenameable: 1,
          IsMappable: 1,
          CanModifyAuditSettings: 1,
          CanModifyMobileVisibility: 1,
          CanModifyMobileClientVisibility: 1,
          CanModifyMobileClientReadOnly: 1,
          CanModifyMobileClientOffline: 1,
          CanModifyConnectionSettings: 1,
          CanModifyDuplicateDetectionSettings: 1,
          CanModifyMailMergeSettings: 1,
          CanModifyQueueSettings: 1,
          CanCreateAttributes: 1,
          CanCreateForms: 1,
          CanCreateCharts: 1,
          CanCreateViews: 1,
          CanModifyAdditionalSettings: 1,
          CanEnableSyncToExternalSearchIndex: 1,
          IconVectorName: "",
          EnforceStateTransitions: 0,
          CanChangeHierarchicalRelationship: 1,
          EntityHelpUrlEnabled: 0,
          EntityHelpUrl: "",
          ChangeTrackingEnabled: 0,
          CanChangeTrackingBeEnabled: 1,
          IsEnabledForExternalChannels: 0,
          IsMSTeamsIntegrationEnabled: 0,
          IsSolutionAware: 0
        }
      }
    }
  };
  return { [`entities/${fullName}/entity.yml`]: data };
}

// generators/attribute.ts
var attribute_exports = {};
__export(attribute_exports, {
  generate: () => generate4
});
var _MODIFIABLE = {
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
  IsDataSourceSecret: 0
};
function _displayname(description) {
  return { displayname: { "@description": description, "@languagecode": 1033 } };
}
function _description(text) {
  return { Description: { "@description": text, "@languagecode": 1033 } };
}
function _attr(data) {
  return { attribute: data };
}
function _base(physical, attrType, name, required, update, read, create, isCustom, audit, version, displayMask = "", ime = "auto") {
  const d = {
    "@PhysicalName": physical,
    Type: attrType,
    Name: name,
    LogicalName: name,
    RequiredLevel: required
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
function _primaryKey(entityName, prefix) {
  const fullEntity = prefixed(entityName, prefix);
  const fieldName = `${fullEntity}id`;
  const physical = `${fullEntity}Id`;
  const d = _base(
    physical,
    "primarykey",
    fieldName,
    "systemrequired",
    0,
    1,
    1,
    0,
    0,
    f(1),
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
function _customString(col, prefix) {
  const fullName = prefixed(col.name, prefix);
  const isNameField = col.primary_name;
  const reqLevel = col.required ? "required" : "none";
  let mask = isNameField ? "PrimaryName|ValidForAdvancedFind|ValidForForm|ValidForGrid" : "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }
  const maxLen = col.max_length ?? 100;
  const d = _base(
    fullName,
    "nvarchar",
    fullName,
    reqLevel,
    1,
    1,
    1,
    1,
    1,
    f(1),
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
function _customDatetime(col, prefix) {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "none";
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }
  const d = _base(
    fullName,
    "datetime",
    fullName,
    reqLevel,
    1,
    1,
    1,
    1,
    1,
    f(1),
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
function _customDateonly(col, prefix) {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "none";
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }
  const d = _base(
    fullName,
    "datetime",
    fullName,
    reqLevel,
    1,
    1,
    1,
    1,
    1,
    f(1),
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
function _customInt(col, prefix) {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "none";
  let mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid";
  if (col.required) {
    mask += "|RequiredForForm";
  }
  const d = _base(
    fullName,
    "int",
    fullName,
    reqLevel,
    1,
    1,
    1,
    1,
    1,
    f(1),
    mask,
    "disabled"
  );
  d["IsSearchable"] = 0;
  d["IsFilterable"] = 0;
  d["IsRetrievable"] = 0;
  d["IsLocalizable"] = 0;
  d["Format"] = "";
  d["MinValue"] = -2147483648;
  d["MaxValue"] = 2147483647;
  d["displaynames"] = _displayname(col.display_name);
  d["Descriptions"] = _description("");
  return [fullName, _attr(d)];
}
function _customLookup(col, prefix) {
  const fullName = prefixed(col.name, prefix);
  const reqLevel = col.required ? "required" : "recommended";
  const d = _base(
    fullName,
    "lookup",
    fullName,
    reqLevel,
    1,
    1,
    1,
    1,
    0,
    "1.0.0.0",
    "ValidForAdvancedFind|ValidForForm|ValidForGrid",
    "auto"
  );
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
function _customChoice(col, prefix) {
  const fullName = prefixed(col.name, prefix);
  const optionSetName = col.option_set ? prefixed(col.option_set, prefix) : "";
  const reqLevel = col.required ? "required" : "none";
  const d = _base(
    fullName,
    "picklist",
    fullName,
    reqLevel,
    1,
    1,
    1,
    1,
    1,
    "1.0.0.0",
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
function _systemAttributes(entity, prefix) {
  const fullEntity = prefixed(entity.name, prefix);
  function _slookup(physical, name, display, desc, mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid", audit = 0, filterable = 0, logical = false, create = 0) {
    const d = _base(
      physical,
      "lookup",
      name,
      "none",
      0,
      1,
      create,
      0,
      audit,
      f(1),
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
  function _sdatetime(physical, name, display, desc, fmt = "datetime", filterable = 0, retrievable = 0, create = 0, audit = 0, mask = "ValidForAdvancedFind|ValidForForm|ValidForGrid") {
    const d = _base(
      physical,
      "datetime",
      name,
      "none",
      0,
      1,
      create,
      0,
      audit,
      f(1),
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
  function _sint(physical, name, display, desc, fmt = "", minVal = -1, maxVal = 2147483647, create = 1, update = 1, audit = 0, mask = "", ime = "auto") {
    const d = _base(
      physical,
      "int",
      name,
      "none",
      update,
      1,
      create,
      0,
      audit,
      f(1),
      mask,
      ime
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
  const attrs = [
    _slookup(
      "CreatedBy",
      "createdby",
      "Created By",
      "Unique identifier of the user who created the record."
    ),
    _sdatetime(
      "CreatedOn",
      "createdon",
      "Created On",
      "Date and time when the record was created.",
      "datetime",
      1,
      1
    ),
    _slookup(
      "CreatedOnBehalfBy",
      "createdonbehalfby",
      "Created By (Delegate)",
      "Unique identifier of the delegate user who created the record."
    ),
    _sint(
      "ImportSequenceNumber",
      "importsequencenumber",
      "Import Sequence Number",
      "Sequence number of the import that created this record.",
      "",
      -2147483648,
      2147483647,
      0,
      0,
      1,
      "ValidForAdvancedFind",
      "disabled"
    ),
    _slookup(
      "ModifiedBy",
      "modifiedby",
      "Modified By",
      "Unique identifier of the user who modified the record."
    ),
    _sdatetime(
      "ModifiedOn",
      "modifiedon",
      "Modified On",
      "Date and time when the record was modified.",
      "datetime",
      1,
      1
    ),
    _slookup(
      "ModifiedOnBehalfBy",
      "modifiedonbehalfby",
      "Modified By (Delegate)",
      "Unique identifier of the delegate user who modified the record."
    ),
    _sdatetime(
      "OverriddenCreatedOn",
      "overriddencreatedon",
      "Record Created On",
      "Date and time that the record was migrated.",
      "date",
      0,
      0,
      1,
      1,
      "ValidForAdvancedFind|ValidForGrid"
    ),
    [
      "ownerid",
      _attr({
        ..._base(
          "OwnerId",
          "owner",
          "ownerid",
          "systemrequired",
          1,
          1,
          1,
          0,
          1,
          f(1),
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
            { "@id": "00000000-0000-0000-0000-000000000000", "#text": 9 }
          ]
        },
        displaynames: _displayname("Owner"),
        Descriptions: _description("Owner Id")
      })
    ],
    _slookup(
      "OwningBusinessUnit",
      "owningbusinessunit",
      "Owning Business Unit",
      "Unique identifier for the business unit that owns the record",
      "ValidForAdvancedFind|ValidForForm|ValidForGrid",
      1,
      1
    ),
    _slookup(
      "OwningTeam",
      "owningteam",
      "Owning Team",
      "Unique identifier for the team that owns the record.",
      "",
      0,
      0,
      true
    ),
    _slookup(
      "OwningUser",
      "owninguser",
      "Owning User",
      "Unique identifier for the user that owns the record.",
      "",
      0,
      0,
      true
    ),
    [
      "statecode",
      _attr({
        ..._base(
          "statecode",
          "state",
          "statecode",
          "systemrequired",
          1,
          1,
          0,
          0,
          1,
          f(1),
          "ValidForAdvancedFind|ValidForForm|ValidForGrid"
        ),
        IsSearchable: 0,
        IsFilterable: 1,
        IsRetrievable: 0,
        IsLocalizable: 0,
        optionset: {
          "@Name": `${fullEntity}_statecode`,
          OptionSetType: "state",
          IntroducedVersion: f(1),
          IsCustomizable: 1,
          displaynames: _displayname("Status"),
          Descriptions: _description(`Status of the ${entity.display_name}`),
          states: {
            state: [
              {
                "@value": 0,
                "@defaultstatus": 1,
                "@invariantname": "Active",
                labels: { label: { "@description": "Active", "@languagecode": 1033 } }
              },
              {
                "@value": 1,
                "@defaultstatus": 2,
                "@invariantname": "Inactive",
                labels: { label: { "@description": "Inactive", "@languagecode": 1033 } }
              }
            ]
          }
        },
        displaynames: _displayname("Status"),
        Descriptions: _description(`Status of the ${entity.name}`)
      })
    ],
    [
      "statuscode",
      _attr({
        ..._base(
          "statuscode",
          "status",
          "statuscode",
          "none",
          1,
          1,
          1,
          0,
          1,
          f(1),
          "ValidForAdvancedFind|ValidForForm|ValidForGrid"
        ),
        IsSearchable: 0,
        IsFilterable: 0,
        IsRetrievable: 0,
        IsLocalizable: 0,
        optionset: {
          "@Name": `${fullEntity}_statuscode`,
          OptionSetType: "status",
          IntroducedVersion: f(1),
          IsCustomizable: 1,
          displaynames: _displayname("Status Reason"),
          Descriptions: _description(`Reason for the status of the ${entity.display_name}`),
          statuses: {
            status: [
              {
                "@value": 1,
                "@state": 0,
                labels: { label: { "@description": "Active", "@languagecode": 1033 } }
              },
              {
                "@value": 2,
                "@state": 1,
                labels: { label: { "@description": "Inactive", "@languagecode": 1033 } }
              }
            ]
          }
        },
        displaynames: _displayname("Status Reason"),
        Descriptions: _description(`Reason for the status of the ${entity.name}`)
      })
    ],
    _sint(
      "TimeZoneRuleVersionNumber",
      "timezoneruleversionnumber",
      "Time Zone Rule Version Number",
      "For internal use only."
    ),
    _sint(
      "UTCConversionTimeZoneCode",
      "utcconversiontimezonecode",
      "UTC Conversion Time Zone Code",
      "Time zone code that was in use when the record was created."
    )
  ];
  return attrs;
}
function generate4(entity, prefix) {
  const fullEntity = prefixed(entity.name, prefix);
  const base = `entities/${fullEntity}/attributes`;
  const files = {};
  const [pkName, pkData] = _primaryKey(entity.name, prefix);
  files[`${base}/${pkName}.yml`] = pkData;
  for (const col of entity.columns) {
    let name;
    let data;
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

// generators/formxml.ts
var formxml_exports = {};
__export(formxml_exports, {
  generate: () => generate5
});
var CLASSID_TEXT = "{4273EDBD-AC1D-40d3-9FB2-095C621B552D}";
var CLASSID_LOOKUP = "{270BD3DB-D9AF-4782-9025-509E298DEC0A}";
var CLASSID_STATUS = "{5D68B988-0661-4db2-BC3E-17598AD3BE6C}";
function _cell(uid, label, field, classid, disabled) {
  const control = {
    "@id": field,
    "@classid": classid,
    "@datafieldname": field
  };
  if (disabled !== void 0) {
    control["@disabled"] = disabled;
  }
  return {
    "@id": `{${uid}}`,
    labels: { label: { "@description": label, "@languagecode": 1033 } },
    control
  };
}
function _emptyCell(uid) {
  return {
    "@id": `{${uid}}`,
    "@showlabel": true,
    "@locklevel": 0,
    labels: { label: { "@description": "", "@languagecode": 1033 } }
  };
}
function _mainForm(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const nameField = prefixed("name", prefix);
  const formUuid = detUuid(`${full}:main`);
  const tabUuid = detUuid(`${full}:main:tab`);
  const secUuid = detUuid(`${full}:main:section`);
  const rows = [
    { cell: _cell(detUuid(`${full}:main:cell:name`), "Name", nameField, CLASSID_TEXT) },
    { cell: _cell(detUuid(`${full}:main:cell:owner`), "Owner", "ownerid", CLASSID_LOOKUP) }
  ];
  const data = {
    systemform: {
      formid: `{${formUuid}}`,
      IntroducedVersion: f(1),
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
                    rows: { row: rows }
                  }
                }
              }
            }
          }
        }
      },
      IsCustomizable: 1,
      CanBeDeleted: 1,
      LocalizedNames: { LocalizedName: { "@description": "Information", "@languagecode": 1033 } },
      Descriptions: { Description: { "@description": "A form for this entity.", "@languagecode": 1033 } }
    }
  };
  const filePath = `entities/${full}/formxml/main/${formUuid}/systemform.yml`;
  return [filePath, data];
}
function _quickForm(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const nameField = prefixed("name", prefix);
  const formUuid = detUuid(`${full}:quick`);
  const tabUuid = detUuid(`${full}:quick:tab`);
  const secUuid = detUuid(`${full}:quick:section`);
  const rows = [
    { cell: _cell(detUuid(`${full}:quick:cell:name`), "Name", nameField, CLASSID_TEXT) },
    { cell: _cell(detUuid(`${full}:quick:cell:owner`), "Owner", "ownerid", CLASSID_LOOKUP) }
  ];
  const data = {
    systemform: {
      formid: `{${formUuid}}`,
      IntroducedVersion: f(1),
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
                    rows: { row: rows }
                  }
                }
              }
            }
          }
        }
      },
      IsCustomizable: 1,
      CanBeDeleted: 1,
      LocalizedNames: { LocalizedName: { "@description": "Information", "@languagecode": 1033 } }
    }
  };
  const filePath = `entities/${full}/formxml/quick/${formUuid}/systemform.yml`;
  return [filePath, data];
}
function _cardForm(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const nameField = prefixed("name", prefix);
  const formUuid = detUuid(`${full}:card`);
  const tabUuid = detUuid(`${full}:card:tab`);
  const secUid = (key) => detUuid(`${full}:card:${key}`);
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
        labels: { label: { "@description": "ColorStrip", "@languagecode": 1033 } }
      }
    }
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
      "@disabled": false
    }
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
      "@disabled": false
    }
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
        "@disabled": false
      }
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
        "@disabled": false
      }
    },
    _emptyCell(detUuid(`${full}:card:fcell:empty1`)),
    _emptyCell(detUuid(`${full}:card:fcell:empty2`))
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
                _emptyCell(detUuid(`${full}:card:hcell:empty2`))
              ]
            }
          }
        },
        {
          "@name": "CardDetails",
          "@showlabel": false,
          "@showbar": false,
          "@columns": 1,
          "@id": `{${secUid("carddetails")}}`,
          "@IsUserDefined": 0,
          labels: { label: { "@description": "Details", "@languagecode": 1033 } },
          rows: { row: { cell: detailCell } }
        },
        {
          "@name": "CardFooter",
          "@showlabel": false,
          "@columns": 1111,
          "@showbar": false,
          "@id": `{${secUid("cardfooter")}}`,
          "@IsUserDefined": 0,
          labels: { label: { "@description": "Footer", "@languagecode": 1033 } },
          rows: { row: { cell: footerCells } }
        }
      ]
    }
  };
  const data = {
    systemform: {
      formid: `{${formUuid}}`,
      IntroducedVersion: f(1),
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
            columns: { column: [colorCol, contentCol] }
          }
        }
      },
      IsCustomizable: 1,
      CanBeDeleted: 1,
      LocalizedNames: { LocalizedName: { "@description": "Information", "@languagecode": 1033 } },
      Descriptions: { Description: { "@description": "A card form for this entity.", "@languagecode": 1033 } }
    }
  };
  const filePath = `entities/${full}/formxml/card/${formUuid}/systemform.yml`;
  return [filePath, data];
}
function generate5(entity, prefix) {
  const files = {};
  for (const [filePath, data] of [_mainForm(entity, prefix), _quickForm(entity, prefix), _cardForm(entity, prefix)]) {
    files[filePath] = data;
  }
  return files;
}

// generators/savedquery.ts
var savedquery_exports = {};
__export(savedquery_exports, {
  generate: () => generate6
});
function _layout(idField, nameField, gridName = "resultset", rowName = "result", preview = 1) {
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
          { "@name": "createdon", "@width": 125 }
        ]
      }
    }
  };
}
function _activeFilter() {
  return {
    "@type": "and",
    condition: { "@attribute": "statecode", "@operator": "eq", "@value": 0 }
  };
}
function _inactiveFilter() {
  return {
    "@type": "and",
    condition: { "@attribute": "statecode", "@operator": "eq", "@value": 1 }
  };
}
function _baseQuery(entityName, idField, nameField) {
  return {
    "@version": f(1),
    "@mapping": "logical",
    entity: {
      "@name": entityName,
      attribute: [
        { "@name": idField },
        { "@name": nameField },
        { "@name": "createdon" }
      ]
    }
  };
}
function _active(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameField = prefixed("name", prefix);
  const uid = detUuid(`${full}:sq:active`);
  const fetch = _baseQuery(full, idField, nameField);
  fetch["entity"]["order"] = {
    "@attribute": nameField,
    "@descending": false
  };
  fetch["entity"]["filter"] = _activeFilter();
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `Active ${entity.display_name_plural}`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function _inactive(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameField = prefixed("name", prefix);
  const uid = detUuid(`${full}:sq:inactive`);
  const fetch = _baseQuery(full, idField, nameField);
  fetch["entity"]["order"] = {
    "@attribute": nameField,
    "@descending": false
  };
  fetch["entity"]["filter"] = _inactiveFilter();
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `Inactive ${entity.display_name_plural}`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function _myRecords(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const uid = detUuid(`${full}:sq:my`);
  const fetch = {
    "@version": f(1),
    "@mapping": "logical",
    "@output-format": "xml-platform",
    entity: {
      "@name": full,
      attribute: { "@name": idField },
      filter: {
        "@type": "and",
        condition: [
          { "@attribute": "statecode", "@operator": "eq", "@value": 0 },
          { "@attribute": "ownerid", "@operator": "eq-userid" }
        ]
      }
    }
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `My ${entity.display_name_plural}`,
          "@languagecode": 1033
        }
      },
      Descriptions: {
        Description: {
          "@description": `Active ${entity.display_name_plural} owned by me`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function _advancedFind(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameField = prefixed("name", prefix);
  const uid = detUuid(`${full}:sq:advanced`);
  const fetch = _baseQuery(full, idField, nameField);
  fetch["entity"]["order"] = {
    "@attribute": nameField,
    "@descending": false
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `${entity.display_name} Advanced Find View`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function _associated(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameField = prefixed("name", prefix);
  const uid = detUuid(`${full}:sq:associated`);
  const fetch = _baseQuery(full, idField, nameField);
  fetch["entity"]["order"] = {
    "@attribute": nameField,
    "@descending": false
  };
  fetch["entity"]["filter"] = _activeFilter();
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `${entity.display_name} Associated View`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function _lookupView(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameField = prefixed("name", prefix);
  const uid = detUuid(`${full}:sq:lookup`);
  const fetch = _baseQuery(full, idField, nameField);
  fetch["entity"]["filter"] = _activeFilter();
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `${entity.display_name} Lookup View`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function _quickFind(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const idField = `${full}id`;
  const nameField = prefixed("name", prefix);
  const uid = detUuid(`${full}:sq:quickfind`);
  const fetch = {
    "@version": f(1),
    "@mapping": "logical",
    entity: {
      "@name": full,
      attribute: [
        { "@name": idField },
        { "@name": nameField },
        { "@name": "createdon" }
      ],
      order: { "@attribute": nameField, "@descending": false },
      filter: [
        {
          "@type": "and",
          condition: { "@attribute": "statecode", "@operator": "eq", "@value": 0 }
        },
        {
          "@type": "or",
          "@isquickfindfields": 1,
          condition: { "@attribute": nameField, "@operator": "like", "@value": "{0}" }
        }
      ]
    }
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
      IntroducedVersion: f(1),
      LocalizedNames: {
        LocalizedName: {
          "@description": `Quick Find Active ${entity.display_name_plural}`,
          "@languagecode": 1033
        }
      }
    }
  };
  return [`entities/${full}/savedqueries/${uid}/savedquery.yml`, data];
}
function generate6(entity, prefix) {
  const files = {};
  for (const [filePath, data] of [
    _active(entity, prefix),
    _inactive(entity, prefix),
    _myRecords(entity, prefix),
    _advancedFind(entity, prefix),
    _associated(entity, prefix),
    _lookupView(entity, prefix),
    _quickFind(entity, prefix)
  ]) {
    files[filePath] = data;
  }
  return files;
}

// generators/ribbondiff.ts
var ribbondiff_exports = {};
__export(ribbondiff_exports, {
  generate: () => generate7
});
function generate7(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const data = {
    RibbonDiffXml: {
      CustomActions: null,
      Templates: {
        RibbonTemplates: { "@Id": "Mscrm.Templates" }
      },
      CommandDefinitions: null,
      RuleDefinitions: {
        TabDisplayRules: null,
        DisplayRules: null,
        EnableRules: null
      },
      LocLabels: null
    }
  };
  return { [`entities/${full}/ribbondiffs/ribbondiff.yml`]: data };
}

// generators/relationship.ts
var relationship_exports = {};
__export(relationship_exports, {
  generate: () => generate8
});
function _rel(name, referencing, referenced, referencingAttr, cascadeDelete = "NoCascade", cascadeArchive = "NoCascade", description = "", navProperty = null, includeRoles = false, introducedVersion = "1.0", isCustom = false) {
  const er = {
    "@Name": name,
    EntityRelationshipType: "OneToMany",
    IsCustomizable: 1,
    IntroducedVersion: introducedVersion,
    IsHierarchical: 0,
    ReferencingEntityName: referencing,
    ReferencedEntityName: referenced,
    CascadeAssign: "NoCascade",
    CascadeDelete: cascadeDelete,
    CascadeArchive: cascadeArchive,
    CascadeReparent: "NoCascade",
    CascadeShare: "NoCascade",
    CascadeUnshare: "NoCascade"
  };
  if (isCustom) {
    er["CascadeRollupView"] = "NoCascade";
    er["IsValidForAdvancedFind"] = 1;
  }
  er["ReferencingAttributeName"] = referencingAttr;
  er["RelationshipDescription"] = {
    Descriptions: {
      Description: {
        "@description": description,
        "@languagecode": 1033
      }
    }
  };
  const data = { EntityRelationship: er };
  if (includeRoles) {
    const nav = navProperty ?? referencingAttr;
    er["EntityRelationshipRoles"] = {
      EntityRelationshipRole: [
        {
          NavPaneDisplayOption: "UseCollectionName",
          NavPaneArea: "Details",
          NavPaneOrder: 1e4,
          NavigationPropertyName: nav,
          RelationshipRoleType: 1
        },
        {
          NavigationPropertyName: name,
          RelationshipRoleType: 0
        }
      ]
    };
  }
  return data;
}
function _systemRelationships(entity, prefix) {
  const full = prefixed(entity.name, prefix);
  const files = {};
  const systems = [
    [
      `business_unit_${full}`,
      full,
      "BusinessUnit",
      "OwningBusinessUnit",
      "Restrict",
      "Restrict",
      "Unique identifier for the business unit that owns the record"
    ],
    [
      `lk_${full}_createdby`,
      full,
      "SystemUser",
      "CreatedBy",
      "NoCascade",
      "NoCascade",
      "Unique identifier of the user who created the record."
    ],
    [
      `lk_${full}_modifiedby`,
      full,
      "SystemUser",
      "ModifiedBy",
      "NoCascade",
      "NoCascade",
      "Unique identifier of the user who modified the record."
    ],
    [
      `owner_${full}`,
      full,
      "Owner",
      "OwnerId",
      "NoCascade",
      "NoCascade",
      "Owner Id"
    ],
    [
      `team_${full}`,
      full,
      "Team",
      "OwningTeam",
      "NoCascade",
      "NoCascade",
      "Unique identifier for the team that owns the record."
    ],
    [
      `user_${full}`,
      full,
      "SystemUser",
      "OwningUser",
      "NoCascade",
      "NoCascade",
      "Unique identifier for the user that owns the record."
    ]
  ];
  for (const [
    name,
    referencing,
    referenced,
    attr,
    cascadeDel,
    cascadeArch,
    desc
  ] of systems) {
    files[`entityrelationships/${name}/entityrelationship.yml`] = _rel(
      name,
      referencing,
      referenced,
      attr,
      cascadeDel,
      cascadeArch,
      desc,
      null,
      false,
      f(1)
    );
  }
  return files;
}
function _customRelationship(entity, rel, prefix) {
  const fullReferencing = prefixed(entity.name, prefix);
  const fullReferenced = prefixed(rel.related_table, prefix);
  const fullAttr = prefixed(rel.lookup_column, prefix);
  const name = `${fullReferenced}__${fullReferencing}_${fullAttr}`;
  const data = _rel(
    name,
    fullReferencing,
    fullReferenced,
    fullAttr,
    "RemoveLink",
    "RemoveLink",
    "",
    fullAttr,
    true,
    "1.0.0.0",
    true
  );
  return { [`entityrelationships/${name}/entityrelationship.yml`]: data };
}
function generate8(entity, prefix) {
  const files = {};
  Object.assign(files, _systemRelationships(entity, prefix));
  for (const rel of entity.relationships) {
    Object.assign(files, _customRelationship(entity, rel, prefix));
  }
  return files;
}

// generators/solution.ts
function componentPaths(config, componentFiles) {
  const prefix = config.solution.publisher.prefix;
  const paths = [];
  for (const entity of config.entities) {
    const full = prefixed(entity.name, prefix);
    const entityBase = `/entities/${full}`;
    paths.push(entityBase);
    const attrPaths = componentFiles.filter((p) => p.startsWith(`entities/${full}/attributes/`)).map((p) => `/${p}`).sort();
    paths.push(...attrPaths);
    for (const formType of ["card", "main", "quick"]) {
      const formPaths = componentFiles.filter((p) => p.startsWith(`entities/${full}/formxml/${formType}/`)).map((p) => `/${p.slice(0, p.length - "/systemform.yml".length)}`).sort();
      paths.push(...formPaths);
    }
    paths.push(`${entityBase}/ribbondiffs`);
    const sqPaths = componentFiles.filter((p) => p.startsWith(`entities/${full}/savedqueries/`)).map((p) => `/${p.slice(0, p.length - "/savedquery.yml".length)}`).sort();
    paths.push(...sqPaths);
  }
  const relPaths = componentFiles.filter((p) => p.startsWith("entityrelationships/")).map((p) => `/${p.slice(0, p.length - "/entityrelationship.yml".length)}`).sort();
  paths.push(...relPaths);
  for (const os2 of config.option_sets) {
    paths.push(`/optionsets/${prefixed(os2.name, prefix)}`);
  }
  paths.push(`/publishers/${config.solution.publisher.name}`);
  return paths;
}
function generate9(config, managed, componentFiles) {
  const sol = config.solution;
  const name = sol.name;
  const base = `solutions/${name}`;
  const solutionData = {
    ImportExportXml: {
      "@version": "9.2.26035.182",
      "@SolutionPackageVersion": f(9.2),
      "@languagecode": 1033,
      "@generatedBy": "CrmLive",
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      SolutionManifest: {
        UniqueName: name,
        LocalizedNames: {
          LocalizedName: {
            "@description": sol.display_name,
            "@languagecode": 1033
          }
        },
        Descriptions: null,
        Version: sol.version,
        Managed: managed ? 1 : 0,
        Publisher: {
          UniqueName: sol.publisher.name
        }
      }
    }
  };
  const paths = componentPaths(config, componentFiles);
  const componentsData = {
    SolutionComponents: {
      Component: paths.map((p) => ({ "@path": p }))
    }
  };
  const prefix = sol.publisher.prefix;
  const rootComponents = [];
  for (const entity of config.entities) {
    rootComponents.push({
      "@type": 1,
      "@schemaName": prefixed(entity.name, prefix),
      "@behavior": 0
    });
  }
  for (const os2 of config.option_sets) {
    rootComponents.push({
      "@type": 9,
      "@schemaName": prefixed(os2.name, prefix),
      "@behavior": 0
    });
  }
  const rootData = { RootComponents: { RootComponent: rootComponents } };
  const missingData = { MissingDependencies: null };
  return {
    [`${base}/solution.yml`]: solutionData,
    [`${base}/solutioncomponents.yml`]: componentsData,
    [`${base}/rootcomponents.yml`]: rootData,
    [`${base}/missingdependencies.yml`]: missingData
  };
}

// compiler.ts
function compile(config, outputDir, managed = true) {
  const publisherPrefix = config.solution.publisher.prefix;
  const files = /* @__PURE__ */ new Map();
  for (const [k, v] of Object.entries(generate(config.solution.publisher)))
    files.set(k, v);
  for (const os2 of config.option_sets)
    for (const [k, v] of Object.entries(generate2(os2, publisherPrefix)))
      files.set(k, v);
  for (const ent of config.entities) {
    for (const gen of [entity_exports, attribute_exports, formxml_exports, savedquery_exports, ribbondiff_exports, relationship_exports])
      for (const [k, v] of Object.entries(gen.generate(ent, publisherPrefix)))
        files.set(k, v);
  }
  for (const [k, v] of Object.entries(generate9(config, managed, [...files.keys()])))
    files.set(k, v);
  import_fs3.default.rmSync(outputDir, { recursive: true, force: true });
  import_fs3.default.mkdirSync(outputDir, { recursive: true });
  for (const [relPath, data] of files)
    writeYaml(import_path3.default.join(outputDir, relPath), data);
}

// tester.ts
var import_os = __toESM(require("os"));
var import_path4 = __toESM(require("path"));
var import_fs4 = __toESM(require("fs"));
var _chalk = null;
async function getChalk() {
  if (!_chalk) {
    _chalk = (await import("chalk")).default;
  }
  return _chalk;
}
function diff(a, b, p, ignore) {
  const results = [];
  if (a !== null && b !== null && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const aObj = a;
    const bObj = b;
    const keys = Array.from(
      /* @__PURE__ */ new Set([...Object.keys(aObj), ...Object.keys(bObj)])
    ).sort();
    for (const k of keys) {
      if (ignore.has(k)) continue;
      const kp = p ? `${p}.${k}` : k;
      if (!(k in aObj)) {
        results.push([kp, "<missing>", bObj[k]]);
      } else if (!(k in bObj)) {
        results.push([kp, aObj[k], "<missing>"]);
      } else {
        results.push(...diff(aObj[k], bObj[k], kp, ignore));
      }
    }
  } else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      results.push([p, `<list len=${a.length}>`, `<list len=${b.length}>`]);
    } else {
      for (let i = 0; i < a.length; i++) {
        results.push(...diff(a[i], b[i], `${p}[${i}]`, ignore));
      }
    }
  } else {
    if (a !== b) {
      results.push([p, a, b]);
    }
  }
  return results;
}
function rglob(dir, ext) {
  const results = [];
  if (!import_fs4.default.existsSync(dir)) return results;
  const entries = import_fs4.default.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = import_path4.default.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...rglob(full, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}
async function run(opts) {
  const { inputDir, actual, outDir, solVersion, unmanaged, skipBuild, ignore } = opts;
  const chalk = await getChalk();
  const useTmp = outDir === null;
  const tmpDir = useTmp ? import_fs4.default.mkdtempSync(import_path4.default.join(import_os.default.tmpdir(), "dvforge_test_")) : null;
  const buildDir = outDir ?? tmpDir;
  let ok = false;
  try {
    if (!skipBuild) {
      const config = load(inputDir);
      if (solVersion) {
        config.solution.version = solVersion;
      }
      console.log(`Building: ${config.solution.name} v${config.solution.version}`);
      compile(config, buildDir, !unmanaged);
      console.log();
    }
    if (!import_fs4.default.existsSync(buildDir)) {
      process.stderr.write(chalk.red(`Output directory not found: ${buildDir}
`));
      return false;
    }
    const forgeAbsolute = rglob(buildDir, ".yml");
    const actualAbsolute = rglob(actual, ".yml");
    const forgeRelSet = new Set(
      forgeAbsolute.map((p) => import_path4.default.relative(buildDir, p))
    );
    const actualRelSet = new Set(
      actualAbsolute.map((p) => import_path4.default.relative(actual, p))
    );
    const onlyForge = [...forgeRelSet].filter((f2) => !actualRelSet.has(f2)).sort();
    const onlyActual = [...actualRelSet].filter((f2) => !forgeRelSet.has(f2)).sort();
    const shared = [...forgeRelSet].filter((f2) => actualRelSet.has(f2)).sort();
    let matched = 0;
    const diffedFiles = [];
    for (const rel of shared) {
      const forgePath = import_path4.default.join(buildDir, rel);
      const actualPath = import_path4.default.join(actual, rel);
      const diffs = diff(
        readYaml(forgePath),
        readYaml(actualPath),
        "",
        ignore
      );
      if (diffs.length > 0) {
        diffedFiles.push([rel, diffs]);
      } else {
        matched++;
      }
    }
    for (const [rel, diffs] of diffedFiles) {
      console.log(chalk.yellow(`
${"\u2500".repeat(60)}`));
      console.log(chalk.bold(chalk.yellow(`DIFF  ${rel}`)));
      console.log(chalk.yellow("\u2500".repeat(60)));
      for (const [p, forgeVal, actualVal] of diffs) {
        console.log(`  ${p}`);
        console.log(chalk.cyan(`    forge:  ${JSON.stringify(forgeVal)}`));
        console.log(chalk.green(`    actual: ${JSON.stringify(actualVal)}`));
      }
    }
    if (onlyForge.length > 0) {
      console.log(chalk.magenta(`
${"\u2500".repeat(60)}`));
      console.log(
        chalk.bold(
          chalk.magenta(`Only in forge output (${onlyForge.length} files):`)
        )
      );
      for (const f2 of onlyForge) {
        console.log(chalk.magenta(`  + ${f2}`));
      }
    }
    if (onlyActual.length > 0) {
      console.log(chalk.blue(`
${"\u2500".repeat(60)}`));
      console.log(
        chalk.bold(
          chalk.blue(`Only in actual output (${onlyActual.length} files):`)
        )
      );
      for (const f2 of onlyActual) {
        console.log(chalk.blue(`  - ${f2}`));
      }
    }
    console.log(`
${"\u2550".repeat(60)}`);
    const total = shared.length + onlyForge.length + onlyActual.length;
    ok = diffedFiles.length === 0 && onlyForge.length === 0 && onlyActual.length === 0;
    const summary = `  Files: ${total} total  |  ${matched} matched  |  ${diffedFiles.length} with diffs  |  ${onlyForge.length} only-forge  |  ${onlyActual.length} only-actual`;
    console.log(
      ok ? chalk.bold(chalk.green(summary)) : chalk.bold(chalk.red(summary))
    );
    console.log("\u2550".repeat(60));
  } finally {
    if (useTmp && tmpDir) {
      import_fs4.default.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
  return ok;
}

// schemaGen.ts
var import_zod_to_json_schema = require("zod-to-json-schema");
var import_zod2 = require("zod");

// model.ts
var import_zod = require("zod");
var PublisherSchema = import_zod.z.object({
  name: import_zod.z.string(),
  display_name: import_zod.z.string(),
  prefix: import_zod.z.string(),
  option_value_prefix: import_zod.z.number().int()
});
var SolutionSchema = import_zod.z.object({
  name: import_zod.z.string(),
  display_name: import_zod.z.string(),
  version: import_zod.z.string(),
  publisher: PublisherSchema
});
var OptionValueSchema = import_zod.z.object({
  label: import_zod.z.string(),
  value: import_zod.z.number().int()
});
var OptionSetSchema = import_zod.z.object({
  name: import_zod.z.string(),
  display_name: import_zod.z.string(),
  options: import_zod.z.array(OptionValueSchema)
});
var ColumnSchema = import_zod.z.object({
  name: import_zod.z.string(),
  type: import_zod.z.enum(["string", "lookup", "choice", "datetime", "dateonly", "int"]),
  display_name: import_zod.z.string(),
  required: import_zod.z.boolean().default(false),
  primary_name: import_zod.z.boolean().default(false),
  max_length: import_zod.z.number().int().nullish(),
  option_set: import_zod.z.string().nullish(),
  related_table: import_zod.z.string().nullish()
}).superRefine((col, ctx) => {
  if (col.type === "choice" && !col.option_set) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: `Column '${col.name}': choice columns must specify option_set`
    });
  }
  if (col.type === "lookup" && !col.related_table) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: `Column '${col.name}': lookup columns must specify related_table`
    });
  }
  if (["datetime", "dateonly", "int"].includes(col.type) && col.related_table) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: `Column '${col.name}': datetime/dateonly/int columns cannot specify related_table`
    });
  }
  if (["datetime", "dateonly", "int"].includes(col.type) && col.option_set) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: `Column '${col.name}': datetime/dateonly/int columns cannot specify option_set`
    });
  }
});
var RelationshipSchema = import_zod.z.object({
  related_table: import_zod.z.string(),
  lookup_column: import_zod.z.string()
});
var EntitySchema = import_zod.z.object({
  name: import_zod.z.string(),
  display_name: import_zod.z.string(),
  display_name_plural: import_zod.z.string(),
  description: import_zod.z.string().nullish(),
  ownership: import_zod.z.enum(["user", "organization"]).default("user"),
  columns: import_zod.z.array(ColumnSchema).default([]),
  relationships: import_zod.z.array(RelationshipSchema).default([])
});
var ConfigSchema = import_zod.z.object({
  solution: SolutionSchema,
  option_sets: import_zod.z.array(OptionSetSchema),
  entities: import_zod.z.array(EntitySchema)
});

// schemaGen.ts
var import_fs5 = __toESM(require("fs"));
var import_path5 = __toESM(require("path"));
var SolutionFileSchema = import_zod2.z.object({ solution: SolutionSchema });
var OptionSetsFileSchema = import_zod2.z.object({ optionsets: import_zod2.z.array(OptionSetSchema) });
var EntitiesFileSchema = import_zod2.z.object({ entities: import_zod2.z.array(EntitySchema) });
var SCHEMAS = [
  { filename: "solution.schema.json", schema: SolutionFileSchema, glob: "solution.yml" },
  { filename: "optionsets.schema.json", schema: OptionSetsFileSchema, glob: "optionsets.yml" },
  { filename: "entities.schema.json", schema: EntitiesFileSchema, glob: "entities/*.yml" }
];
function generate10(projectDir) {
  const schemasDir = import_path5.default.join(projectDir, "schemas");
  import_fs5.default.mkdirSync(schemasDir, { recursive: true });
  const written = [];
  for (const { filename, schema } of SCHEMAS) {
    const p = import_path5.default.join(schemasDir, filename);
    import_fs5.default.writeFileSync(p, JSON.stringify((0, import_zod_to_json_schema.zodToJsonSchema)(schema), null, 2));
    written.push(p);
  }
  updateVscodeSettings(projectDir, schemasDir);
  return written;
}
function updateVscodeSettings(projectDir, schemasDir) {
  const vscodeDir = import_path5.default.join(projectDir, ".vscode");
  import_fs5.default.mkdirSync(vscodeDir, { recursive: true });
  const settingsPath = import_path5.default.join(vscodeDir, "settings.json");
  let settings = {};
  if (import_fs5.default.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(import_fs5.default.readFileSync(settingsPath, "utf-8"));
    } catch {
    }
  }
  const rel = import_path5.default.relative(projectDir, schemasDir).replace(/\\/g, "/");
  settings["yaml.schemas"] = Object.fromEntries(
    SCHEMAS.map(({ filename, glob }) => [`./${rel}/${filename}`, glob])
  );
  import_fs5.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
}

// cli.ts
var program = new import_commander.Command();
program.name("dvforge");
program.command("build").requiredOption("--input <dir>", "Path to input YAML directory").requiredOption("--output <dir>", "Path to write compiled solution files").option("--version <ver>", "Override solution version (e.g. 1.2.0.0)").option("--unmanaged", "Generate an unmanaged solution (default: managed)", false).option("--dry-run", "Print output paths without writing files", false).action((opts) => {
  const config = load(opts.input);
  if (opts.version) {
    config.solution.version = opts.version;
  }
  const managed = !opts.unmanaged;
  console.log(`Solution : ${config.solution.name} v${config.solution.version} (${opts.unmanaged ? "unmanaged" : "managed"})`);
  console.log(`Publisher: ${config.solution.publisher.name} (${config.solution.publisher.prefix}_)`);
  console.log(`Entities : ${config.entities.map((e) => e.name).join(", ")}`);
  console.log(`Input    : ${opts.input}`);
  console.log(`Output   : ${opts.output}`);
  if (opts.dryRun) {
    console.log("\n[dry-run] No files written.");
    return;
  }
  compile(config, opts.output, managed);
  console.log("\nDone.");
});
program.command("test").requiredOption("--input <dir>", "dvforge input directory").requiredOption("--actual <dir>", "pac solution unpack directory to compare against").option("--out <dir>", "Save build output here instead of a temp dir (dir is kept after the run)").option("--version <ver>", "Override solution version (e.g. 1.0.0.1)").option("--unmanaged", "Generate an unmanaged solution (default: managed)", false).option("--skip-build", "Skip building; requires --out pointing at existing output", false).option(
  "--ignore-key <key>",
  "YAML key to skip in comparison (repeatable)",
  (v, acc) => [...acc, v],
  []
).action(
  async (opts) => {
    if (opts.skipBuild && !opts.out) {
      console.error("error: --skip-build requires --out <existing output directory>");
      process.exit(1);
    }
    const ignore = /* @__PURE__ */ new Set([...opts.ignoreKey, "@version", "Managed"]);
    const ok = await run({
      inputDir: opts.input,
      actual: opts.actual,
      outDir: opts.out ?? null,
      solVersion: opts.version ?? null,
      unmanaged: opts.unmanaged,
      skipBuild: opts.skipBuild,
      ignore
    });
    process.exit(ok ? 0 : 1);
  }
);
program.command("schema").option("--output <dir>", "Project root to write schemas into (default: current directory)", ".").action((opts) => {
  const outputDir = import_path6.default.resolve(opts.output);
  const written = generate10(outputDir);
  for (const p of written) {
    console.log(`  ${import_path6.default.relative(outputDir, p)}`);
  }
  console.log("\n.vscode/settings.json updated.");
});
program.parse();
