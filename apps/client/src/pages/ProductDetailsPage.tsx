import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../services/product.api';
import { cartApi } from '../services/cart.api';
import { wishlistApi } from '../services/wishlist.api';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addingCart, setAddingCart] = useState<boolean>(false);
  const [buyingNow, setBuyingNow] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProductBySlug(slug);
        const p = res.data.data;
        setProduct(p);
        setSelectedImage(p.images[0] || '');
        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
        const relRes = await productApi.getRelatedProducts(p.id);
        setRelated(relRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('customerAccessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setAddingCart(true);
    try {
      await cartApi.addItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity,
      });
      navigate('/cart');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item to bag');
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('customerAccessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setBuyingNow(true);
    try {
      await cartApi.addItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity,
      });
      navigate('/checkout');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate purchase');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('customerAccessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product.id);
        setIsWishlisted(false);
      } else {
        await wishlistApi.addToWishlist(product.id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto py-24 text-center font-serif text-gray-400">Loading bespoke details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-leather underline">Return to Shop Catalog</Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.finalPrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 overflow-hidden border border-gray-200 shadow-sm relative">
            <img src={selectedImage} alt={product.title} className="w-full h-full object-cover" />
            <button
              onClick={handleToggleWishlist}
              aria-label="Wishlist Button"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-xl transition hover:scale-110"
            >
              {isWishlisted ? <span className="text-red-500">♥</span> : <span className="text-gray-500 hover:text-red-500">♡</span>}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 border-2 ${selectedImage === img ? 'border-leather' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details & Purchasing Actions */}
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-leather font-semibold">
            {product.category?.name} • SKU: {selectedVariant ? selectedVariant.sku : product.sku}
          </span>
          <h1 className="text-3xl font-serif font-bold text-charcoal">{product.title}</h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-charcoal">₹{currentPrice.toLocaleString()}</span>
            {product.discountPrice && (
              <span className="text-base text-gray-400 line-through">₹{product.discountPrice.toLocaleString()}</span>
            )}
            <span className={`text-xs px-2.5 py-1 uppercase tracking-wider font-semibold rounded ${
              product.availability === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {product.availability.replace('_', ' ')}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal">Leather Finish & Color</h4>
              <div className="flex gap-3">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.images && v.images.length > 0) setSelectedImage(v.images[0]);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 border text-xs font-semibold ${
                      selectedVariant?.id === v.id ? 'border-leather bg-leather/5 text-leather' : 'border-gray-300'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: v.colorHex }}></span>
                    <span>{v.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Purchasing Actions */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold uppercase tracking-widest text-charcoal">Quantity:</span>
              <div className="flex items-center border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingCart}
                className="w-full border-2 border-charcoal text-charcoal py-4 text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition disabled:opacity-50"
              >
                {addingCart ? 'Adding to Bag...' : 'Add to Bag'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buyingNow}
                className="w-full bg-leather text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-leather-dark transition shadow-lg disabled:opacity-50"
              >
                {buyingNow ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>

          {/* Specifications */}
          {product.details && (
            <div className="pt-6 border-t border-gray-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal mb-3">Specifications</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                {Object.entries(product.details).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-semibold text-charcoal capitalize">{key}: </span>
                    <span>{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-24 border-t border-leather/10 pt-16">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">Related Creations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
