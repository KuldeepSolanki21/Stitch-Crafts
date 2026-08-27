import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../../services/cart.api';
import { wishlistApi } from '../../services/wishlist.api';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    discountPercentage?: number;
    images: string[];
    category?: { name: string };
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const navigate = useNavigate();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('customerAccessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setAddingCart(true);
    try {
      await cartApi.addItem({ productId: product.id, quantity: 1 });
      navigate('/cart');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <div className="group bg-white p-3.5 sm:p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative rounded-xl">
      <div>
        <div className="aspect-square bg-gray-50 mb-3 sm:mb-4 overflow-hidden relative rounded-lg">
          <Link to={`/product/${product.slug}`}>
            <img
              src={product.images[0] || 'https://via.placeholder.com/400'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-leather text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase rounded">
              {product.discountPercentage}% OFF
            </span>
          ) : null}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            aria-label="Toggle Wishlist"
            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-charcoal hover:text-red-500 shadow-md transition"
          >
            {isWishlisted ? (
              <span className="text-red-500 text-sm sm:text-base">♥</span>
            ) : (
              <span className="text-gray-600 text-sm sm:text-base hover:text-red-500">♡</span>
            )}
          </button>
        </div>

        <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-leather font-semibold mb-1 truncate">
          {product.category?.name || 'Leather Creation'}
        </p>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-serif text-sm sm:text-base font-bold text-charcoal group-hover:text-leather transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3 mt-1.5 sm:mt-2 mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm font-bold text-charcoal">₹{product.price.toLocaleString()}</span>
          {product.discountPrice && (
            <span className="text-[11px] sm:text-xs text-gray-400 line-through">₹{product.discountPrice.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Quick Add To Bag Button */}
      <button
        onClick={handleQuickAdd}
        disabled={addingCart}
        className="w-full bg-charcoal text-white py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-leather transition duration-300 disabled:opacity-50 rounded"
      >
        {addingCart ? 'Adding...' : 'Add to Bag'}
      </button>
    </div>
  );
};
