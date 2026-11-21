'use client';

import React, { useState } from 'react';
import { Users, Mail, Shield, Check, Copy } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
}

interface CompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSendInvite: (email: string, role: 'EDITOR' | 'VIEWER') => void;
}

export const CompanionModal: React.FC<CompanionModalProps> = ({
  isOpen,
  onClose,
  members,
  onSendInvite
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSendInvite(email, role);
    setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://triply.travel/join?token=sec_7a9f4c82e01b');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Trip Collaborators & Roles
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        {/* Existing Members Roster */}
        <div className="mt-4 space-y-3">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Companions</div>
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div className="text-sm font-bold text-white">{m.name}</div>
                <div className="text-xs text-slate-400">{m.email}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                m.role === 'OWNER'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : m.role === 'EDITOR'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>

        {/* Invite Form */}
        <form onSubmit={handleSubmit} className="mt-6 pt-4 border-t border-slate-800 space-y-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Invite Companion</div>
          <div className="flex gap-2">
            <input
              type="email"
              required
              placeholder="companion@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Invite
            </button>
          </div>
        </form>

        {/* Quick Link Share */}
        <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="text-xs text-slate-400 truncate pr-2">
            Token Link: https://triply.travel/join?token=sec_7a9f4c82e01b
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
