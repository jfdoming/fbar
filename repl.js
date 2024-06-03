import repl from "node:repl";

import api, { q, runQuery } from "@actual-app/api";

import { setup, teardown } from "./api.js";
import main from "./main.js";
import options from "./args.js";
import ExchangeRateList from "./ExchangeRateList.js";
import * as utils from "./utils.js";

await setup();
const started = repl.start();
started.context.api = api;
started.context.q = q;
started.context.execQuery = runQuery;
started.context.runQuery = async (query) => (await runQuery(query)).data;
started.context.rq = started.context.runQuery;
started.context.pull = (props = {}) =>
  main({ budgetYear: options["budget-year"].promptDefault, ...props });
started.context.rates = new ExchangeRateList(
  utils.endOfYear(utils.previousYear())
);
Object.keys(utils).forEach((util) => {
  started.context[util] = utils[util];
});
started.on("exit", teardown);
