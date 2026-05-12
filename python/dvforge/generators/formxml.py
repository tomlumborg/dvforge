from __future__ import annotations

from dvforge.model import Entity
from dvforge.utils import det_uuid, prefixed

# classid for standard controls
_CLASSID_TEXT = '{4273EDBD-AC1D-40d3-9FB2-095C621B552D}'
_CLASSID_LOOKUP = '{270BD3DB-D9AF-4782-9025-509E298DEC0A}'
_CLASSID_STATUS = '{5D68B988-0661-4db2-BC3E-17598AD3BE6C}'


def _cell(uid: str, label: str, field: str, classid: str, disabled: bool | None = None) -> dict:
    control: dict = {
        '@id': field,
        '@classid': classid,
        '@datafieldname': field,
    }
    if disabled is not None:
        control['@disabled'] = disabled
    return {
        '@id': f'{{{uid}}}',
        'labels': {'label': {'@description': label, '@languagecode': 1033}},
        'control': control,
    }


def _empty_cell(uid: str) -> dict:
    return {
        '@id': f'{{{uid}}}',
        '@showlabel': True,
        '@locklevel': 0,
        'labels': {'label': {'@description': '', '@languagecode': 1033}},
    }


def _main_form(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    name_field = prefixed('name', prefix)
    form_uuid = det_uuid(f"{full}:main")
    tab_uuid = det_uuid(f"{full}:main:tab")
    sec_uuid = det_uuid(f"{full}:main:section")

    rows = [
        {'cell': _cell(det_uuid(f"{full}:main:cell:name"), 'Name', name_field, _CLASSID_TEXT)},
        {'cell': _cell(det_uuid(f"{full}:main:cell:owner"), 'Owner', 'ownerid', _CLASSID_LOOKUP)},
    ]

    data = {
        'systemform': {
            'formid': f'{{{form_uuid}}}',
            'IntroducedVersion': 1.0,
            'FormPresentation': 1,
            'FormActivationState': 1,
            'form': {
                'tabs': {
                    'tab': {
                        '@verticallayout': True,
                        '@id': f'{{{tab_uuid}}}',
                        '@IsUserDefined': 1,
                        'labels': {'label': {'@description': 'General', '@languagecode': 1033}},
                        'columns': {
                            'column': {
                                '@width': '100%',
                                'sections': {
                                    'section': {
                                        '@showlabel': False,
                                        '@showbar': False,
                                        '@IsUserDefined': 0,
                                        '@id': f'{{{sec_uuid}}}',
                                        'labels': {'label': {'@description': 'General', '@languagecode': 1033}},
                                        'rows': {'row': rows},
                                    }
                                },
                            }
                        },
                    }
                }
            },
            'IsCustomizable': 1,
            'CanBeDeleted': 1,
            'LocalizedNames': {'LocalizedName': {'@description': 'Information', '@languagecode': 1033}},
            'Descriptions': {'Description': {'@description': 'A form for this entity.', '@languagecode': 1033}},
        }
    }
    path = f"entities/{full}/formxml/main/{form_uuid}/systemform.yml"
    return path, data


def _quick_form(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    name_field = prefixed('name', prefix)
    form_uuid = det_uuid(f"{full}:quick")
    tab_uuid = det_uuid(f"{full}:quick:tab")
    sec_uuid = det_uuid(f"{full}:quick:section")

    rows = [
        {'cell': _cell(det_uuid(f"{full}:quick:cell:name"), 'Name', name_field, _CLASSID_TEXT)},
        {'cell': _cell(det_uuid(f"{full}:quick:cell:owner"), 'Owner', 'ownerid', _CLASSID_LOOKUP)},
    ]

    data = {
        'systemform': {
            'formid': f'{{{form_uuid}}}',
            'IntroducedVersion': 1.0,
            'FormPresentation': 1,
            'FormActivationState': 1,
            'form': {
                'tabs': {
                    'tab': {
                        '@verticallayout': True,
                        '@id': f'{{{tab_uuid}}}',
                        '@IsUserDefined': 1,
                        'labels': {'label': {'@description': '', '@languagecode': 1033}},
                        'columns': {
                            'column': {
                                '@width': '100%',
                                'sections': {
                                    'section': {
                                        '@showlabel': False,
                                        '@showbar': False,
                                        '@IsUserDefined': 0,
                                        '@id': f'{{{sec_uuid}}}',
                                        'labels': {'label': {'@description': 'GENERAL', '@languagecode': 1033}},
                                        'rows': {'row': rows},
                                    }
                                },
                            }
                        },
                    }
                }
            },
            'IsCustomizable': 1,
            'CanBeDeleted': 1,
            'LocalizedNames': {'LocalizedName': {'@description': 'Information', '@languagecode': 1033}},
        }
    }
    path = f"entities/{full}/formxml/quick/{form_uuid}/systemform.yml"
    return path, data


def _card_form(entity: Entity, prefix: str) -> tuple[str, dict]:
    full = prefixed(entity.name, prefix)
    name_field = prefixed('name', prefix)
    form_uuid = det_uuid(f"{full}:card")
    tab_uuid = det_uuid(f"{full}:card:tab")

    def _sec_uid(key: str) -> str:
        return det_uuid(f"{full}:card:{key}")

    color_col = {
        '@width': '25%',
        'sections': {
            'section': {
                '@name': 'ColorStrip',
                '@showlabel': False,
                '@showbar': False,
                '@columns': 1,
                '@IsUserDefined': 0,
                '@id': f'{{{_sec_uid("colorstrip")}}}',
                'labels': {'label': {'@description': 'ColorStrip', '@languagecode': 1033}},
            }
        },
    }

    header_cell = {
        '@id': f'{{{det_uuid(f"{full}:card:hcell:status")}}}',
        '@showlabel': True,
        '@locklevel': 0,
        'labels': {'label': {'@description': 'Status Reason', '@languagecode': 1033}},
        'control': {
            '@id': 'statuscode',
            '@classid': _CLASSID_STATUS,
            '@datafieldname': 'statuscode',
            '@disabled': False,
        },
    }

    detail_cell = {
        '@id': f'{{{det_uuid(f"{full}:card:dcell:name")}}}',
        '@showlabel': True,
        '@locklevel': 0,
        'labels': {'label': {'@description': 'Name', '@languagecode': 1033}},
        'control': {
            '@id': name_field,
            '@classid': _CLASSID_TEXT,
            '@datafieldname': name_field,
            '@disabled': False,
        },
    }

    footer_cells = [
        {
            '@id': f'{{{det_uuid(f"{full}:card:fcell:owner")}}}',
            '@showlabel': True,
            '@locklevel': 0,
            'labels': {'label': {'@description': 'Owner', '@languagecode': 1033}},
            'control': {
                '@id': 'ownerid',
                '@classid': _CLASSID_LOOKUP,
                '@datafieldname': 'ownerid',
                '@disabled': False,
            },
        },
        {
            '@id': f'{{{det_uuid(f"{full}:card:fcell:createdon")}}}',
            '@showlabel': True,
            '@locklevel': 0,
            'labels': {'label': {'@description': 'Created On', '@languagecode': 1033}},
            'control': {
                '@id': 'createdon',
                '@classid': _CLASSID_LOOKUP,
                '@datafieldname': 'createdon',
                '@disabled': False,
            },
        },
        _empty_cell(det_uuid(f"{full}:card:fcell:empty1")),
        _empty_cell(det_uuid(f"{full}:card:fcell:empty2")),
    ]

    content_col = {
        '@width': '75%',
        'sections': {
            'section': [
                {
                    '@name': 'CardHeader',
                    '@showlabel': False,
                    '@showbar': False,
                    '@columns': 111,
                    '@id': f'{{{_sec_uid("cardheader")}}}',
                    '@IsUserDefined': 0,
                    'labels': {'label': {'@description': 'Header', '@languagecode': 1033}},
                    'rows': {'row': {'cell': [
                        header_cell,
                        _empty_cell(det_uuid(f"{full}:card:hcell:empty1")),
                        _empty_cell(det_uuid(f"{full}:card:hcell:empty2")),
                    ]}},
                },
                {
                    '@name': 'CardDetails',
                    '@showlabel': False,
                    '@showbar': False,
                    '@columns': 1,
                    '@id': f'{{{_sec_uid("carddetails")}}}',
                    '@IsUserDefined': 0,
                    'labels': {'label': {'@description': 'Details', '@languagecode': 1033}},
                    'rows': {'row': {'cell': detail_cell}},
                },
                {
                    '@name': 'CardFooter',
                    '@showlabel': False,
                    '@columns': 1111,
                    '@showbar': False,
                    '@id': f'{{{_sec_uid("cardfooter")}}}',
                    '@IsUserDefined': 0,
                    'labels': {'label': {'@description': 'Footer', '@languagecode': 1033}},
                    'rows': {'row': {'cell': footer_cells}},
                },
            ]
        },
    }

    data = {
        'systemform': {
            'formid': f'{{{form_uuid}}}',
            'IntroducedVersion': 1.0,
            'FormPresentation': 1,
            'FormActivationState': 1,
            'form': {
                'tabs': {
                    'tab': {
                        '@name': 'general',
                        '@verticallayout': True,
                        '@id': f'{{{tab_uuid}}}',
                        '@IsUserDefined': 0,
                        'labels': {'label': {'@description': '', '@languagecode': 1033}},
                        'columns': {'column': [color_col, content_col]},
                    }
                }
            },
            'IsCustomizable': 1,
            'CanBeDeleted': 1,
            'LocalizedNames': {'LocalizedName': {'@description': 'Information', '@languagecode': 1033}},
            'Descriptions': {'Description': {'@description': 'A card form for this entity.', '@languagecode': 1033}},
        }
    }
    path = f"entities/{full}/formxml/card/{form_uuid}/systemform.yml"
    return path, data


def generate(entity: Entity, prefix: str) -> dict[str, dict]:
    files: dict[str, dict] = {}
    for path, data in [_main_form(entity, prefix), _quick_form(entity, prefix), _card_form(entity, prefix)]:
        files[path] = data
    return files
