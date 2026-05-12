import type { Entity } from "../model.js";
import { prefixed } from "../utils.js";

export function generate(entity: Entity, prefix: string): Record<string, unknown> {
  const full = prefixed(entity.name, prefix);
  const data = {
    RibbonDiffXml: {
      CustomActions: null,
      Templates: {
        RibbonTemplates: { "@Id": "Mscrm.Templates" },
      },
      CommandDefinitions: null,
      RuleDefinitions: {
        TabDisplayRules: null,
        DisplayRules: null,
        EnableRules: null,
      },
      LocLabels: null,
    },
  };
  return { [`entities/${full}/ribbondiffs/ribbondiff.yml`]: data };
}
