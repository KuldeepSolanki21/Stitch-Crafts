import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../services/cart.api';

export const CartPage: React.FC = () => {
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      setCart(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (itemId: string, qty: number) => {
    if (qty < 1 || updatingItemId === itemId) return;
    setUpdatingItemId(itemId);
    try {
      const res = await cartApi.updateQuantity(itemId, qty);
      setCart(res.data.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (updatingItemId === itemId) return;
    setUpdatingItemId(itemId);
    try {
      const res = await cartApi.removeItem(itemId);
      setCart(res.data.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Remove failed');
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) return <div className="py-24 text-center font-serif text-gray-400">Loading bespoke luggage cart...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-8">Shopping Cart</h1>

      {!cart || cart.items?.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-300 p-12">
          <p className="font-serif text-lg text-gray-500 mb-4">Your leather collection cart is currently empty.</p>
          <Link to="/shop" className="inline-block bg-leather text-white px-8 py-3 text-xs uppercase tracking-widest font-bold">
            Explore Handcrafted Creations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex gap-6 bg-white p-6 border border-gray-100 shadow-sm items-center">
                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover border" />
                <div className="flex-1">
                  <Link to={`/product/${item.slug}`} className="font-serif font-bold text-base hover:text-leather">
                    {item.title}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-gray-500 mt-0.5">Finish: {item.variant.colorName} ({item.variant.sku})</p>
                  )}
                  <p className="text-sm font-bold text-charcoal mt-2">₹{item.unitPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    disabled={updatingItemId === item.id || item.quantity <= 1}
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 border text-sm font-bold disabled:opacity-30 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    disabled={updatingItemId === item.id}
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    className="w-8 h-8 border text-sm font-bold disabled:opacity-30 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="font-bold text-base">₹{item.itemTotal.toLocaleString()}</p>
                  <button
                    disabled={updatingItemId === item.id}
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-red-500 hover:underline mt-2 inline-block disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white p-6 border border-gray-200 h-fit space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-lg border-b pb-3">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{cart.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping (Free over ₹5,000):</span>
              <span className="font-semibold">{cart.shippingFee === 0 ? 'FREE' : `₹${cart.shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated GST Tax (18%):</span>
              <span className="font-semibold">₹{cart.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-4">
              <span>Estimated Total:</span>
              <span className="text-leather">₹{cart.totalAmount.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              disabled={!cart.isCheckoutValid}
              className="w-full bg-leather text-white py-3.5 font-bold uppercase tracking-widest text-xs hover:bg-leather-dark transition disabled:opacity-50"
            >
              Proceed to Secure Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
