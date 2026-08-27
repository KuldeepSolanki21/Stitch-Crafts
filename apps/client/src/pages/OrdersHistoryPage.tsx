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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-charcoal">My Orders & Invoices</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 p-8 rounded-xl">
          <p className="text-gray-500 mb-4 text-sm">You have not placed any orders yet.</p>
          <Link to="/shop" className="text-leather underline font-semibold text-xs uppercase tracking-wider">Explore Catalog</Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl">
              <div>
                <p className="font-mono text-xs text-gray-500">#{o.id.substring(0, 12)}...</p>
                <p className="font-bold text-base sm:text-lg text-charcoal mt-1">₹{Number(o.totalAmount).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-leather/10 text-leather uppercase">
                  {o.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
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
