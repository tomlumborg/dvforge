from __future__ import annotations

from dvforge.model import Entity, Relationship
from dvforge.utils import prefixed


def _rel(name: str, referencing: str, referenced: str, referencing_attr: str,
         cascade_delete: str = 'NoCascade',
         cascade_archive: str = 'NoCascade',
         description: str = '',
         nav_property: str | None = None,
         include_roles: bool = False,
         introduced_version: str | float = '1.0',
         is_custom: bool = False) -> dict:
    er: dict = {
        '@Name': name,
        'EntityRelationshipType': 'OneToMany',
        'IsCustomizable': 1,
        'IntroducedVersion': introduced_version,
        'IsHierarchical': 0,
        'ReferencingEntityName': referencing,
        'ReferencedEntityName': referenced,
        'CascadeAssign': 'NoCascade',
        'CascadeDelete': cascade_delete,
        'CascadeArchive': cascade_archive,
        'CascadeReparent': 'NoCascade',
        'CascadeShare': 'NoCascade',
        'CascadeUnshare': 'NoCascade',
    }
    if is_custom:
        er['CascadeRollupView'] = 'NoCascade'
        er['IsValidForAdvancedFind'] = 1
    er['ReferencingAttributeName'] = referencing_attr
    er['RelationshipDescription'] = {
        'Descriptions': {
            'Description': {
                '@description': description,
                '@languagecode': 1033,
            }
        }
    }

    data: dict = {'EntityRelationship': er}

    if include_roles:
        nav = nav_property or referencing_attr
        er['EntityRelationshipRoles'] = {
            'EntityRelationshipRole': [
                {
                    'NavPaneDisplayOption': 'UseCollectionName',
                    'NavPaneArea': 'Details',
                    'NavPaneOrder': 10000,
                    'NavigationPropertyName': nav,
                    'RelationshipRoleType': 1,
                },
                {
                    'NavigationPropertyName': name,
                    'RelationshipRoleType': 0,
                },
            ]
        }
    return data


def _system_relationships(entity: Entity, prefix: str) -> dict[str, dict]:
    full = prefixed(entity.name, prefix)
    files: dict[str, dict] = {}

    systems = [
        (
            f"business_unit_{full}",
            full, 'BusinessUnit', 'OwningBusinessUnit',
            'Restrict', 'NoCascade',
            'Unique identifier for the business unit that owns the record',
        ),
        (
            f"lk_{full}_createdby",
            full, 'SystemUser', 'CreatedBy',
            'NoCascade', 'NoCascade',
            'Unique identifier of the user who created the record.',
        ),
        (
            f"lk_{full}_modifiedby",
            full, 'SystemUser', 'ModifiedBy',
            'NoCascade', 'NoCascade',
            'Unique identifier of the user who modified the record.',
        ),
        (
            f"owner_{full}",
            full, 'Owner', 'OwnerId',
            'NoCascade', 'NoCascade',
            'Owner Id',
        ),
        (
            f"team_{full}",
            full, 'Team', 'OwningTeam',
            'NoCascade', 'NoCascade',
            'Unique identifier for the team that owns the record.',
        ),
        (
            f"user_{full}",
            full, 'SystemUser', 'OwningUser',
            'NoCascade', 'NoCascade',
            'Unique identifier for the user that owns the record.',
        ),
    ]

    for name, referencing, referenced, attr, cascade_del, cascade_arch, desc in systems:
        files[f"entityrelationships/{name}/entityrelationship.yml"] = _rel(
            name, referencing, referenced, attr,
            cascade_delete=cascade_del,
            cascade_archive=cascade_arch,
            description=desc,
            introduced_version=1.0,
        )
    return files


def _custom_relationship(entity: Entity, rel: Relationship, prefix: str) -> dict[str, dict]:
    full_referencing = prefixed(entity.name, prefix)
    full_referenced = prefixed(rel.related_table, prefix)
    full_attr = prefixed(rel.lookup_column, prefix)
    name = f"{full_referenced}__{full_referencing}_{full_attr}"

    data = _rel(
        name,
        referencing=full_referencing,
        referenced=full_referenced,
        referencing_attr=full_attr,
        cascade_delete='RemoveLink',
        cascade_archive='RemoveLink',
        description='',
        nav_property=full_attr,
        include_roles=True,
        introduced_version='1.0.0.0',
        is_custom=True,
    )
    return {f"entityrelationships/{name}/entityrelationship.yml": data}


def generate(entity: Entity, prefix: str) -> dict[str, dict]:
    files: dict[str, dict] = {}
    files.update(_system_relationships(entity, prefix))
    for rel in entity.relationships:
        files.update(_custom_relationship(entity, rel, prefix))
    return files
