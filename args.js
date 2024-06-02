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
};
