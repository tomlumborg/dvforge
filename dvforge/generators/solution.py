from __future__ import annotations

from dvforge.model import Config
from dvforge.utils import prefixed


def _component_paths(config: Config, component_files: list[str]) -> list[str]:
    """Build the ordered list of solution component paths from generated file paths."""
    prefix = config.solution.publisher.prefix
    paths: list[str] = []

    for entity in config.entities:
        full = prefixed(entity.name, prefix)
        entity_base = f"/entities/{full}"

        paths.append(entity_base)

        # attributes — sorted alphabetically to match Dataverse export order
        attr_paths = sorted(
            f"/{p}" for p in component_files
            if p.startswith(f"entities/{full}/attributes/")
        )
        paths.extend(attr_paths)

        # forms
        for form_type in ('card', 'main', 'quick'):
            form_paths = sorted(
                f"/{p[:-len('/systemform.yml')]}" for p in component_files
                if p.startswith(f"entities/{full}/formxml/{form_type}/")
            )
            paths.extend(form_paths)

        # ribbondiffs (directory, not file)
        paths.append(f"{entity_base}/ribbondiffs")

        # saved queries
        sq_paths = sorted(
            f"/{p[:-len('/savedquery.yml')]}" for p in component_files
            if p.startswith(f"entities/{full}/savedqueries/")
        )
        paths.extend(sq_paths)

    # entity relationships — sorted alphabetically
    rel_paths = sorted(
        f"/{p[:-len('/entityrelationship.yml')]}" for p in component_files
        if p.startswith("entityrelationships/")
    )
    paths.extend(rel_paths)

    # option sets
    for os in config.option_sets:
        paths.append(f"/optionsets/{prefixed(os.name, prefix)}")

    # publisher
    paths.append(f"/publishers/{config.solution.publisher.name}")

    return paths


def generate(config: Config, managed: bool, component_files: list[str]) -> dict[str, dict]:
    sol = config.solution
    name = sol.name
    base = f"solutions/{name}"

    solution_data = {
        'ImportExportXml': {
            '@version': '9.2.26035.182',
            '@SolutionPackageVersion': 9.2,
            '@languagecode': 1033,
            '@generatedBy': 'CrmLive',
            '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'SolutionManifest': {
                'UniqueName': name,
                'LocalizedNames': {
                    'LocalizedName': {
                        '@description': sol.display_name,
                        '@languagecode': 1033,
                    }
                },
                'Descriptions': None,
                'Version': sol.version,
                'Managed': 1 if managed else 0,
                'Publisher': {
                    'UniqueName': sol.publisher.name,
                },
            },
        }
    }

    component_paths = _component_paths(config, component_files)
    components_data = {
        'SolutionComponents': {
            'Component': [{'@path': p} for p in component_paths],
        }
    }

    prefix = sol.publisher.prefix
    root_components: list[dict] = []
    for entity in config.entities:
        root_components.append({
            '@type': 1,
            '@schemaName': prefixed(entity.name, prefix),
            '@behavior': 0,
        })
    for os in config.option_sets:
        root_components.append({
            '@type': 9,
            '@schemaName': prefixed(os.name, prefix),
            '@behavior': 0,
        })

    root_data = {'RootComponents': {'RootComponent': root_components}}
    missing_data = {'MissingDependencies': None}

    return {
        f"{base}/solution.yml": solution_data,
        f"{base}/solutioncomponents.yml": components_data,
        f"{base}/rootcomponents.yml": root_data,
        f"{base}/missingdependencies.yml": missing_data,
    }
