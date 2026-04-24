from __future__ import annotations

from pathlib import Path

import click

from dvforge.loader import load


@click.command()
@click.option("--input", "input_dir", required=True, type=click.Path(exists=True, file_okay=False, path_type=Path), help="Path to input YAML directory (e.g. ../dataverse/output)")
@click.option("--output", "output_dir", required=True, type=click.Path(file_okay=False, path_type=Path), help="Path to write compiled solution files")
@click.option("--version", default=None, help="Override solution version (e.g. 1.2.0.0)")
@click.option("--unmanaged", is_flag=True, default=False, help="Generate an unmanaged solution (default: managed)")
@click.option("--dry-run", is_flag=True, default=False, help="Print output paths without writing files")
def main(input_dir: Path, output_dir: Path, version: str | None, unmanaged: bool, dry_run: bool) -> None:
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

    from dvforge.compiler import compile as compile_solution
    compile_solution(config, output_dir, managed=managed)
    click.echo("\nDone.")


if __name__ == "__main__":
    main()
