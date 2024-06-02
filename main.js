import { q, runQuery } from "@actual-app/api";

const main = async ({ budgetYear }) => {
  const { data } = await runQuery(
    q("transactions")
      .filter({ date: { $transform: "$year", $eq: String(budgetYear) } })
      .select("*")
  );
  console.log("data:", data);
};

export default main;
