import { prefixed } from "../utils.js";
import type { Entity, Relationship } from "../model.js";

function _rel(
  name: string,
  referencing: string,
  referenced: string,
  referencingAttr: string,
  cascadeDelete: string = "NoCascade",
  cascadeArchive: string = "NoCascade",
  description: string = "",
  navProperty: string | null = null,
  includeRoles: boolean = false,
  introducedVersion: string = "1.0.0",
  isCustom: boolean = false
): Record<string, unknown> {
  const er: Record<string, unknown> = {
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
    CascadeUnshare: "NoCascade",
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
        "@languagecode": 1033,
      },
    },
  };

  const data: Record<string, unknown> = { EntityRelationship: er };

  if (includeRoles) {
    const nav = navProperty ?? referencingAttr;
    er["EntityRelationshipRoles"] = {
      EntityRelationshipRole: [
        {
          NavPaneDisplayOption: "UseCollectionName",
          NavPaneArea: "Details",
          NavPaneOrder: 10000,
          NavigationPropertyName: nav,
          RelationshipRoleType: 1,
        },
        {
          NavigationPropertyName: name,
          RelationshipRoleType: 0,
        },
      ],
    };
  }

  return data;
}

function _systemRelationships(
  entity: Entity,
  prefix: string
): Record<string, unknown> {
  const full = prefixed(entity.name, prefix);
  const files: Record<string, unknown> = {};

  const systems: Array<
    [string, string, string, string, string, string, string]
  > = [
    [
      `business_unit_${full}`,
      full,
      "BusinessUnit",
      "OwningBusinessUnit",
      "Restrict",
      "Restrict",
      "Unique identifier for the business unit that owns the record",
    ],
    [
      `lk_${full}_createdby`,
      full,
      "SystemUser",
      "CreatedBy",
      "NoCascade",
      "NoCascade",
      "Unique identifier of the user who created the record.",
    ],
    [
      `lk_${full}_modifiedby`,
      full,
      "SystemUser",
      "ModifiedBy",
      "NoCascade",
      "NoCascade",
      "Unique identifier of the user who modified the record.",
    ],
    [
      `owner_${full}`,
      full,
      "Owner",
      "OwnerId",
      "NoCascade",
      "NoCascade",
      "Owner Id",
    ],
    [
      `team_${full}`,
      full,
      "Team",
      "OwningTeam",
      "NoCascade",
      "NoCascade",
      "Unique identifier for the team that owns the record.",
    ],
    [
      `user_${full}`,
      full,
      "SystemUser",
      "OwningUser",
      "NoCascade",
      "NoCascade",
      "Unique identifier for the user that owns the record.",
    ],
  ];

  for (const [
    name,
    referencing,
    referenced,
    attr,
    cascadeDel,
    cascadeArch,
    desc,
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
      "1.0.0"
    );
  }

  return files;
}

function _customRelationship(
  entity: Entity,
  rel: Relationship,
  prefix: string,
  systemTableNames: Set<string>
): Record<string, unknown> {
  const fullReferencing = prefixed(entity.name, prefix);
  const fullReferenced = systemTableNames.has(rel.related_table)
    ? rel.related_table
    : prefixed(rel.related_table, prefix);
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
    "1.0.0",
    true
  );

  return { [`entityrelationships/${name}/entityrelationship.yml`]: data };
}

export function generate(
  entity: Entity,
  prefix: string,
  systemTableNames: Set<string> = new Set()
): Record<string, unknown> {
  const files: Record<string, unknown> = {};

  Object.assign(files, _systemRelationships(entity, prefix));

  for (const rel of entity.relationships) {
    Object.assign(files, _customRelationship(entity, rel, prefix, systemTableNames));
  }

  return files;
}
