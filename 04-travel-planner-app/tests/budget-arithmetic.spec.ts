import { BudgetArithmetic } from '../integrations/budget-arithmetic';

describe('BudgetArithmetic', () => {
  describe('toMinorUnits', () => {
    it('converts USD major decimal to cents without float drift', () => {
      expect(BudgetArithmetic.toMinorUnits(19.99, 'USD')).toBe(1999);
      expect(BudgetArithmetic.toMinorUnits('45.50', 'USD')).toBe(4550);
      expect(BudgetArithmetic.toMinorUnits(0.01, 'USD')).toBe(1);
    });

    it('converts JPY major decimal to zero-decimal minor units', () => {
      expect(BudgetArithmetic.toMinorUnits(1500, 'JPY')).toBe(1500);
      expect(BudgetArithmetic.toMinorUnits('25000', 'JPY')).toBe(25000);
    });

    it('converts BHD major decimal to 3-decimal minor units', () => {
      expect(BudgetArithmetic.toMinorUnits(12.345, 'BHD')).toBe(12345);
    });
  });

  describe('formatMinorUnits', () => {
    it('formats USD cents to currency string', () => {
      expect(BudgetArithmetic.formatMinorUnits(1999, 'USD')).toBe('$19.99');
      expect(BudgetArithmetic.formatMinorUnits(100000, 'USD')).toBe('$1,000.00');
    });

    it('formats JPY without decimal places', () => {
      expect(BudgetArithmetic.formatMinorUnits(15000, 'JPY')).toBe('¥15,000');
    });

    it('formats EUR with euro symbol', () => {
      expect(BudgetArithmetic.formatMinorUnits(4550, 'EUR')).toBe('€45.50');
    });
  });

  describe('convertCurrencyMinor', () => {
    it('converts JPY minor units to USD minor units with exchange rate', () => {
      // 10,000 JPY at 0.0067 USD/JPY = $67.00 USD (6,700 cents)
      const usdMinor = BudgetArithmetic.convertCurrencyMinor(10000, 'JPY', 'USD', 0.0067);
      expect(usdMinor).toBe(6700);
    });

    it('converts EUR minor units to USD minor units', () => {
      // 100.00 EUR (10,000 cents) at 1.08 USD/EUR = 108.00 USD (10,800 cents)
      const usdMinor = BudgetArithmetic.convertCurrencyMinor(10000, 'EUR', 'USD', 1.08);
      expect(usdMinor).toBe(10800);
    });

    it('throws error on negative amounts or invalid exchange rates', () => {
      expect(() => {
        BudgetArithmetic.convertCurrencyMinor(-500, 'EUR', 'USD', 1.08);
      }).toThrow('Amount cannot be negative');

      expect(() => {
        BudgetArithmetic.convertCurrencyMinor(1000, 'EUR', 'USD', 0);
      }).toThrow('Exchange rate must be positive and non-zero');
    });
  });

  describe('splitEqually', () => {
    it('splits evenly divisible amount without remainder', () => {
      const shares = BudgetArithmetic.splitEqually(10000, 4); // $100 among 4
      expect(shares).toEqual([2500, 2500, 2500, 2500]);
      expect(shares.reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('distributes remainder cents fairly so total matches original cents exactly', () => {
      const shares = BudgetArithmetic.splitEqually(10000, 3); // $100 (10,000 cents) among 3
      expect(shares).toEqual([3334, 3333, 3333]);
      expect(shares.reduce((a, b) => a + b, 0)).toBe(10000);
    });

    it('handles single companion split', () => {
      const shares = BudgetArithmetic.splitEqually(4550, 1);
      expect(shares).toEqual([4550]);
    });

    it('throws error when companion count is 0 or negative', () => {
      expect(() => {
        BudgetArithmetic.splitEqually(1000, 0);
      }).toThrow('Companion count must be greater than zero');
    });
  });
});
