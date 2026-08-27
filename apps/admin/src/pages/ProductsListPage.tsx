import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/admin-api.client';

export const ProductsListPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts({ search });
      setProducts(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleTogglePublish = async (p: any) => {
    try {
      await adminApi.updateProductStatus(p.id, !p.isPublished);
      fetchProducts();
    } catch (e) {
      alert('Status toggle failed');
    }
  };

  const handleToggleFeatured = async (p: any) => {
    try {
      await adminApi.updateProductFeatured(p.id, !p.featured);
      fetchProducts();
    } catch (e) {
      alert('Featured status toggle failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Matrix</h2>
          <p className="text-sm text-gray-500">Manage handcrafted leather goods, pricing, and variants</p>
        </div>
        <Link
          to="/products/new"
          className="bg-admin-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-leather-dark transition"
        >
          + Add New Product
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by title or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white w-80 text-sm focus:outline-none focus:border-admin-primary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">Loading catalog items...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900 flex items-center space-x-3">
                    <img src={p.images[0] || 'https://via.placeholder.com/60'} alt={p.title} className="w-12 h-12 rounded object-cover border" />
                    <div>
                      <p className="font-semibold text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.variants?.length || 0} Variants</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-xs">{p.sku}</td>
                  <td className="p-4 text-gray-600">{p.category?.name}</td>
                  <td className="p-4 font-semibold text-gray-900">
                    ₹{p.price.toLocaleString()}
                    {p.discountPrice && (
                      <span className="block text-xs text-green-600 font-normal">₹{p.discountPrice.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      p.availability === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                      p.availability === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.totalStock} units ({p.availability})
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        p.featured ? 'bg-brass/20 text-yellow-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.featured ? '★ Featured' : '☆ Standard'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        p.isPublished ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link to={`/products/edit/${p.id}`} className="text-admin-primary hover:underline font-medium">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
