'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Shield,
  KeyRound,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminStaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create staff modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'OPERATIONS' | 'SUPPORT'>('ADMIN');
  const [newPassword, setNewPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Role update modal
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'OPERATIONS' | 'SUPPORT'>('ADMIN');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getStaffList();
      setStaff(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    try {
      setCreateLoading(true);
      await api.admin.createStaffMember({
        email: newEmail,
        fullName: newName,
        role: newRole,
        password: newPassword
      });
      setActionMessage(`Staff account for ${newEmail} created successfully.`);
      setIsCreateOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      fetchStaff();
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingStaff) return;
    try {
      await api.admin.updateStaffRole(editingStaff.id, selectedRole);
      setActionMessage(`Role for ${editingStaff.email} updated to ${selectedRole}.`);
      setEditingStaff(null);
      fetchStaff();
    } catch (err: any) {
      alert(`Role change failed: ${err.message}`);
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-900/60 text-purple-200 border-purple-700',
    ADMIN: 'bg-blue-900/60 text-blue-200 border-blue-700',
    OPERATIONS: 'bg-amber-900/60 text-amber-200 border-amber-700',
    SUPPORT: 'bg-teal-900/60 text-teal-200 border-teal-700'
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center max-w-md mx-auto my-12">
        <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Super Administrator Restricted</h2>
        <p className="text-xs text-stone-400">
          Staff provisioning, role delegation, and operator credentials management require root SUPER_ADMIN privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>Platform Staff & Roles</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Provision and audit internal operations, support, and administrative identities
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Staff Member</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* Staff Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.fullName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[s.role] || 'bg-stone-800'}`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.role !== 'SUPER_ADMIN' ? (
                        <button
                          onClick={() => {
                            setEditingStaff(s);
                            setSelectedRole(s.role);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                        >
                          Change Role
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-500 font-mono">Root Account</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Provision Staff Account</span>
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g., Arjun Desai"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g., ops@rasoiiq.in"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Role Permission Tier</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Full Catalog & Operations)</option>
                  <option value="OPERATIONS">OPERATIONS (Fulfillment & Delivery)</option>
                  <option value="SUPPORT">SUPPORT (Read-Only & Inquiries)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition"
                >
                  {createLoading ? 'Provisioning...' : 'Confirm Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Change Staff Role</h3>
            <p className="text-xs text-stone-300">{editingStaff.fullName} ({editingStaff.email})</p>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Target Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="OPERATIONS">OPERATIONS</option>
                <option value="SUPPORT">SUPPORT</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition"
              >
                Apply Role Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
