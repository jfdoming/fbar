export default {
  "budget-year": {
    type: "string",
    prompt: "Specify a budget year to query",
    promptDefault: String(new Date().getFullYear()),
  },
  "force-recreate": {
    type: "boolean",
    default: false,
  },
  "load-budget": {
    type: "string",
    default: "",
  },
  "load-fx": {
    type: "string",
    default: "",
  },
  "report-mode": {
    type: "string",
    values: ["simple", "short", "full"],
    default: "simple",
  },
};
