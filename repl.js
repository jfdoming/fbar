import repl from "node:repl";

import api, { q, runQuery } from "@actual-app/api";

import { setup, teardown } from "./api.js";
import main from "./main.js";
import options from "./args.js";

await setup();
const started = repl.start();
started.context.api = api;
started.context.q = q;
started.context.execQuery = runQuery;
started.context.runQuery = async (query) => (await runQuery(query)).data;
started.context.rq = started.context.runQuery;
started.context.pull = (props = {}) =>
  main({ budgetYear: options["budget-year"].promptDefault, ...props });
started.on("exit", teardown);
