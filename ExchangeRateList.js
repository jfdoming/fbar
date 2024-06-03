class ExchangeRateList {
  #exchangeRates = {};
  #date;

  constructor(date) {
    this.#date = date.toISOString().split("T")[0];
  }

  // Use codes from https://web.archive.org/web/20231117184242/https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange
  async get(country, currency) {
    const symbol = `${country}-${currency}`;
    if (this.#exchangeRates[symbol] === undefined) {
      const response = await fetch(
        `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?fields=exchange_rate&filter=country_currency_desc:eq:${symbol},record_date:eq:${
          this.#date
        }`
      );
      const {
        data: [{ exchange_rate: rate }],
      } = await response.json();
      this.#exchangeRates[symbol] = 1 / Number(rate);
    }
    return this.#exchangeRates[symbol];
  }
}

export default ExchangeRateList;
