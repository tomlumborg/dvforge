from __future__ import annotations

from dvforge.model import Entity
from dvforge.utils import det_uuid, prefixed


def _layout(id_field: str, name_field: str,
            grid_name: str = 'resultset', row_name: str = 'result',
            preview: int = 1) -> dict:
    return {
        'grid': {
            '@name': grid_name,
            '@jump': name_field,
            '@select': 1,
            '@icon': 1,
            '@preview': preview,
            'row': {
                '@name': row_name,
                '@id': id_field,
                'cell': [
                    {'@name': name_field, '@width': 300},
                    {'@name': 'createdon', '@width': 125},
                ],
            },
        }
    }


def _active_filter() -> dict:
    return {
        '@type': 'and',
        'condition': {'@attribute': 'statecode', '@operator': 'eq', '@value': 0},
    }


def _inactive_filter() -> dict:
    return {
        '@type': 'and',
        'condition': {'@attribute': 'statecode', '@operator': 'eq', '@value': 1},
    }


def _base_query(entity_name: str, id_field: str, name_field: str) -> dict:
    return {
        '@version': 1.0,
        '@mapping': 'logical',
        'entity': {
            '@name': entity_name,
            'attribute': [
                {'@name': id_field},
                {'@name': name_field},
                {'@name': 'createdon'},
            ],
        },
    }


def _active(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    name_field = prefixed('name', prefix)
    uid = det_uuid(f"{full}:sq:active")

    fetch = _base_query(full, id_field, name_field)
    fetch['entity']['order'] = {'@attribute': name_field, '@descending': False}
    fetch['entity']['filter'] = _active_filter()

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 0,
            'isquickfindquery': 0,
            'isprivate': 0,
            'isdefault': 1,
            'savedqueryid': f'{{{uid}}}',
            'layoutxml': _layout(id_field, name_field),
            'querytype': 0,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"Active {entity.display_name_plural}", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def _inactive(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    name_field = prefixed('name', prefix)
    uid = det_uuid(f"{full}:sq:inactive")

    fetch = _base_query(full, id_field, name_field)
    fetch['entity']['order'] = {'@attribute': name_field, '@descending': False}
    fetch['entity']['filter'] = _inactive_filter()

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 0,
            'isquickfindquery': 0,
            'isprivate': 0,
            'isdefault': 0,
            'savedqueryid': f'{{{uid}}}',
            'layoutxml': _layout(id_field, name_field),
            'querytype': 0,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"Inactive {entity.display_name_plural}", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def _my_records(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    uid = det_uuid(f"{full}:sq:my")

    fetch = {
        '@version': 1.0,
        '@mapping': 'logical',
        '@output-format': 'xml-platform',
        'entity': {
            '@name': full,
            'attribute': {'@name': id_field},
            'filter': {
                '@type': 'and',
                'condition': [
                    {'@attribute': 'statecode', '@operator': 'eq', '@value': 0},
                    {'@attribute': 'ownerid', '@operator': 'eq-userid'},
                ],
            },
        },
    }

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 1,
            'isquickfindquery': 0,
            'isprivate': 0,
            'isdefault': 1,
            'savedqueryid': f'{{{uid}}}',
            'querytype': 8192,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"My {entity.display_name_plural}", '@languagecode': 1033}},
            'Descriptions': {'Description': {'@description': f"Active {entity.display_name_plural} owned by me", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def _advanced_find(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    name_field = prefixed('name', prefix)
    uid = det_uuid(f"{full}:sq:advanced")

    fetch = _base_query(full, id_field, name_field)
    fetch['entity']['order'] = {'@attribute': name_field, '@descending': False}

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 0,
            'isquickfindquery': 0,
            'isprivate': 0,
            'isdefault': 1,
            'savedqueryid': f'{{{uid}}}',
            'layoutxml': _layout(id_field, name_field),
            'querytype': 1,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"{entity.display_name} Advanced Find View", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def _associated(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    name_field = prefixed('name', prefix)
    uid = det_uuid(f"{full}:sq:associated")

    fetch = _base_query(full, id_field, name_field)
    fetch['entity']['order'] = {'@attribute': name_field, '@descending': False}
    fetch['entity']['filter'] = _active_filter()

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 0,
            'isquickfindquery': 0,
            'isprivate': 0,
            'isdefault': 1,
            'savedqueryid': f'{{{uid}}}',
            'layoutxml': _layout(id_field, name_field, grid_name=f"{full}s", row_name=full),
            'querytype': 2,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"{entity.display_name} Associated View", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def _lookup_view(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    name_field = prefixed('name', prefix)
    uid = det_uuid(f"{full}:sq:lookup")

    fetch = _base_query(full, id_field, name_field)
    fetch['entity']['filter'] = _active_filter()

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 0,
            'isquickfindquery': 0,
            'isprivate': 0,
            'isdefault': 1,
            'savedqueryid': f'{{{uid}}}',
            'layoutxml': _layout(id_field, name_field, grid_name=f"{full}s", row_name=full, preview=0),
            'querytype': 64,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"{entity.display_name} Lookup View", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def _quick_find(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    id_field = f"{full}id"
    name_field = prefixed('name', prefix)
    uid = det_uuid(f"{full}:sq:quickfind")

    fetch = {
        '@version': 1.0,
        '@mapping': 'logical',
        'entity': {
            '@name': full,
            'attribute': [
                {'@name': id_field},
                {'@name': name_field},
                {'@name': 'createdon'},
            ],
            'order': {'@attribute': name_field, '@descending': False},
            'filter': [
                {'@type': 'and', 'condition': {'@attribute': 'statecode', '@operator': 'eq', '@value': 0}},
                {'@type': 'or', '@isquickfindfields': 1,
                 'condition': {'@attribute': name_field, '@operator': 'like', '@value': '{0}'}},
            ],
        },
    }

    data = {
        'savedquery': {
            'IsCustomizable': 1,
            'CanBeDeleted': 0,
            'isquickfindquery': 1,
            'isprivate': 0,
            'isdefault': 1,
            'savedqueryid': f'{{{uid}}}',
            'layoutxml': _layout(id_field, name_field),
            'querytype': 4,
            'fetchxml': {'fetch': fetch},
            'IntroducedVersion': 1.0,
            'LocalizedNames': {'LocalizedName': {'@description': f"Quick Find Active {entity.display_name_plural}", '@languagecode': 1033}},
        }
    }
    return f"entities/{full}/savedqueries/{uid}/savedquery.yml", data


def generate(entity: Entity, prefix: str) -> dict[str, dict]:
    files: dict[str, dict] = {}
    for path, data in [
        _active(entity, prefix),
        _inactive(entity, prefix),
        _my_records(entity, prefix),
        _advanced_find(entity, prefix),
        _associated(entity, prefix),
        _lookup_view(entity, prefix),
        _quick_find(entity, prefix),
    ]:
        files[path] = data
    return files
