import { q, runQuery } from "@actual-app/api";

import { inOrder } from "./utils.js";

const main = async ({ budgetYear } = {}) => {
  if (!budgetYear) {
    throw new Error("budgetYear is required");
  }

  const { data } = await runQuery(
    q("transactions")
      .filter({ date: { $transform: "$year", $eq: String(budgetYear) } })
      .select("*")
  );
  console.log("data:", data);
};

export default main;
