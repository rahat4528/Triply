'use client';

import React, { useState } from 'react';
import { DollarSign, PieChart, Users, TrendingUp, AlertTriangle, Plus } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amountMinor: number;
  currency: string;
  category: string;
  date: string;
  paidByUserId: string;
  amountInBaseCurrencyMinor: number;
}

interface BudgetTrackerProps {
  baseCurrency: string;
  budgetLimitMinor: number;
  expenses: Expense[];
  companionCount: number;
  onAddExpense: (expense: Partial<Expense>) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  baseCurrency,
  budgetLimitMinor,
  expenses,
  companionCount,
  onAddExpense
}) => {
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('ACCOMMODATION');

  const totalSpentMinor = expenses.reduce((acc, curr) => acc + curr.amountInBaseCurrencyMinor, 0);
  const remainingMinor = budgetLimitMinor - totalSpentMinor;
  const spentPct = budgetLimitMinor > 0 ? Math.min(100, Math.round((totalSpentMinor / budgetLimitMinor) * 100)) : 0;
  const perPersonShareMinor = companionCount > 0 ? Math.round(totalSpentMinor / companionCount) : totalSpentMinor;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amountInBaseCurrencyMinor;
  }

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;

    const minor = Math.round(parseFloat(amount) * 100);
    onAddExpense({
      description: desc,
      amountMinor: minor,
      currency: baseCurrency,
      category,
      amountInBaseCurrencyMinor: minor,
      date: new Date().toISOString()
    });

    setDesc('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Budget & Expense Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Exact minor-unit calculations with multi-currency conversion
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </button>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Budget</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${(budgetLimitMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {baseCurrency}
          </div>
          <div className="text-xs text-slate-500 mt-1">Configured cap</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Spent</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ${(totalSpentMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {baseCurrency}
          </div>
          <div className="text-xs text-slate-400 mt-1">{spentPct}% of allocated budget</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Split Per Companion</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            ${(perPersonShareMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">Divided among {companionCount} travelers</div>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="mt-6 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Spent: ${(totalSpentMinor / 100).toFixed(2)}</span>
          <span>Remaining: ${(remainingMinor / 100).toFixed(2)}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPct > 90 ? 'bg-rose-500' : spentPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" />
          Category Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryTotals).map(([cat, total]) => (
            <div key={cat} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{cat}</div>
              <div className="text-base font-bold text-slate-200 mt-1">
                ${(total / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Amount ({baseCurrency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-medium text-white">{exp.description}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                    {exp.category}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                  ${(exp.amountInBaseCurrencyMinor / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Log Travel Expense</h3>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bullet train tickets"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount ({baseCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACCOMMODATION">Accommodation</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="MEALS">Meals</option>
                    <option value="ACTIVITIES">Activities</option>
                    <option value="SHOPPING">Shopping</option>
                    <option value="FEES">Fees</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
