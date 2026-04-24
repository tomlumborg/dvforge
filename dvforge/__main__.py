from __future__ import annotations

import sys
from pathlib import Path

import click


@click.group()
def main() -> None:
    pass


# ── build ────────────────────────────────────────────────────────────────────

@main.command()
@click.option("--input", "input_dir", required=True, type=click.Path(exists=True, file_okay=False, path_type=Path), help="Path to input YAML directory")
@click.option("--output", "output_dir", required=True, type=click.Path(file_okay=False, path_type=Path), help="Path to write compiled solution files")
@click.option("--version", default=None, help="Override solution version (e.g. 1.2.0.0)")
@click.option("--unmanaged", is_flag=True, default=False, help="Generate an unmanaged solution (default: managed)")
@click.option("--dry-run", is_flag=True, default=False, help="Print output paths without writing files")
def build(input_dir: Path, output_dir: Path, version: str | None, unmanaged: bool, dry_run: bool) -> None:
    from dvforge.loader import load
    from dvforge.compiler import compile as compile_solution

    config = load(input_dir)

    if version:
        config.solution.version = version

    managed = not unmanaged

    click.echo(f"Solution : {config.solution.name} v{config.solution.version} ({'unmanaged' if unmanaged else 'managed'})")
    click.echo(f"Publisher: {config.solution.publisher.name} ({config.solution.publisher.prefix}_)")
    click.echo(f"Entities : {', '.join(e.name for e in config.entities)}")
    click.echo(f"Input    : {input_dir}")
    click.echo(f"Output   : {output_dir}")

    if dry_run:
        click.echo("\n[dry-run] No files written.")
        return

    compile_solution(config, output_dir, managed=managed)
    click.echo("\nDone.")


# ── test ─────────────────────────────────────────────────────────────────────

@main.command()
@click.option("--input", "input_dir", required=True, type=click.Path(exists=True, file_okay=False, path_type=Path), help="dvforge input directory")
@click.option("--actual", required=True, type=click.Path(exists=True, file_okay=False, path_type=Path), help="pac solution unpack directory to compare against")
@click.option("--out", "out_dir", default=None, type=click.Path(file_okay=False, path_type=Path), help="save build output here instead of a temp dir (dir is kept after the run)")
@click.option("--version", "sol_version", default=None, help="Override solution version (e.g. 1.0.0.1)")
@click.option("--unmanaged", is_flag=True, default=False, help="Generate an unmanaged solution (default: managed)")
@click.option("--skip-build", is_flag=True, default=False, help="Skip building; requires --out pointing at existing output")
@click.option("--ignore-key", "ignore_keys", multiple=True, help="YAML key to skip in comparison (repeatable)")
def test(
    input_dir: Path,
    actual: Path,
    out_dir: Path | None,
    sol_version: str | None,
    unmanaged: bool,
    skip_build: bool,
    ignore_keys: tuple[str, ...],
) -> None:
    if skip_build and not out_dir:
        raise click.UsageError("--skip-build requires --out <existing output directory>")

    from dvforge.tester import run

    ok = run(
        input_dir=input_dir,
        actual=actual,
        out_dir=out_dir,
        sol_version=sol_version,
        unmanaged=unmanaged,
        skip_build=skip_build,
        ignore=set(ignore_keys),
    )
    sys.exit(0 if ok else 1)


# ── schema ───────────────────────────────────────────────────────────────────

@main.command()
@click.option("--output", "output_dir", default=".", type=click.Path(file_okay=False, path_type=Path), help="Project root to write schemas into (default: current directory)")
def schema(output_dir: Path) -> None:
    """Generate JSON schemas for dvforge input YAML files and update .vscode/settings.json."""
    from dvforge.schema_gen import generate

    output_dir = output_dir.resolve()
    written = generate(output_dir)
    for path in written:
        click.echo(f"  {path.relative_to(output_dir)}")
    click.echo("\n.vscode/settings.json updated.")


if __name__ == "__main__":
    main()
