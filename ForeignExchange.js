import fs from "fs/promises";

class AbstractForeignExchangeLoader {
  async getUSDExchangeRate(country, currency) {
    throw new TypeError("Not yet implemented");
  }
}

export class RemoteForeignExchangeLoader extends AbstractForeignExchangeLoader {
  #exchangeRates = {};
  #date;

  constructor(date) {
    super();
    this.#date = date.toISOString().split("T")[0];
  }

  // Use codes from https://web.archive.org/web/20231117184242/https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange
  async getUSDExchangeRate(country, currency) {
    const symbol = `${country}-${currency}`;
    if (this.#exchangeRates[symbol] === undefined) {
      const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?fields=exchange_rate&filter=country_currency_desc:eq:${symbol},record_date:eq:${
        this.#date
      }`;
      const response = await fetch(url);
      const { data: responseData } = await response.json();
      if (responseData.length === 0) {
        throw new Error(
          `No exchange rate available for ${symbol} on date ${
            this.#date
          }. Ensure the date is in the past and aligns with the end of a quarter`
        );
      }
      this.#exchangeRates[symbol] = 1 / Number(responseData[0].exchange_rate);
    }
    return this.#exchangeRates[symbol];
  }
}

export class LocalForeignExchangeLoader extends AbstractForeignExchangeLoader {
  #exchangeRates = {};
  #filePath;

  constructor(filePath) {
    super();
    this.#filePath = filePath;
  }

  async getUSDExchangeRate(country, currency) {
    const symbol = `${country}-${currency}`;
    if (this.#exchangeRates[symbol] === undefined) {
      const fileHandle = await fs.open(this.#filePath);
      try {
        let header = null;
        const exchangeRates = {};
        for await (const line of fileHandle.readLines()) {
          if (header) {
            const rawValues = line.split(",").map((s) => s.trim());
            if (
              header["currency2"] !== undefined &&
              rawValues[header["currency2"]] != "United States-Dollar"
            ) {
              throw new TypeError(
                "Conversions to currencies other than USD are not currently supported"
              );
            }
            exchangeRates[rawValues[header["currency1"]]] = Number(
              rawValues[header["rate"]]
            );
          } else {
            const rawHeader = line
              .split(",")
              .map((s) => s.trim())
              .map((s) => (s == "currency" ? "currency1" : s));
            if (!rawHeader.includes("currency1")) {
              throw new TypeError("A currency field is required");
            }
            if (!rawHeader.includes("rate")) {
              throw new TypeError("A rate field is required");
            }
            header = Object.fromEntries(rawHeader.map((name, i) => [name, i]));
          }
        }

        this.#exchangeRates = exchangeRates;
        if (this.#exchangeRates[symbol] === undefined) {
          throw new TypeError(
            `No exchange rate data available for symbol ${symbol}`
          );
        }
      } finally {
        fileHandle.close();
      }
    }

    return this.#exchangeRates[symbol];
  }
}

class ForeignExchange {
  #loader;
  #formatters = {};

  constructor(loader) {
    this.#loader = loader;
  }

  async getUSDExchangeRate(country, currency) {
    return this.#loader.getUSDExchangeRate(country, currency);
  }

  formatCurrency(value, code, maxDigits = undefined) {
    const symbol = `${code}-${maxDigits}`;
    if (this.#formatters[symbol] === undefined) {
      this.#formatters[symbol] = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        currencyDisplay: "code",
        maximumFractionDigits: maxDigits,
        useGrouping: false, // FBAR form doesn't support non-numeric inputs
      });
    }

    return this.#formatters[symbol].format(value);
  }
}

export default ForeignExchange;
