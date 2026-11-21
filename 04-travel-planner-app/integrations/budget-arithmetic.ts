/**
 * Budget & Currency Arithmetic Engine
 * Implements exact integer minor-unit calculations for multi-currency travel budgets,
 * avoiding IEEE 754 floating point precision errors.
 */

export interface CurrencyConfig {
  code: string;
  minorUnitDecimals: number; // e.g. 2 for USD, 0 for JPY, 3 for BHD
  symbol: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', minorUnitDecimals: 2, symbol: '$' },
  EUR: { code: 'EUR', minorUnitDecimals: 2, symbol: '€' },
  GBP: { code: 'GBP', minorUnitDecimals: 2, symbol: '£' },
  JPY: { code: 'JPY', minorUnitDecimals: 0, symbol: '¥' },
  CAD: { code: 'CAD', minorUnitDecimals: 2, symbol: 'CA$' },
  AUD: { code: 'AUD', minorUnitDecimals: 2, symbol: 'A$' },
  CHF: { code: 'CHF', minorUnitDecimals: 2, symbol: 'CHF ' },
  SGD: { code: 'SGD', minorUnitDecimals: 2, symbol: 'S$' },
  BHD: { code: 'BHD', minorUnitDecimals: 3, symbol: 'BD ' }
};

export class BudgetArithmetic {
  /**
   * Convert major decimal input (e.g. 10.50) into integer minor units (1050)
   */
  static toMinorUnits(majorAmount: number | string, currency = 'USD'): number {
    const config = CURRENCY_CONFIGS[currency.toUpperCase()] || { minorUnitDecimals: 2 };
    const num = typeof majorAmount === 'string' ? parseFloat(majorAmount) : majorAmount;

    if (isNaN(num)) {
      throw new Error(`Invalid numeric input for currency: ${majorAmount}`);
    }

    const multiplier = Math.pow(10, config.minorUnitDecimals);
    return Math.round(num * multiplier);
  }

  /**
   * Convert minor units (e.g. 1050) to formatted decimal string (e.g. "10.50" or "¥1050")
   */
  static formatMinorUnits(minorUnits: number, currency = 'USD', includeSymbol = true): string {
    const config = CURRENCY_CONFIGS[currency.toUpperCase()] || { minorUnitDecimals: 2, symbol: '' };
    const divisor = Math.pow(10, config.minorUnitDecimals);
    const major = minorUnits / divisor;

    const formattedNum = major.toLocaleString('en-US', {
      minimumFractionDigits: config.minorUnitDecimals,
      maximumFractionDigits: config.minorUnitDecimals
    });

    return includeSymbol ? `${config.symbol}${formattedNum}` : formattedNum;
  }

  /**
   * Convert an amount in foreign currency minor units into base currency minor units
   * using an explicit exchange rate.
   */
  static convertCurrencyMinor(
    foreignAmountMinor: number,
    foreignCurrency: string,
    baseCurrency: string,
    exchangeRateToBase: number
  ): number {
    if (foreignAmountMinor < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (exchangeRateToBase <= 0) {
      throw new Error('Exchange rate must be positive and non-zero');
    }

    const foreignConfig = CURRENCY_CONFIGS[foreignCurrency.toUpperCase()] || { minorUnitDecimals: 2 };
    const baseConfig = CURRENCY_CONFIGS[baseCurrency.toUpperCase()] || { minorUnitDecimals: 2 };

    // 1. Convert foreign minor to foreign major
    const foreignMajor = foreignAmountMinor / Math.pow(10, foreignConfig.minorUnitDecimals);

    // 2. Multiply by exchange rate to get base major
    const baseMajor = foreignMajor * exchangeRateToBase;

    // 3. Convert base major to base minor units
    const baseMinor = Math.round(baseMajor * Math.pow(10, baseConfig.minorUnitDecimals));

    return baseMinor;
  }

  /**
   * Split an expense equally among N companions, ensuring remainder cents are distributed
   * so that sum(splits) exactly equals total amount without rounding loss.
   */
  static splitEqually(totalMinorUnits: number, companionCount: number): number[] {
    if (companionCount <= 0) {
      throw new Error('Companion count must be greater than zero');
    }
    if (totalMinorUnits < 0) {
      throw new Error('Amount cannot be negative');
    }

    const baseShare = Math.floor(totalMinorUnits / companionCount);
    const remainder = totalMinorUnits % companionCount;

    const shares: number[] = new Array(companionCount).fill(baseShare);

    // Distribute remainder cents one by one to initial companions
    for (let i = 0; i < remainder; i++) {
      shares[i] += 1;
    }

    return shares;
  }
}
