import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const CategoriesListPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200',
    parentId: '' as string | undefined,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await adminApi.createCategory({
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image,
        parentId: formData.parentId || undefined,
      });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200', parentId: '' });
      fetchCategories();
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrorMessage(err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | '));
      } else {
        setErrorMessage(err.response?.data?.message || 'Creation failed');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-sm text-gray-500">Organize leather product collections and hierarchy</p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="bg-admin-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-leather-dark transition"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-800 flex items-center space-x-3">
                  {c.image && <img src={c.image} alt="" className="w-8 h-8 rounded object-cover border" />}
                  <span>{c.name}</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.slug}</td>
                <td className="px-6 py-4 text-gray-600">{c._count?.products || 0}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 font-bold hover:underline text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Create Category</h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel Duffles"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm bg-admin-primary text-white rounded-lg font-medium hover:bg-leather-dark transition">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
