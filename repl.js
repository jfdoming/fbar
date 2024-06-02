import repl from "node:repl";

import api, { q, runQuery } from "@actual-app/api";

import { setup, teardown } from "./api.js";

await setup();
const started = repl.start();
started.context.api = api;
started.context.q = q;
started.context.runQuery = runQuery;
started.on("exit", teardown);
