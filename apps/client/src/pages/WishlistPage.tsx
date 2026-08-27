import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api.client';
import { cartApi } from '../services/cart.api';

export const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/wishlist');
      setItems(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await apiClient.delete(`/wishlist/${productId}`);
      fetchWishlist();
    } catch (e) {
      alert('Remove failed');
    }
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      await apiClient.post(`/wishlist/${productId}/move-to-cart`, {});
      fetchWishlist();
      alert('Item moved to cart!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Move to cart failed');
    }
  };

  if (loading) return <div className="py-24 text-center font-serif text-gray-400">Opening your private wishlist...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="border-b pb-6 mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">My Saved Creations</h1>
          <p className="text-xs text-gray-500 mt-1">{items.length} saved masterpiece{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center border border-dashed p-12">
          <h3 className="font-serif text-xl font-bold mb-2">Your wishlist is currently empty</h3>
          <p className="text-gray-500 text-sm mb-6">Save your favourite handcrafted leather goods for later.</p>
          <Link to="/shop" className="bg-leather text-white px-8 py-3 text-xs uppercase tracking-widest font-bold">
            Explore Handcrafted Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => {
            const p = item.product;
            return (
              <div key={item.id} className="bg-white p-4 border border-gray-100 shadow-sm space-y-3">
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                  <img src={p.images[0] || 'https://via.placeholder.com/400'} alt={p.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute top-2 right-2 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center text-xs text-red-500 shadow"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-leather font-semibold">{p.category?.name}</p>
                  <Link to={`/product/${p.slug}`}>
                    <h4 className="font-serif text-sm font-bold text-charcoal line-clamp-1">{p.title}</h4>
                  </Link>
                  <p className="font-bold text-sm mt-1">₹{Number(p.price).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleMoveToCart(p.id)}
                  className="w-full bg-charcoal text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-leather transition"
                >
                  Move to Bag
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
