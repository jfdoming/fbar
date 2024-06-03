import { q, runQuery } from "@actual-app/api";

import ForeignExchange from "./ForeignExchange.js";
import { inOrder, endOfYear } from "./utils.js";

const maxBy = (rows, field) => {
  let maxRow = null;
  let maxValue = -Infinity;
  rows.forEach((row, idx) => {
    const value = row[field];
    if (value > maxValue) {
      maxRow = row;
      maxValue = value;
    }
  });
  return maxRow;
};

const getMaximumBalance = (budgetYear) => async (account) => {
  const { id, name } = account;
  const { data: runningBalances } = await runQuery(
    q("transactions")
      .options({ splits: "none" })
      .filter({ account: account.id })
      .orderBy({ date: "desc" })
      .select([
        "account.name",
        "date",
        { runningBalance: { $sumOver: "$amount" } },
      ])
  );
  const runningBalancesInYear = runningBalances.filter(
    (row) => String(new Date(row.date).getFullYear()) === budgetYear
  );

  const maxBalanceRow = maxBy(runningBalancesInYear, "runningBalance");
  if (maxBalanceRow !== null) {
    return maxBalanceRow;
  }

  return runningBalances[runningBalances.length - 1];
};

const getMetadata = async () => {
  try {
    return (await import("./account_metadata.js")).default;
  } catch (e) {
    if (e.code === "ERR_MODULE_NOT_FOUND") {
      console.error(
        "account_metadata.js not found. All calculations will use defaults (and no exchange rates), populate the file if this is incorrect"
      );
      return null;
    }
    throw e;
  }
};

const main = async ({ budgetYear, reportMode } = {}) => {
  if (!budgetYear) {
    throw new Error("budgetYear is required");
  }

  const metadata = await getMetadata();
  const { accounts: accountMetadata, currencyAliases: currencyMetadata } =
    metadata ?? {};

  // See https://github.com/actualbudget/actual/blob/master/packages/loot-core/src/server/aql/schema/index.ts
  const { data: accounts } = await runQuery(q("accounts").select("name"));

  if (metadata !== null) {
    accounts.forEach((account) => {
      if (typeof accountMetadata[account.name] !== "object") {
        throw new Error(
          `Account "${account.name}" is missing from account_metadata.js`
        );
      }
    });

    const accountsByName = accounts.reduce(
      (map, account) => ({ ...map, [account.name]: account }),
      {}
    );
    Object.entries(accountMetadata).forEach(([name, account]) => {
      if (
        !(account.report === true && account.include === false) &&
        typeof accountsByName[name] !== "object"
      ) {
        throw new Error(
          `Account "${name}" is present in account_metadata.js but not found in budget`
        );
      }
    });
  }

  const filteredAccounts =
    metadata === null
      ? accounts
      : accounts.filter(
          (account) => accountMetadata[account.name].include !== false
        );
  const accountMaxes = await inOrder(
    filteredAccounts.map(getMaximumBalance(budgetYear))
  );
  const fx = new ForeignExchange(endOfYear(new Date(budgetYear, 0)));

  // See https://web.archive.org/web/20240603020448/https://www.fincen.gov/reporting-maximum-account-value for details on rounding/FX.
  const results = await inOrder(
    accountMaxes.map(async (row) => {
      const accountName = row["account.name"];
      const balance = row["runningBalance"] / 100;
      const date = row["date"];

      if (metadata === null) {
        return { accountName, originalBalance: balance, date, type: "Bank" };
      }

      const account = accountMetadata[row["account.name"]];
      const accountCurrency = account["currency"];
      const currencyDetails =
        typeof accountCurrency === "string"
          ? currencyMetadata[accountCurrency]
          : accountCurrency;
      if (typeof currencyDetails !== "object") {
        throw new Error(`Currency ${accountCurrency} is not valid`);
      }

      const fullExchangeRate = await fx.getUSDExchangeRate(
        currencyDetails["country"],
        currencyDetails["currencyName"]
      );

      const usdBalance = fx.formatCurrency(balance * fullExchangeRate, "USD");
      const roundedUsdBalance = fx.formatCurrency(
        Math.ceil(balance * fullExchangeRate),
        "USD",
        0
      );
      const originalBalance = fx.formatCurrency(
        balance,
        currencyDetails["code"]
      );
      const exchangeRate = fullExchangeRate.toFixed(4);
      const type = account["type"] ?? "Bank";
      const typeDetails = account["typeDetails"];
      if (type === "Other" && !typeDetails) {
        throw new Error(
          `typeDetails field is required for accounts of type Other`
        );
      }

      if (reportMode === "full") {
        return {
          accountName,
          usdBalance,
          roundedUsdBalance,
          originalBalance,
          exchangeRate,
          date,
          type,
          ...(type === "Other" ? { typeDetails } : {}),
        };
      }

      return {
        accountName,
        usdBalance: roundedUsdBalance,
        type,
        ...(type === "Other" ? { typeDetails } : {}),
      };
    })
  );

  const resultMap = results.reduce(
    (map, { accountName, ...result }) => ({
      ...map,
      [accountName]: reportMode === "simple" ? result.usdBalance : result,
    }),
    {}
  );
  console.log(resultMap);

  if (metadata !== null) {
    const reportAccounts = Object.entries(accountMetadata)
      .filter(([, account]) => account.report === true)
      .map(([name]) => name);
    console.error(
      `Please ensure you also report the following accounts: ${reportAccounts.join(
        ","
      )}`
    );
  }
};

export default main;
