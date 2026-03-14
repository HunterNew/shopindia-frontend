import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import { FiUser, FiLock, FiPackage, FiEdit2, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [tab,       setTab]       = useState('profile');
  const [editing,   setEditing]   = useState(false);
  const [profile,   setProfile]   = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving,    setSaving]    = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await API.put('/auth/profile', profile);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await API.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile',    icon: FiUser },
    { id: 'password', label: 'Change Password', icon: FiLock },
  ];

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="card p-4">
            <div className="text-center mb-4 p-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${tab === id ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
              <Link to="/orders" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                <FiPackage size={15} /> My Orders
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">
          {tab === 'profile' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                {!editing
                  ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium"><FiEdit2 size={14} /> Edit</button>
                  : <button onClick={saveProfile} disabled={saving} className="flex items-center gap-1.5 btn-primary text-sm py-2"><FiSave size={14} /> {saving ? 'Saving…' : 'Save'}</button>
                }
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  {editing
                    ? <input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className="input-field" />
                    : <p className="text-gray-800 font-medium">{user?.name}</p>
                  }
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  {editing
                    ? <input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} placeholder="10-digit number" className="input-field" />
                    : <p className="text-gray-800">{user?.phone || '—'}</p>
                  }
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Member Since</label>
                  <p className="text-gray-800">{new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>
              <form onSubmit={changePassword} className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm(p => ({...p, currentPassword: e.target.value}))} className="input-field" placeholder="Your current password" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                  <input type="password" required value={pwForm.newPassword} onChange={e => setPwForm(p => ({...p, newPassword: e.target.value}))} className="input-field" placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input type="password" required value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} className="input-field" placeholder="Repeat new password" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
