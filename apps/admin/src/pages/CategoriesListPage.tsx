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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-xs sm:text-sm text-gray-500">Organize leather product collections and hierarchy</p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto text-center bg-admin-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-leather-dark transition shadow-sm"
        >
          + Add New Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[650px]">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Category</th>
              <th className="p-4">Slug Identifier</th>
              <th className="p-4">Parent Category</th>
              <th className="p-4">Products</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading category tree...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No categories found.</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-900 flex items-center space-x-3">
                    <img src={c.image || 'https://via.placeholder.com/50'} alt={c.name} className="w-10 h-10 rounded object-cover border shrink-0" />
                    <div>
                      <p>{c.name}</p>
                      <p className="text-xs text-gray-400 font-normal">{c.description}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">/{c.slug}</td>
                  <td className="p-4 text-gray-600">{c.parent ? c.parent.name : '— Root —'}</td>
                  <td className="p-4 font-bold text-gray-800">{c._count?.products || 0}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs font-semibold">
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
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Create Collection Category</h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duffel Bags"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the luxury collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Parent Hierarchy (Optional)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-leather focus:outline-none"
                >
                  <option value="">None (Top-Level Collection)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-admin-primary text-white rounded-lg font-medium hover:bg-leather-dark transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
