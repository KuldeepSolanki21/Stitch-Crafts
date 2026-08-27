import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
      <div className="w-16 h-16 bg-leather/10 text-leather rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
      <h1 className="font-serif text-3xl font-bold">Thank You For Your Order</h1>
      <p className="text-gray-600 text-sm max-w-md mx-auto">
        Your bespoke handcrafted leather goods order has been confirmed and transferred to our master artisans.
      </p>
      {orderId && (
        <p className="font-mono text-xs font-bold text-gray-500 bg-gray-100 py-2 px-4 rounded w-fit mx-auto">
          Order Reference: {orderId}
        </p>
      )}
      <div className="pt-6 flex justify-center gap-4">
        <Link to="/orders" className="bg-charcoal text-white px-6 py-3 text-xs uppercase tracking-widest font-bold">
          View My Orders
        </Link>
        <Link to="/shop" className="border border-charcoal text-charcoal px-6 py-3 text-xs uppercase tracking-widest font-bold">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
};
