import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import API from '../../utils/api';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users', { params: { page, limit: LIMIT, search: search || undefined } });
      setUsers(data.users);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} registered customers</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="input-field pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(4).fill(0).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12">
                <FiUsers size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400">No customers found</p>
              </td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
