import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/admin-api.client';

export const OrdersListPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders({ status: statusFilter, search });
      setOrders(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Fulfillment Desk</h2>
          <p className="text-sm text-gray-500">Track and dispatch handcrafted luxury leather orders</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st ? 'bg-admin-primary text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by Order ID or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white w-72 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-xs font-bold text-gray-900">{o.id.substring(0, 8)}...</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{o.user?.name}</p>
                    <p className="text-xs text-gray-500">{o.user?.email}</p>
                  </td>
                  <td className="p-4 text-xs text-gray-600">{o.orderItems?.length || 0} product(s)</td>
                  <td className="p-4 font-bold text-gray-900">₹{Number(o.totalAmount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs rounded font-semibold ${
                      o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.paymentProvider} ({o.paymentStatus})
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                      o.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      o.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      o.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/orders/${o.id}`} className="text-admin-primary font-semibold hover:underline">
                      Manage →
                    </Link>
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
