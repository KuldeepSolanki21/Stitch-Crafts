import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/order.api';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-24 text-center font-serif text-gray-400">Retrieving order history...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl font-bold mb-8">My Orders & Invoices</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed p-8">
          <p className="text-gray-500 mb-4">You have not placed any orders yet.</p>
          <Link to="/shop" className="text-leather underline font-semibold">Explore Catalog</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-6 border shadow-sm flex justify-between items-center">
              <div>
                <p className="font-mono text-xs text-gray-500">#{o.id.substring(0, 12)}...</p>
                <p className="font-bold text-base mt-1">₹{Number(o.totalAmount).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {o.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="space-x-3">
                <Link to={`/orders/${o.id}`} className="text-xs font-bold uppercase tracking-wider text-leather hover:underline">
                  View Details
                </Link>
                <Link to={`/tracking?orderId=${o.id}`} className="text-xs font-bold uppercase tracking-wider text-charcoal hover:underline">
                  Track →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
