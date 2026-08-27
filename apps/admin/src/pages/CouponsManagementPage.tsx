import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const CouponsManagementPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discount: 10,
    minOrderValue: 2000,
    maxDiscount: 1000,
    usageLimit: 100,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCoupons();
      setCoupons(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon(formData);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete coupon?')) return;
    try {
      await adminApi.deleteCoupon(id);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotions & Coupons</h2>
          <p className="text-sm text-gray-500">Configure bespoke percentage and fixed price promotional vouchers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-admin-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-leather-dark transition"
        >
          + Create Coupon Rule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Usage</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No promotional coupons found.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono font-bold text-gray-900 tracking-wider">{c.code}</td>
                  <td className="p-4 font-semibold text-leather">
                    {c.discountType === 'PERCENTAGE' ? `${c.discount}%` : `₹${c.discount}`}
                  </td>
                  <td className="p-4 text-gray-600">{c.minOrderValue ? `₹${c.minOrderValue}` : 'None'}</td>
                  <td className="p-4 text-gray-600">{c.usageCount} / {c.usageLimit || '∞'}</td>
                  <td className="p-4 text-xs text-gray-500">{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Create Promotion Voucher</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-admin-primary text-white rounded-lg font-medium"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
