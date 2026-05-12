from __future__ import annotations

from dvforge.model import OptionSet
from dvforge.utils import prefixed


def generate(option_set: OptionSet, prefix: str) -> dict[str, dict]:
    full_name = prefixed(option_set.name, prefix)
    data = {
        'optionset': {
            '@Name': full_name,
            '@localizedName': option_set.display_name,
            'OptionSetType': 'picklist',
            'IsGlobal': 1,
            'IntroducedVersion': '1.0.0.0',
            'IsCustomizable': 1,
            'ExternalTypeName': '',
            'displaynames': {
                'displayname': {
                    '@description': option_set.display_name,
                    '@languagecode': 1033,
                }
            },
            'Descriptions': {
                'Description': {
                    '@description': '',
                    '@languagecode': 1033,
                }
            },
            'options': {
                'option': [
                    {
                        '@value': opt.value,
                        '@ExternalValue': '',
                        '@IsHidden': 0,
                        'labels': {
                            'label': {
                                '@description': opt.label,
                                '@languagecode': 1033,
                            }
                        },
                        'Descriptions': {
                            'Description': {
                                '@description': '',
                                '@languagecode': 1033,
                            }
                        },
                    }
                    for opt in option_set.options
                ]
            },
        }
    }
    return {f"optionsets/{full_name}/optionset.yml": data}
