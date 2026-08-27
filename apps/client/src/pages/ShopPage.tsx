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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="border-b border-leather/10 pb-6 sm:pb-8 mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal tracking-wide mb-2 sm:mb-3">The Leather Collection</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-xs sm:text-sm">
          Precision handcrafted goods, forged from full-grain vegetable-tanned hides designed to develop an exquisite patina over time.
        </p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-6 flex justify-between items-center bg-parchment/60 p-3 rounded-lg border border-leather/15">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-charcoal"
        >
          <span>⚡</span>
          <span>{isFilterOpen ? 'Hide Filters' : 'Filter & Search Catalog'}</span>
        </button>
        <span className="text-xs text-gray-500 font-semibold">{products.length} Products</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Filter Sidebar */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6 sm:space-y-8 shrink-0 bg-white md:bg-transparent p-5 md:p-0 rounded-xl md:rounded-none border md:border-0 border-gray-200 shadow-sm md:shadow-none`}>
          <div>
            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-charcoal mb-3">Search Catalog</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 text-xs sm:text-sm focus:border-leather focus:outline-none rounded"
            />
          </div>

          <div>
            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-charcoal mb-3">Collections</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => { setSelectedCategory(''); setIsFilterOpen(false); }}
                className={`block text-xs sm:text-sm text-left w-full py-1 transition ${
                  selectedCategory === '' ? 'text-leather font-bold' : 'text-gray-600 hover:text-charcoal'
                }`}
              >
                All Collections
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.slug); setIsFilterOpen(false); }}
                  className={`block text-xs sm:text-sm text-left w-full py-1 transition ${
                    selectedCategory === c.slug ? 'text-leather font-bold' : 'text-gray-600 hover:text-charcoal'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-charcoal mb-3">Price Range (₹)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice || ''}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 px-3 py-2 bg-white border text-xs sm:text-sm rounded"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 px-3 py-2 bg-white border text-xs sm:text-sm rounded"
              />
            </div>
          </div>

          {(search || selectedCategory || minPrice || maxPrice) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setMinPrice(undefined);
                setMaxPrice(undefined);
              }}
              className="w-full text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded transition"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Product Catalog Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
            <span className="text-xs tracking-wider uppercase text-gray-500 font-semibold">
              Showing {products.length} Masterpiece{products.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-gray-500 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium border-b border-gray-300 focus:outline-none py-1"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-gray-400 font-serif">Curating catalog collection...</div>
          ) : products.length === 0 ? (
            <div className="py-16 sm:py-24 text-center border border-dashed border-gray-200 p-8 rounded-xl">
              <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">No Matching Leather Creations Found</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">Try broadening your search or clearing active filters.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                }}
                className="inline-block bg-leather text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
