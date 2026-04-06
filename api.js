import fs from "node:fs/promises";

import api from "@actual-app/api";

export const setup = async () => {
  const passwordOrSessionToken = process.env.ACTUAL_SERVER_PASSWORD
    ? {
        password: process.env.ACTUAL_SERVER_PASSWORD,
      }
    : {
        sessionToken: process.env.ACTUAL_SERVER_SESSION_TOKEN,
      };

  await api.init({
    dataDir: "data/",
    serverURL: process.env.ACTUAL_SERVER,
    ...passwordOrSessionToken,
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
