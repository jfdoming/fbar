export default {
  // Enumerate all accounts in your budget and all accounts you want to report each year.
  accounts: {
    "My account #1": {
      type: "Bank", // Bank, Securities, or Other
      institution: "ABC",
      currency: "CAD",
    },

    // Credit cards likely do not need to be reported.
    // See https://web.archive.org/web/20240603031933/https://www.irs.gov/pub/irs-wd/0603026.pdf
    "My credit card": {
      include: false, // Do not report this account.
    },

    // Accounts with entities based in the US likely do not need to be reported.
    // See https://web.archive.org/web/20240603032344/https://www.myexpattaxes.com/expat-tax-tips/foreign-bank-account/should-i-report-my-wise-account-on-my-fbar/#:~:text=At%20the%20end%2C%20we%20recommend%20that%20if%20you%20have%20a%20US%20bank%20account%20through%20Wise%2C%20this%20can%20be%20safely%20left%20off%20your%20FBAR%2C%20as%20it%20should%20be%20set%20up%20through%20the%20US%20entity%20of%20Wise.%20However%2C%20all%20other%20non%2DUS%20accounts%20set%20up%20through%20Wise%20should%20be%20included%20on%20your%20FBAR.
    "My US bank account": {
      include: false,
    },
    // Wise USD accounts should be with their US entity.
    "My Wise USD account": {
      include: false,
    },

    // List any other accounts you'd want to report each year.
    "My non-budget account": {
      include: false,
      report: true, // Warn about needing to manually report this account.
    },
  },

  // Provide more details on all currencies used above.
  currencies: {
    // See https://fiscaldata.treasury.gov/currency-exchange-rates-converter/ for hints
    CAD: {
      country: "Canada",
      currencyName: "Dollar",
    },
    EUR: {
      country: "Euro Zone",
      currencyName: "Euro",
    },
  },

  institutions: {
    ABC: {
      legalName: "ABC Bank",
      address: {
        street: "",
        city: "",
        province: "",
        country: "",
        postalCode: "",
      },
    },
  },
};
