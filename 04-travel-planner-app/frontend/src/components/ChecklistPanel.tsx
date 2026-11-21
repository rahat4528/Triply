'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Plus, CheckCircle2 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  assignedToUserId?: string;
}

interface ChecklistPanelProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (title: string, category: string) => void;
}

export const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ items, onToggleItem, onAddItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Documents');

  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = selectedCategory === 'ALL' ? items : items.filter(i => i.category === selectedCategory);

  const total = items.length;
  const completed = items.filter(i => i.isCompleted).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem(newTitle.trim(), newCat);
    setNewTitle('');
  };

  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Packing & Pre-Trip Checklist
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {completed} of {total} completed ({pct}%)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist items list */}
      <div className="space-y-2 mt-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              {item.isCompleted ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {item.title}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] uppercase font-bold text-slate-400">
              {item.category}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Add packing or todo item..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="Documents">Documents</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Finance">Finance</option>
          <option value="Health">Health</option>
        </select>
        <button
          type="submit"
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </form>
    </div>
  );
};
