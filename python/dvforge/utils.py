from __future__ import annotations

import uuid
from pathlib import Path

from ruamel.yaml import YAML

_UUID_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # UUID namespace URL

_yaml = YAML()
_yaml.default_flow_style = False
_yaml.width = 4096  # prevent line-wrapping


def prefixed(name: str, prefix: str) -> str:
    return f"{prefix}_{name}"


def det_uuid(seed: str) -> str:
    return str(uuid.uuid5(_UUID_NAMESPACE, seed))


def write_yaml(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        _yaml.dump(data, fh)


def read_yaml(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as fh:
        return _yaml.load(fh)
