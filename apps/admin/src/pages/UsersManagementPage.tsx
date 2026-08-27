import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({ search });
      setUsers(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer & User Directory</h2>
          <p className="text-xs sm:text-sm text-gray-500">Manage registered atelier patrons, accounts, and role permissions</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white w-full sm:w-72 text-sm shadow-xs focus:outline-none focus:border-admin-primary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[650px]">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Orders Placed</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading directory...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{u._count?.orders || 0}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs rounded font-semibold ${
                      u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
