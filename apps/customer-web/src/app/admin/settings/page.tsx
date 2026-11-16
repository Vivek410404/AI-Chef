'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield,
  Edit2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<any | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getSettings();
      setSettings(res || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSetting = async () => {
    if (!editingSetting) return;
    try {
      setSaveLoading(true);
      await api.admin.updateSetting(editingSetting.key, editValue, editDescription);
      setActionMessage(`Setting "${editingSetting.key}" updated successfully.`);
      setEditingSetting(null);
      fetchSettings();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-terracotta-400" />
            <span>Platform Configuration Settings</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Dynamic runtime switches, feature flags, AI model identifiers, and pricing defaults
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Settings modification is restricted to Super Administrators. Read-only view active.</span>
        </div>
      )}

      {/* Settings List */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden divide-y divide-stone-800/80">
        {loading ? (
          <div className="py-12 text-center text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-terracotta-400" />
            Loading system configuration...
          </div>
        ) : settings.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            No system configuration records found.
          </div>
        ) : (
          settings.map((s) => (
            <div key={s.id || s.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-850 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white">{s.key}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-950 text-terracotta-300 border border-stone-800 font-bold">
                    {s.value}
                  </span>
                </div>
                <p className="text-xs text-stone-400">{s.description || 'System setting'}</p>
                <p className="text-[10px] text-stone-500 font-mono">
                  Updated: {new Date(s.updatedAt).toLocaleString()} by {s.updatedBy || 'system'}
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setEditingSetting(s);
                    setEditValue(s.value);
                    setEditDescription(s.description || '');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold self-start sm:self-center flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingSetting && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Edit System Setting</h3>
            <p className="text-xs font-mono text-terracotta-400">{editingSetting.key}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Setting Value</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-terracotta-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingSetting(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSetting}
                disabled={saveLoading}
                className="px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-xs font-bold text-white transition"
              >
                {saveLoading ? 'Saving...' : 'Apply Setting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
