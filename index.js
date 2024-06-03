import { parseArgs } from "node:util";
import fs from "node:fs/promises";

import { ask, inOrder } from "./utils.js";
import options from "./args.js";
import { runCallback } from "./api.js";

import main from "./main.js";

const { values } = parseArgs({ options });
await inOrder(
  Object.entries(options).map(async ([name, config]) => {
    if (!(name in values) && config.promptDefault) {
      const prompt = config.prompt || `Enter a value for the argument ${name}`;
      values[name] =
        (await ask(`${prompt} [default: ${config.promptDefault}] `)) ||
        config.promptDefault;
    }

    if (config.values && !config.values.includes(values[name])) {
      throw new Error(`Invalid value ${values[name]} for argument --${name}`);
    }

    const camelCaseName = name
      .split("-")
      .map(
        (s, i) =>
          (i === 0 ? s[0] : s[0].toUpperCase()) + s.slice(1).toLowerCase()
      )
      .join("");
    values[camelCaseName] = values[name];
  })
);

if (values.forceRecrease) {
  await fs.rm("data/", { recursive: true, force: true });
}
runCallback(() => main(values));
