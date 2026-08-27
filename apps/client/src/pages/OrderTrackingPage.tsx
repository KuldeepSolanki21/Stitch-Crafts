import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../services/order.api';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [tracking, setTracking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await orderApi.getOrderTracking(orderId);
      setTracking(res.data.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Tracking look-up failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchTracking();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl font-bold text-center mb-8">Live Shipment Tracking</h1>
      <div className="flex gap-2 max-w-md mx-auto mb-12">
        <input
          type="text"
          placeholder="Enter Order ID..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 px-4 py-2 border text-sm"
        />
        <button onClick={fetchTracking} className="bg-leather text-white px-6 py-2 text-xs font-bold uppercase tracking-wider">
          Track
        </button>
      </div>

      {loading && <div className="text-center font-serif text-gray-400">Contacting logistics carriers...</div>}

      {tracking && (
        <div className="bg-white p-8 border shadow-sm space-y-8">
          <div className="flex justify-between border-b pb-4">
            <div>
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="text-lg font-bold text-leather">{tracking.orderStatus.replace('_', ' ')}</p>
            </div>
            {tracking.trackingNumber && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Carrier: {tracking.trackingCarrier}</p>
                <p className="font-mono text-sm font-bold">{tracking.trackingNumber}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {tracking.timeline.map((step: any, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.completed ? 'bg-leather text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm font-semibold ${step.completed ? 'text-charcoal' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
