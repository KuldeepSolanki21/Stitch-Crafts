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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-charcoal">Live Shipment Tracking</h1>
      <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-8 sm:mb-12">
        <input
          type="text"
          placeholder="Enter Order ID..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 px-4 py-2.5 border text-xs sm:text-sm rounded focus:border-leather focus:outline-none"
        />
        <button onClick={fetchTracking} className="bg-leather text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded hover:bg-leather-dark transition">
          Track
        </button>
      </div>

      {loading && <div className="text-center font-serif text-gray-400">Contacting logistics carriers...</div>}

      {tracking && (
        <div className="bg-white p-5 sm:p-8 border border-gray-100 shadow-sm space-y-6 sm:space-y-8 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
            <div>
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="text-base sm:text-lg font-bold text-leather">{tracking.orderStatus.replace('_', ' ')}</p>
            </div>
            {tracking.trackingNumber && (
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-500">Carrier: {tracking.trackingCarrier}</p>
                <p className="font-mono text-sm font-bold text-charcoal">{tracking.trackingNumber}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            {tracking.timeline.map((step: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step.completed ? 'bg-leather text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-xs sm:text-sm font-semibold ${step.completed ? 'text-charcoal' : 'text-gray-400'}`}>
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
