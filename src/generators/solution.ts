import { f, prefixed } from "../utils.js";
import type { Config } from "../model.js";

function componentPaths(config: Config, componentFiles: string[]): string[] {
  const prefix = config.solution.publisher.prefix;
  const paths: string[] = [];

  for (const entity of config.entities) {
    const full = prefixed(entity.name, prefix);
    const entityBase = `/entities/${full}`;

    paths.push(entityBase);

    // attributes — sorted alphabetically
    const attrPaths = componentFiles
      .filter((p) => p.startsWith(`entities/${full}/attributes/`))
      .map((p) => `/${p}`)
      .sort();
    paths.push(...attrPaths);

    // forms — card, main, quick order
    for (const formType of ["card", "main", "quick"] as const) {
      const formPaths = componentFiles
        .filter((p) => p.startsWith(`entities/${full}/formxml/${formType}/`))
        .map((p) => `/${p.slice(0, p.length - "/systemform.yml".length)}`)
        .sort();
      paths.push(...formPaths);
    }

    // ribbondiffs (directory, not file)
    paths.push(`${entityBase}/ribbondiffs`);

    // saved queries
    const sqPaths = componentFiles
      .filter((p) => p.startsWith(`entities/${full}/savedqueries/`))
      .map((p) => `/${p.slice(0, p.length - "/savedquery.yml".length)}`)
      .sort();
    paths.push(...sqPaths);
  }

  // entity relationships — sorted alphabetically
  const relPaths = componentFiles
    .filter((p) => p.startsWith("entityrelationships/"))
    .map((p) => `/${p.slice(0, p.length - "/entityrelationship.yml".length)}`)
    .sort();
  paths.push(...relPaths);

  // option sets
  for (const os of config.option_sets) {
    paths.push(`/optionsets/${prefixed(os.name, prefix)}`);
  }

  // publisher
  paths.push(`/publishers/${config.solution.publisher.name}`);

  return paths;
}

export function generate(
  config: Config,
  managed: boolean,
  componentFiles: string[]
): Record<string, unknown> {
  const sol = config.solution;
  const name = sol.name;
  const base = `solutions/${name}`;

  const solutionData = {
    ImportExportXml: {
      "@version": "9.2.26035.182",
      "@SolutionPackageVersion": f(9.2),
      "@languagecode": 1033,
      "@generatedBy": "CrmLive",
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      SolutionManifest: {
        UniqueName: name,
        LocalizedNames: {
          LocalizedName: {
            "@description": sol.display_name,
            "@languagecode": 1033,
          },
        },
        Descriptions: null,
        Version: sol.version,
        Managed: managed ? 1 : 0,
        Publisher: {
          UniqueName: sol.publisher.name,
        },
      },
    },
  };

  const paths = componentPaths(config, componentFiles);
  const componentsData = {
    SolutionComponents: {
      Component: paths.map((p) => ({ "@path": p })),
    },
  };

  const prefix = sol.publisher.prefix;
  const rootComponents: Record<string, unknown>[] = [];
  for (const entity of config.entities) {
    rootComponents.push({
      "@type": 1,
      "@schemaName": prefixed(entity.name, prefix),
      "@behavior": 0,
    });
  }
  for (const os of config.option_sets) {
    rootComponents.push({
      "@type": 9,
      "@schemaName": prefixed(os.name, prefix),
      "@behavior": 0,
    });
  }

  const rootData = { RootComponents: { RootComponent: rootComponents } };
  const missingData = { MissingDependencies: null };

  return {
    [`${base}/solution.yml`]: solutionData,
    [`${base}/solutioncomponents.yml`]: componentsData,
    [`${base}/rootcomponents.yml`]: rootData,
    [`${base}/missingdependencies.yml`]: missingData,
  };
}
