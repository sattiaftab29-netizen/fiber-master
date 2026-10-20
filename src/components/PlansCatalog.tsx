import React, { useState } from 'react';
import { Wifi, Plus, Edit, Trash2, Check, Radio, Zap, Shield, X } from 'lucide-react';
import { Plan, Customer, CompanySettings, PlanType } from '../types';

interface PlansCatalogProps {
  plans: Plan[];
  customers: Customer[];
  company: CompanySettings;
  onSavePlan: (plan: Plan) => void;
  onDeletePlan: (id: string) => void;
}

export const PlansCatalog: React.FC<PlansCatalogProps> = ({
  plans,
  customers,
  company,
  onSavePlan,
  onDeletePlan,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleOpenAdd = () => {
    setEditingPlan({
      id: 'plan-' + Date.now(),
      name: '',
      speedMbps: 50,
      price: 39.0,
      type: 'Fiber FTTH',
      billingCycle: 'monthly',
      description: 'Ultra-fast fiber optic broadband package.',
      contentionRatio: '1:2',
      features: ['50 Mbps Symmetric (Up/Down)', 'Unlimited Data Quota', 'Wi-Fi 6 Router Included'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan({ ...plan, features: [...plan.features] });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name.trim()) return;
    onSavePlan(editingPlan);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wifi className="w-6 h-6 text-teal-400" />
            Bandwidth Packages &amp; Service Tiers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure speed tiers, contention rates, and recurring pricing for FTTH fiber, wireless, and dedicated lines.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Tier</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const subscriberCount = customers.filter((c) => c.planId === plan.id).length;

          return (
            <div
              key={plan.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase font-semibold">
                      {plan.type}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{plan.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Edit className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete plan ${plan.name}?`)) onDeletePlan(plan.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Speed & Price */}
                <div className="mt-4 flex items-baseline justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-3xl font-extrabold text-white font-mono">{plan.speedMbps}</span>
                    <span className="text-xs text-slate-400 font-mono ml-1">Mbps</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-teal-400 font-mono">
                      {company.currencySymbol}
                      {plan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/mo</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{plan.description}</p>

                {/* Contention and tech details */}
                <div className="mt-3 bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-xs font-mono flex justify-between">
                  <span className="text-slate-400">Contention: {plan.contentionRatio}</span>
                  <span className="text-teal-400 font-semibold">{subscriberCount} Subscribers</span>
                </div>

                {/* Features list */}
                <div className="mt-4 space-y-2">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom decorative bar */}
              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px]">Cycle: {plan.billingCycle}</span>
                <span className="text-[10px] text-emerald-400 font-medium">99.9% Uptime Guarantee</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-teal-400" />
                {editingPlan.name ? 'Edit Service Plan' : 'Create Bandwidth Plan'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. Turbo Fiber 100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Speed (Mbps Symmetric) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingPlan.speedMbps}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, speedMbps: parseInt(e.target.value) || 10 })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingPlan.price}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Connection Medium</label>
                  <select
                    value={editingPlan.type}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, type: e.target.value as PlanType })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Fiber FTTH">Fiber FTTH</option>
                    <option value="Wireless">Wireless P2P / PtMP</option>
                    <option value="Dedicated DIA">Dedicated DIA (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contention Ratio</label>
                  <input
                    type="text"
                    value={editingPlan.contentionRatio}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, contentionRatio: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="1:1 or 1:4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20"
                >
                  Save Service Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
