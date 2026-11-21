import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTripsStore } from './trips';
import { BudgetArithmetic } from '../../../integrations/budget-arithmetic';

export const expensesRouter = Router({ mergeParams: true });

// GET trip expenses summary
expensesRouter.get('/', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  let totalSpentBaseMinor = 0;
  const categoryTotalsMinor: Record<string, number> = {};

  for (const exp of trip.expenses) {
    totalSpentBaseMinor += exp.amountInBaseCurrencyMinor;
    categoryTotalsMinor[exp.category] = (categoryTotalsMinor[exp.category] || 0) + exp.amountInBaseCurrencyMinor;
  }

  const remainingBudgetMinor = trip.budgetLimitMinor - totalSpentBaseMinor;
  const companionCount = Math.max(1, trip.members.length);
  const perPersonShares = BudgetArithmetic.splitEqually(totalSpentBaseMinor, companionCount);

  res.json({
    success: true,
    data: {
      expenses: trip.expenses,
      baseCurrency: trip.baseCurrency,
      budgetLimitMinor: trip.budgetLimitMinor,
      budgetLimitFormatted: BudgetArithmetic.formatMinorUnits(trip.budgetLimitMinor, trip.baseCurrency),
      totalSpentBaseMinor,
      totalSpentFormatted: BudgetArithmetic.formatMinorUnits(totalSpentBaseMinor, trip.baseCurrency),
      remainingBudgetMinor,
      remainingFormatted: BudgetArithmetic.formatMinorUnits(remainingBudgetMinor, trip.baseCurrency),
      categoryBreakdown: categoryTotalsMinor,
      companionCount,
      perPersonShareMinor: perPersonShares[0] || 0,
      perPersonShareFormatted: BudgetArithmetic.formatMinorUnits(perPersonShares[0] || 0, trip.baseCurrency)
    }
  });
});

// POST create expense
expensesRouter.post('/', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const { description, amountMinor, currency, category, date, paidByUserId, exchangeRateToBase } = req.body;

  if (!description || amountMinor === undefined) {
    return res.status(400).json({ success: false, error: 'Description and amountMinor are required' });
  }

  const expenseCurrency = (currency || trip.baseCurrency).toUpperCase();
  const rate = Number(exchangeRateToBase) || (expenseCurrency === trip.baseCurrency ? 1.0 : 1.0);
  const amtMinor = Number(amountMinor);

  const baseMinor = BudgetArithmetic.convertCurrencyMinor(
    amtMinor,
    expenseCurrency,
    trip.baseCurrency,
    rate
  );

  const newExpense = {
    id: `exp-${uuidv4().substring(0, 8)}`,
    description,
    amountMinor: amtMinor,
    currency: expenseCurrency,
    category: category || 'OTHER',
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    paidByUserId: paidByUserId || trip.createdById,
    exchangeRateToBase: rate,
    amountInBaseCurrencyMinor: baseMinor
  };

  trip.expenses.push(newExpense);

  res.status(201).json({ success: true, data: newExpense });
});

// DELETE expense
expensesRouter.delete('/:expenseId', (req: Request, res: Response) => {
  const { tripId, expenseId } = req.params;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const idx = trip.expenses.findIndex(e => e.id === expenseId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Expense not found' });
  }

  trip.expenses.splice(idx, 1);
  res.json({ success: true, message: 'Expense deleted' });
});
