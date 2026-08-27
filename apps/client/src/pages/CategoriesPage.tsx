import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/product.api';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getCategories().then((res) => {
      setCategories(res.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-serif text-4xl font-bold text-charcoal mb-4">Curated Collections</h1>
        <p className="text-gray-600 text-sm">Explore our specialized ateliers of luxury leather craft, divided by functional purpose and timeless silhouettes.</p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-400 font-serif">Loading collections...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((c) => (
            <div key={c.id} className="group relative bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">{c.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{c.description || 'Artisan handcrafted collection.'}</p>
                <Link
                  to={`/shop?category=${c.slug}`}
                  className="inline-block text-xs uppercase tracking-widest font-bold text-leather hover:underline"
                >
                  Explore Collection →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
