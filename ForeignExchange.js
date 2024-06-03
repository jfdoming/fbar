class ForeignExchange {
  #exchangeRates = {};
  #formatters = {};
  #date;

  constructor(date) {
    this.#date = date.toISOString().split("T")[0];
  }

  // Use codes from https://web.archive.org/web/20231117184242/https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange
  async getUSDExchangeRate(country, currency) {
    const symbol = `${country}-${currency}`;
    if (this.#exchangeRates[symbol] === undefined) {
      const response = await fetch(
        `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?fields=exchange_rate&filter=country_currency_desc:eq:${symbol},record_date:eq:${
          this.#date
        }`
      );
      const { data: responseData } = await response.json();
      if (responseData.length === 0) {
        throw new Error(
          `No exchange rate available for date ${
            this.#date
          }. Ensure the date is in the past and aligns with the end of a quarter`
        );
      }
      this.#exchangeRates[symbol] = 1 / Number(responseData[0].exchange_rate);
    }
    return this.#exchangeRates[symbol];
  }

  formatCurrency(value, code, maxDigits = undefined) {
    const symbol = `${code}-${maxDigits}`;
    if (this.#formatters[symbol] === undefined) {
      this.#formatters[symbol] = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        currencyDisplay: "code",
        maximumFractionDigits: maxDigits,
      });
    }

    return this.#formatters[symbol].format(value);
  }
}

export default ForeignExchange;
