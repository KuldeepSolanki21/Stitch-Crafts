import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../services/order.api';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      orderApi.getOrderById(id).then((res) => {
        setOrder(res.data.data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="py-24 text-center font-serif text-gray-400">Loading order receipt...</div>;
  if (!order) return <div className="py-24 text-center">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/orders" className="text-xs text-gray-500 hover:underline">← Back to My Orders</Link>
      <div className="flex justify-between items-center mt-2 mb-8 border-b pb-4">
        <h1 className="font-serif text-2xl font-bold">Order Receipt #{order.id.substring(0, 12)}</h1>
        <span className="text-xs font-bold bg-leather/10 text-leather px-3 py-1 uppercase">{order.orderStatus}</span>
      </div>

      <div className="space-y-4 mb-8">
        {order.orderItems?.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-white border">
            <div>
              <h4 className="font-bold text-sm">{item.product?.title}</h4>
              <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
            </div>
            <span className="font-bold text-sm">₹{Number(item.totalPrice).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal:</span><span>₹{Number(order.subtotal).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Shipping:</span><span>₹{Number(order.shippingFee).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>GST Tax:</span><span>₹{Number(order.taxAmount).toLocaleString()}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total Paid:</span><span className="text-leather">₹{Number(order.totalAmount).toLocaleString()}</span></div>
      </div>
    </div>
  );
};
