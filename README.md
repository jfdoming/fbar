# FBAR Account Analysis

Automatically generate information required for the [FBAR](https://www.fincen.gov/report-foreign-bank-and-financial-accounts) form based on an [Actual Budget](https://actualbudget.org) instance.

## Features

- Extracts maximum account balances from Actual Budget for a given year
- Converts foreign currency balances to USD using official Treasury exchange rates

## Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:jfdoming/fbar.git
   cd fbar
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp example.env .env
   ```

   Edit `.env` and populate with your Actual Budget server details:
   - `ACTUAL_SERVER`: Actual Budget server URL
   - `ACTUAL_SERVER_PASSWORD`: Server password
   - `ACTUAL_SYNC_ID`: Budget sync ID (Settings > Advanced > Sync ID)
   - `ACTUAL_BUDGET_PASSWORD`: Budget password (if encrypted)

4. **Configure account metadata**
   ```bash
   cp account_metadata.template.js account_metadata.js
   ```

   Fill in each section of `account_metadata.js` to:
   - Map your budget accounts to their real-world counterparts
   - Specify account types (Bank, Securities, Other)
   - Define currencies and exchange rate details
   - Set institution information

## Usage

### Basic Usage

```bash
yarn pull
```

### Additional options

- **Simple mode** (default): Returns maximum balances only (in USD)
- **Full mode**: Includes exchange rates and additional metadata from `account_metadata.js`

```bash
yarn pull --budget-year 2024 --report-mode full
```

### REPL

Access a REPL to interrogate your data interactively:

```bash
yarn repl
```
