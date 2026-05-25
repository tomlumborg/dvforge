import { floatScalar, prefixed } from "../utils.js";
import type { Config } from "../model.js";

function componentPaths(config: Config, componentFiles: string[]): string[] {
  const prefix = config.solution.publisher.prefix;
  const paths: string[] = [];

  const sortedEntities = [...config.entities].sort((a, b) => {
    const nameA = a.existing_table === true ? a.name : prefixed(a.name, prefix);
    const nameB = b.existing_table === true ? b.name : prefixed(b.name, prefix);
    return nameA.localeCompare(nameB);
  });

  for (const entity of sortedEntities) {
    if (entity.existing_table === true) {
      const entityBase = `/entities/${entity.name}`;
      paths.push(entityBase);
      paths.push(`${entityBase}/ribbondiffs`);
      continue;
    }

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

  // option sets — sorted alphabetically
  const sortedOptionSets = [...config.option_sets].sort((a, b) =>
    prefixed(a.name, prefix).localeCompare(prefixed(b.name, prefix))
  );
  for (const os of sortedOptionSets) {
    paths.push(`/optionsets/${prefixed(os.name, prefix)}`);
  }

  // publisher
  paths.push(`/publishers/${config.solution.publisher.name}`);

  return paths.map((p) => p.toLowerCase());
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
      "@SolutionPackageVersion": floatScalar(9.2),
      "@languagecode": config.solution.language_code,
      "@generatedBy": "CrmLive",
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      SolutionManifest: {
        UniqueName: name,
        LocalizedNames: {
          LocalizedName: {
            "@description": sol.display_name,
            "@languagecode": config.solution.language_code,
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
  const entityBehavior = new Map(
    config.entities.map((e) => [
      (e.existing_table === true ? e.name : prefixed(e.name, prefix)).toLowerCase(),
      e.existing_table === true ? 2 : 0,
    ])
  );
  const rootComponents = paths
    .filter((p) => {
      const parts = p.split("/").filter(Boolean);
      return parts.length === 2 && (parts[0] === "entities" || parts[0] === "optionsets");
    })
    .map((p) => {
      const [section, schemaName] = p.split("/").filter(Boolean);
      return section === "entities"
        ? { "@type": 1, "@schemaName": schemaName, "@behavior": entityBehavior.get(schemaName) ?? 0 }
        : { "@type": 9, "@schemaName": schemaName, "@behavior": 0 };
    })
    .sort((a, b) => {
      const typeDiff = a["@type"] - b["@type"];
      if (typeDiff !== 0) return typeDiff;
      return a["@schemaName"].localeCompare(b["@schemaName"]);
    });

  const rootData = { RootComponents: { RootComponent: rootComponents } };
  const missingData = { MissingDependencies: null };

  return {
    [`${base}/solution.yml`]: solutionData,
    [`${base}/solutioncomponents.yml`]: componentsData,
    [`${base}/rootcomponents.yml`]: rootData,
    [`${base}/missingdependencies.yml`]: missingData,
  };
}
