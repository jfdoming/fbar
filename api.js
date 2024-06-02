import fs from "node:fs/promises";

import api from "@actual-app/api";

export const setup = async () => {
  await api.init({
    dataDir: "data/",
    serverURL: process.env.ACTUAL_SERVER,
    password: process.env.ACTUAL_SERVER_PASSWORD,
  });

  try {
    await fs.mkdir("data/");
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e;
    }
  }

  // This is the ID from Settings → Show advanced settings → Sync ID
  await api.downloadBudget(process.env.ACTUAL_SYNC_ID, {
    password: process.env.ACTUAL_BUDGET_PASSWORD,
  });
};

export const teardown = api.shutdown;

export const runCallback = async (callback) => {
  try {
    await setup();
    await callback();
  } catch (e) {
    console.error(e);
  } finally {
    await teardown();
  }
};
