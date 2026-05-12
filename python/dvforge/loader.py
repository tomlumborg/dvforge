from __future__ import annotations

from pathlib import Path

from dvforge.model import Column, Config, Entity, OptionSet, OptionValue, Publisher, Relationship, Solution
from dvforge.utils import read_yaml


def load(input_dir: Path) -> Config:
    solution = _load_solution(input_dir / "solution.yml")
    option_sets = _load_option_sets(input_dir / "optionsets.yml")
    entities = _load_entities(input_dir / "entities")
    return Config(solution=solution, option_sets=option_sets, entities=entities)


def _load_solution(path: Path) -> Solution:
    raw = read_yaml(path)["solution"]
    pub = raw["publisher"]
    return Solution(
        name=raw["name"],
        display_name=raw["display_name"],
        version=raw["version"],
        publisher=Publisher(
            name=pub["name"],
            display_name=pub["display_name"],
            prefix=pub["prefix"],
            option_value_prefix=pub["option_value_prefix"],
        ),
    )


def _load_option_sets(path: Path) -> list[OptionSet]:
    if not path.exists():
        return []
    raw = read_yaml(path)
    return [
        OptionSet(
            name=os["name"],
            display_name=os["display_name"],
            options=[OptionValue(label=o["label"], value=o["value"]) for o in os.get("options", [])],
        )
        for os in (raw.get("optionsets") or [])
    ]


def _load_entities(entities_dir: Path) -> list[Entity]:
    if not entities_dir.exists():
        return []
    entities: list[Entity] = []
    for yml_file in sorted(entities_dir.glob("*.yml")):
        raw = read_yaml(yml_file)
        for ent in raw.get("entities", []):
            entities.append(_parse_entity(ent))
    return entities


def _parse_entity(raw: dict) -> Entity:
    columns = [_parse_column(c) for c in (raw.get("columns") or [])]
    relationships = [_parse_relationship(r) for r in (raw.get("relationships") or [])]
    return Entity(
        name=raw["name"],
        display_name=raw["display_name"],
        display_name_plural=raw["display_name_plural"],
        description=raw.get("description") or None,
        ownership=raw.get("ownership", "user"),
        columns=columns,
        relationships=relationships,
    )


def _parse_column(raw: dict) -> Column:
    return Column(
        name=raw["name"],
        type=raw["type"],
        display_name=raw["display_name"],
        required=raw.get("required", False),
        primary_name=raw.get("primary_name", False),
        max_length=raw.get("max_length"),
        option_set=raw.get("option_set"),
        related_table=raw.get("related_table"),
    )


def _parse_relationship(raw: dict) -> Relationship:
    return Relationship(
        related_table=raw["related_table"],
        lookup_column=raw["lookup_column"],
    )
