import React, { useState, useEffect } from 'react';
import { productApi } from '../services/product.api';
import { ProductCard } from '../components/product/ProductCard';

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  useEffect(() => {
    productApi.getCategories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts({
          search,
          category: selectedCategory,
          sort,
          minPrice,
          maxPrice,
        });
        setProducts(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [search, selectedCategory, sort, minPrice, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="border-b border-leather/10 pb-8 mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold text-charcoal tracking-wide mb-3">The Leather Collection</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm">
          Precision handcrafted goods, forged from full-grain vegetable-tanned hides designed to develop an exquisite patina over time.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div>
            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-charcoal mb-4">Search Catalog</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm focus:border-leather focus:outline-none"
            />
          </div>

          <div>
            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-charcoal mb-4">Collections</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`block text-sm text-left w-full transition ${
                  selectedCategory === '' ? 'text-leather font-bold' : 'text-gray-600 hover:text-charcoal'
                }`}
              >
                All Collections
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`block text-sm text-left w-full transition ${
                    selectedCategory === c.slug ? 'text-leather font-bold' : 'text-gray-600 hover:text-charcoal'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-charcoal mb-4">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice || ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 px-3 py-2 bg-white border text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 px-3 py-2 bg-white border text-sm"
              />
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <span className="text-xs tracking-wider uppercase text-gray-500 font-semibold">
              Showing {products.length} Masterpiece{products.length === 1 ? '' : 's'}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm font-medium border-b border-gray-300 focus:outline-none py-1"
            >
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Alphabetical</option>
            </select>
          </div>

          {loading ? (
            <div className="py-24 text-center text-gray-400 font-serif">Curating catalog collection...</div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <h3 className="font-serif text-xl font-bold mb-2">No Matching Leather Creations Found</h3>
              <p className="text-gray-500 text-sm">Try broadening your search or clearing active filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
