import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const InventoryManagementPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newStock, setNewStock] = useState(0);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInventory({ status: statusFilter });
      setInventory(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      if (editingItem.isVariant) {
        await adminApi.updateVariantStock(editingItem.id, newStock);
      } else {
        await adminApi.updateProductStock(editingItem.id, newStock);
      }
      setEditingItem(null);
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Stock update failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory & Stock Control</h2>
          <p className="text-xs sm:text-sm text-gray-500">Real-time stock audit and low-inventory threshold monitor</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition ${
              statusFilter === st ? 'bg-admin-primary text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Product Title</th>
              <th className="p-4">Master SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock Breakdown</th>
              <th className="p-4">Availability</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Auditing stock levels...</td></tr>
            ) : inventory.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No inventory entries found.</td></tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-900">{item.title}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">{item.sku}</td>
                  <td className="p-4 text-gray-600">{item.category}</td>
                  <td className="p-4">
                    {item.hasVariants ? (
                      <div className="space-y-1">
                        {item.variants.map((v: any) => (
                          <div key={v.id} className="text-xs flex items-center justify-between gap-4">
                            <span>{v.colorName} ({v.sku}):</span>
                            <span className="font-bold">{v.stock} pcs</span>
                            <button
                              onClick={() => { setEditingItem({ id: v.id, isVariant: true, name: `${item.title} (${v.colorName})` }); setNewStock(v.stock); }}
                              className="text-admin-primary underline text-[11px]"
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-bold">{item.stock} pcs</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                      item.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                      item.status === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {!item.hasVariants && (
                      <button
                        onClick={() => { setEditingItem({ id: item.id, isVariant: false, name: item.title }); setNewStock(item.stock); }}
                        className="text-admin-primary hover:underline font-medium text-xs"
                      >
                        Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Adjust Stock Count</h3>
            <p className="text-xs text-gray-500 mb-4">{editingItem.name}</p>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Available Units</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-admin-primary text-white rounded-lg font-medium hover:bg-leather-dark transition"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
