import type { Entity } from "../model.js";
import { prefixed } from "../utils.js";

function _data(): Record<string, unknown> {
  return {
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
}

export function generate(entity: Entity, prefix: string): Record<string, unknown> {
  const full = prefixed(entity.name, prefix);
  return { [`entities/${full}/ribbondiffs/ribbondiff.yml`]: _data() };
}

export function generateSystemTable(entity: Entity): Record<string, unknown> {
  return { [`entities/${entity.name}/ribbondiffs/ribbondiff.yml`]: _data() };
}
