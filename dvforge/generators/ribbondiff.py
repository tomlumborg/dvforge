from __future__ import annotations

from dvforge.model import Entity
from dvforge.utils import prefixed


def generate(entity: Entity, prefix: str) -> dict[str, dict]:
    full = prefixed(entity.name, prefix)
    data = {
        'RibbonDiffXml': {
            'CustomActions': None,
            'Templates': {
                'RibbonTemplates': {'@Id': 'Mscrm.Templates'},
            },
            'CommandDefinitions': None,
            'RuleDefinitions': {
                'TabDisplayRules': None,
                'DisplayRules': None,
                'EnableRules': None,
            },
            'LocLabels': None,
        }
    }
    return {f"entities/{full}/ribbondiffs/ribbondiff.yml": data}
