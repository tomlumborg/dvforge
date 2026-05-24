import type { OptionSet } from "../model.js";
import { prefixed } from "../utils.js";

export function generate(optionset: OptionSet, prefix: string, langCode: number): Record<string, unknown> {
  const fullName = prefixed(optionset.name, prefix);
  const data = {
    optionset: {
      "@Name": fullName,
      "@localizedName": optionset.display_name,
      OptionSetType: "picklist",
      IsGlobal: 1,
      IntroducedVersion: "1.0.0",
      IsCustomizable: 1,
      ExternalTypeName: "",
      displaynames: {
        displayname: {
          "@description": optionset.display_name,
          "@languagecode": langCode,
        },
      },
      Descriptions: {
        Description: {
          "@description": "",
          "@languagecode": langCode,
        },
      },
      options: {
        option: optionset.options.map((opt) => ({
          "@value": opt.value,
          "@ExternalValue": "",
          "@IsHidden": 0,
          labels: {
            label: {
              "@description": opt.label,
              "@languagecode": langCode,
            },
          },
          Descriptions: {
            Description: {
              "@description": "",
              "@languagecode": langCode,
            },
          },
        })),
      },
    },
  };
  return { [`optionsets/${fullName}/optionset.yml`]: data };
}
