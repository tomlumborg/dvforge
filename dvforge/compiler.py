from __future__ import annotations

import shutil
from pathlib import Path

from dvforge.generators import (
    attribute,
    entity,
    formxml,
    optionset,
    publisher,
    relationship,
    ribbondiff,
    savedquery,
    solution,
)
from dvforge.model import Config
from dvforge.utils import write_yaml


def compile(config: Config, output_dir: Path, managed: bool = True) -> None:
    prefix = config.solution.publisher.prefix
    files: dict[str, dict] = {}

    # Publisher
    files.update(publisher.generate(config.solution.publisher))

    # Option sets
    for os in config.option_sets:
        files.update(optionset.generate(os, prefix))

    # Per-entity generators
    for ent in config.entities:
        files.update(entity.generate(ent, prefix))
        files.update(attribute.generate(ent, prefix))
        files.update(formxml.generate(ent, prefix))
        files.update(savedquery.generate(ent, prefix))
        files.update(ribbondiff.generate(ent, prefix))
        files.update(relationship.generate(ent, prefix))

    # Solution files last — needs all component paths
    files.update(solution.generate(config, managed, list(files.keys())))

    # Clean output directory then write all files
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)

    for rel_path, data in files.items():
        write_yaml(output_dir / rel_path, data)
