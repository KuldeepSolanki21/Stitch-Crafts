import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const DashboardOverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<any | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getOverview(),
      adminApi.getTopProducts(),
      adminApi.getCategorySales(),
    ]).then(([ov, tp, cs]) => {
      setOverview(ov.data.data);
      setTopProducts(tp.data.data);
      setCategorySales(cs.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading master analytics dashboard...</div>;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Executive Performance Dashboard</h2>
        <p className="text-xs sm:text-sm text-gray-500">Real-time revenue, order fulfillment, and luxury inventory metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Total Revenue</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">₹{Number(overview?.totalRevenue || 0).toLocaleString()}</h3>
          <p className="text-xs text-green-600 mt-1">Paid customer checkouts</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Orders Processed</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{overview?.totalOrders || 0}</h3>
          <p className="text-xs text-gray-400 mt-1">Avg: ₹{overview?.averageOrderValue || 0}</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Registered Patrons</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{overview?.totalCustomers || 0}</h3>
          <p className="text-xs text-admin-primary font-semibold mt-1">Active customer base</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Low Stock Alerts</p>
          <h3 className="text-xl sm:text-2xl font-bold text-red-600 mt-2">{overview?.lowStockProducts || 0}</h3>
          <p className="text-xs text-gray-400 mt-1">≤ 5 units remaining</p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Top Products */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-base mb-4 border-b pb-2 text-gray-800">Top Selling Creations</h3>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400">No purchase history recorded yet.</p>
            ) : (
              topProducts.map((p) => (
                <div key={p.productId} className="flex justify-between items-center text-sm gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img src={p.image || 'https://via.placeholder.com/50'} alt="" className="w-10 h-10 rounded object-cover border shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.unitsSold} units sold</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">₹{p.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-base mb-4 border-b pb-2 text-gray-800">Revenue by Atelier Collection</h3>
          <div className="space-y-4">
            {categorySales.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-900">₹{c.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-admin-primary h-full rounded-full"
                    style={{ width: `${overview?.totalRevenue ? Math.min(100, (c.revenue / overview.totalRevenue) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
