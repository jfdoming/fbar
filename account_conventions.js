export const inferCurrencyFromAccount = (account) => {
  const currencyMatch = account.name.match(/\([A-Z]{3,4}\)/g);
  if (!currencyMatch) {
    return null;
  }
  return currencyMatch[0].slice(1, -1);
};

const currencyRegexpCache = {};

export const extractCurrencyFromNotes = (currency, transaction) => {
  if (currencyRegexpCache[currency] === undefined) {
    currencyRegexpCache[currency] = new RegExp(`${currency}\\s+[0-9.,-]+`);
  }
  if (!transaction.notes) {
    console.warn(
      `Non-base-currency transaction missing denomination in notes field: ${JSON.stringify(
        transaction
      )}`
    );
    return transaction.amount;
  }
  const currencyValue = transaction.notes
    .match(currencyRegexpCache[currency])[0]
    .split(/\s+/g)[1];
  return Number(currencyValue);
};
