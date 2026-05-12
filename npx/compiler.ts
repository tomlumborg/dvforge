import fs from "fs";
import path from "path";
import { Config } from "./model.js";
import { writeYaml } from "./utils.js";
import * as publisher from "./generators/publisher.js";
import * as optionset from "./generators/optionset.js";
import * as entity from "./generators/entity.js";
import * as attribute from "./generators/attribute.js";
import * as formxml from "./generators/formxml.js";
import * as savedquery from "./generators/savedquery.js";
import * as ribbondiff from "./generators/ribbondiff.js";
import * as relationship from "./generators/relationship.js";
import * as solution from "./generators/solution.js";

export function compile(config: Config, outputDir: string, managed = true): void {
  const publisherPrefix = config.solution.publisher.prefix;
  const files = new Map<string, unknown>();

  // publisher
  for (const [k, v] of Object.entries(publisher.generate(config.solution.publisher)))
    files.set(k, v);

  // option sets
  for (const os of config.option_sets)
    for (const [k, v] of Object.entries(optionset.generate(os, publisherPrefix)))
      files.set(k, v);

  // entity
  for (const ent of config.entities) {
    for (const gen of [entity, attribute, formxml, savedquery, ribbondiff, relationship])
      for (const [k, v] of Object.entries(gen.generate(ent, publisherPrefix)))
        files.set(k, v);
  }

  // solution
  for (const [k, v] of Object.entries(solution.generate(config, managed, [...files.keys()])))
    files.set(k, v);

  // clean output dir, write all files
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  for (const [relPath, data] of files)
    writeYaml(path.join(outputDir, relPath), data);
}
