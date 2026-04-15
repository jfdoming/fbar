import fs from "node:fs/promises";

import api from "@actual-app/api";

export const setup = async ({ loadBudget = "" } = {}) => {
  const passwordOrSessionToken = process.env.ACTUAL_SERVER_PASSWORD
    ? {
        password: process.env.ACTUAL_SERVER_PASSWORD,
      }
    : {
        sessionToken: process.env.ACTUAL_SERVER_SESSION_TOKEN,
      };
  const serverDetails = loadBudget
    ? {}
    : {
        serverURL: process.env.ACTUAL_SERVER,
        ...passwordOrSessionToken,
      };

  await api.init({
    dataDir: "data/",
    ...serverDetails,
  });

  try {
    await fs.mkdir("data/");
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e;
    }
  }

  if (loadBudget) {
    // loadBudget is the budget ID from the data/ directory
    await api.loadBudget(loadBudget, {
      password: process.env.ACTUAL_BUDGET_PASSWORD,
    });
  } else {
    // ACTUAL_SYNC_ID is the ID from Settings → Show advanced settings → Sync ID
    await api.downloadBudget(process.env.ACTUAL_SYNC_ID, {
      password: process.env.ACTUAL_BUDGET_PASSWORD,
    });
  }
};

export const teardown = api.shutdown;

export const runCallback = async (callback, options = {}) => {
  try {
    await setup(options);
    await callback();
  } catch (e) {
    console.error(e);
  } finally {
    await teardown();
  }
};
