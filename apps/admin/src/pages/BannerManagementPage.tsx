import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const BannerManagementPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600',
    targetUrl: '/shop',
    displayOrder: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBanners();
      setBanners(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await adminApi.createBanner(formData);
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrorMessage(err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | '));
      } else {
        setErrorMessage(err.response?.data?.message || 'Creation failed');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hero banner?')) return;
    try {
      await adminApi.deleteBanner(id);
      fetchBanners();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hero Carousel Banners</h2>
          <p className="text-xs sm:text-sm text-gray-500">Configure visual hero banners and brand storytelling campaigns</p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto text-center bg-admin-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-leather-dark transition shadow-sm"
        >
          + Add Hero Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="h-44 sm:h-48 relative">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded font-bold">
                Order: #{b.displayOrder}
              </span>
            </div>
            <div className="p-4 flex justify-between items-center gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">{b.title}</h4>
                <p className="text-xs text-gray-500 truncate">{b.subtitle || 'No subtitle'}</p>
                <p className="text-xs text-admin-primary font-mono mt-1 truncate">{b.targetUrl}</p>
              </div>
              <button onClick={() => handleDelete(b.id)} className="text-red-500 text-xs font-bold hover:underline shrink-0">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Create Hero Banner</h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crafted for Every Journey"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Full-grain vegetable tanned luxury leather..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm bg-admin-primary text-white rounded-lg font-medium hover:bg-leather-dark transition">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
