import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../services/admin-api.client';

export const OrderDetailsAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('BlueDart Express');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrderById(id!);
      const o = res.data.data;
      setOrder(o);
      setStatus(o.orderStatus);
      setPaymentStatus(o.paymentStatus);
      setTrackingNumber(o.trackingNumber || '');
      setTrackingCarrier(o.trackingCarrier || 'BlueDart Express');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await adminApi.updateOrderStatus(id!, { orderStatus: status, paymentStatus });
      alert('Order status updated successfully');
      fetchOrder();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  const handleAssignTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateOrderTracking(id!, { trackingNumber, trackingCarrier });
      alert('Airway bill assigned and status shifted to SHIPPED');
      fetchOrder();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Tracking update failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order file...</div>;
  if (!order) return <div className="p-8 text-center text-gray-500">Order not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <Link to="/orders" className="text-xs text-gray-500 hover:text-black">← Back to Orders</Link>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">Order #{order.id}</h2>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm uppercase text-gray-600 mb-4 border-b pb-2">Purchased Creations</h3>
            <div className="divide-y divide-gray-100">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <img src={item.variant?.images[0] || item.product?.images[0] || 'https://via.placeholder.com/60'} alt="" className="w-14 h-14 object-cover rounded border shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.product?.title}</h4>
                      {item.variant && (
                        <p className="text-xs text-gray-500">Finish: {item.variant.colorName} ({item.variant.sku})</p>
                      )}
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm sm:text-right">₹{Number(item.totalPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Airway Bill Assignment */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-600 border-b pb-2">Logistics & Airway Bill</h3>
            <form onSubmit={handleAssignTracking} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Carrier Name</label>
                <input
                  type="text"
                  required
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Airway Bill / Tracking No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLUEDART-9847291"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-end">
                <button type="submit" className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition">
                  Update Tracking & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Status & Customer */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-600 border-b pb-2">Order State Machine</h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Fulfillment Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm mb-3"
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm mb-4"
              >
                <option value="PENDING">PENDING</option>
                <option value="AUTHORIZED">AUTHORIZED</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>

              <button
                type="button"
                onClick={handleUpdateStatus}
                className="w-full bg-admin-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-leather-dark transition"
              >
                Save Status Changes
              </button>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold text-sm uppercase text-gray-600 border-b pb-2">Destination Address</h3>
            <p className="font-semibold text-gray-900 text-sm">{order.user?.name}</p>
            <p className="text-gray-600">{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p className="text-gray-600">{order.shippingAddress?.addressLine2}</p>}
            <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
            <p className="text-gray-600 font-semibold">{order.shippingAddress?.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
