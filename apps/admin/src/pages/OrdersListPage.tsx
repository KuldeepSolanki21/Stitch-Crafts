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
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Fulfillment Desk</h2>
          <p className="text-xs sm:text-sm text-gray-500">Track and dispatch handcrafted luxury leather orders</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st ? 'bg-admin-primary text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
          className="px-4 py-2 border rounded-lg bg-white w-full lg:w-72 text-sm shadow-xs focus:outline-none focus:border-admin-primary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
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
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading order log...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-xs font-bold text-gray-900">#{o.id.substring(0, 10)}...</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{o.user?.name}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="p-4 text-gray-600">{o.orderItems?.length || 0} Piece(s)</td>
                  <td className="p-4 font-bold text-gray-900">₹{Number(o.totalAmount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      o.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {o.paymentStatus} ({o.paymentMethod})
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      o.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      o.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      o.orderStatus === 'PROCESSING' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
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
