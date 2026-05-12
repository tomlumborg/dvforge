from __future__ import annotations

import contextlib
import tempfile
from pathlib import Path
from typing import Any

import click
from ruamel.yaml import YAML

_yaml = YAML()


def _load(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as fh:
        return _yaml.load(fh)


def _diff(a: Any, b: Any, path: str, ignore: set[str]) -> list[tuple[str, Any, Any]]:
    results: list[tuple[str, Any, Any]] = []

    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a.keys()) | set(b.keys())):
            if k in ignore:
                continue
            kp = f"{path}.{k}" if path else str(k)
            if k not in a:
                results.append((kp, "<missing>", b[k]))
            elif k not in b:
                results.append((kp, a[k], "<missing>"))
            else:
                results.extend(_diff(a[k], b[k], kp, ignore))

    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            results.append((path, f"<list len={len(a)}>", f"<list len={len(b)}>"))
        else:
            for i, (ai, bi) in enumerate(zip(a, b)):
                results.extend(_diff(ai, bi, f"{path}[{i}]", ignore))

    else:
        if a != b:
            results.append((path, a, b))

    return results


def run(
    input_dir: Path,
    actual: Path,
    out_dir: Path | None,
    sol_version: str | None,
    unmanaged: bool,
    skip_build: bool,
    ignore: set[str],
) -> bool:
    """Build (unless skip_build) and compare against actual. Returns True if everything matches."""
    from dvforge.loader import load
    from dvforge.compiler import compile as compile_solution

    ctx = (
        contextlib.nullcontext(str(out_dir))
        if out_dir
        else tempfile.TemporaryDirectory(prefix="dvforge_test_")
    )
    ok = False
    with ctx as tmp:
        out_path = Path(tmp)

        if not skip_build:
            config = load(input_dir)
            if sol_version:
                config.solution.version = sol_version
            click.echo(f"Building: {config.solution.name} v{config.solution.version}")
            compile_solution(config, out_path, managed=not unmanaged)
            click.echo()

        if not out_path.exists():
            click.secho(f"Output directory not found: {out_path}", fg="red")
            return False

        forge_files = {p.relative_to(out_path) for p in out_path.rglob("*.yml")}
        actual_files = {p.relative_to(actual) for p in actual.rglob("*.yml")}

        only_forge = sorted(forge_files - actual_files)
        only_actual = sorted(actual_files - forge_files)
        shared = sorted(forge_files & actual_files)

        matched = 0
        diffed_files: list[tuple[Path, list]] = []

        for rel in shared:
            diffs = _diff(_load(out_path / rel), _load(actual / rel), path="", ignore=ignore)
            if diffs:
                diffed_files.append((rel, diffs))
            else:
                matched += 1

        for rel, diffs in diffed_files:
            click.secho(f"\n{'─'*60}", fg="yellow")
            click.secho(f"DIFF  {rel}", fg="yellow", bold=True)
            click.secho(f"{'─'*60}", fg="yellow")
            for path, forge_val, actual_val in diffs:
                click.echo(f"  {path}")
                click.secho(f"    forge:  {forge_val!r}", fg="cyan")
                click.secho(f"    actual: {actual_val!r}", fg="green")

        if only_forge:
            click.secho(f"\n{'─'*60}", fg="magenta")
            click.secho(f"Only in forge output ({len(only_forge)} files):", fg="magenta", bold=True)
            for f in only_forge:
                click.secho(f"  + {f}", fg="magenta")

        if only_actual:
            click.secho(f"\n{'─'*60}", fg="blue")
            click.secho(f"Only in actual output ({len(only_actual)} files):", fg="blue", bold=True)
            for f in only_actual:
                click.secho(f"  - {f}", fg="blue")

        click.echo(f"\n{'═'*60}")
        total = len(shared) + len(only_forge) + len(only_actual)
        ok = not diffed_files and not only_forge and not only_actual
        click.secho(
            f"  Files: {total} total  |  "
            f"{matched} matched  |  "
            f"{len(diffed_files)} with diffs  |  "
            f"{len(only_forge)} only-forge  |  "
            f"{len(only_actual)} only-actual",
            fg="green" if ok else "red",
            bold=True,
        )
        click.echo(f"{'═'*60}")

    return ok
