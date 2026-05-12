from __future__ import annotations

import json
from pathlib import Path

from pydantic import BaseModel

from dvforge.model import Entity, OptionSet, Solution


class _SolutionFile(BaseModel):
    solution: Solution


class _OptionSetsFile(BaseModel):
    optionsets: list[OptionSet]


class _EntitiesFile(BaseModel):
    entities: list[Entity]


_SCHEMAS: list[tuple[str, type[BaseModel], str | list[str]]] = [
    ("solution.schema.json",   _SolutionFile,   "solution.yml"),
    ("optionsets.schema.json", _OptionSetsFile, "optionsets.yml"),
    ("entities.schema.json",   _EntitiesFile,   "entities/*.yml"),
]


def generate(project_dir: Path) -> list[Path]:
    schemas_dir = project_dir / "schemas"
    schemas_dir.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    for filename, model, _ in _SCHEMAS:
        path = schemas_dir / filename
        path.write_text(json.dumps(model.model_json_schema(), indent=2))
        written.append(path)

    _update_vscode_settings(project_dir, schemas_dir)
    return written


def _update_vscode_settings(project_dir: Path, schemas_dir: Path) -> None:
    vscode_dir = project_dir / ".vscode"
    vscode_dir.mkdir(exist_ok=True)
    settings_path = vscode_dir / "settings.json"

    settings: dict = {}
    if settings_path.exists():
        try:
            settings = json.loads(settings_path.read_text())
        except json.JSONDecodeError:
            pass

    rel = schemas_dir.relative_to(project_dir)
    settings["yaml.schemas"] = {
        f"./{rel.as_posix()}/{filename}": glob
        for filename, _, glob in _SCHEMAS
    }

    settings_path.write_text(json.dumps(settings, indent=4))
