import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../services/order.api';
import { authApi } from '../services/auth.api';
import { cartApi } from '../services/cart.api';

export const CheckoutPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    isDefault: true,
  });

  const [cart, setCart] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'COD' | 'RAZORPAY' | 'STRIPE'>('COD');
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const navigate = useNavigate();

  const loadInitialData = async () => {
    try {
      const [addrRes, cartRes] = await Promise.all([
        authApi.getAddresses(),
        cartApi.getCart(),
      ]);

      const addrs = addrRes.data.data;
      setAddresses(addrs);
      setCart(cartRes.data.data);

      if (addrs.length > 0) {
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        setSelectedAddressId(def.id);
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Update checkout financial preview
  useEffect(() => {
    if (!selectedAddressId) return;
    orderApi.getCheckoutPreview({
      addressId: selectedAddressId,
      couponCode: couponCode || null,
      paymentProvider,
    })
      .then((res) => setSummary(res.data.data))
      .catch(console.error);
  }, [selectedAddressId, couponCode, paymentProvider]);

  const handleSaveInlineAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      alert('Please fill all required address fields');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await authApi.addAddress(newAddress);
      const savedAddr = res.data.data;
      const updatedList = [...addresses, savedAddr];
      setAddresses(updatedList);
      setSelectedAddressId(savedAddr.id);
      setShowNewAddressForm(false);
      setNewAddress({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN',
        isDefault: false,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or enter a shipping delivery address');
      return;
    }

    setLoading(true);
    try {
      const res = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod: paymentProvider,
        couponCode: couponCode || undefined,
      });

      const order = res.data.data;
      navigate(`/order-success?orderId=${order.id}`);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const displaySubtotal = summary ? summary.subtotal : cart?.subtotal || 0;
  const displayDiscount = summary ? summary.discountAmount : 0;
  const displayShipping = summary ? summary.shippingFee : cart?.shippingFee || 0;
  const displayTax = summary ? summary.taxAmount : cart?.taxAmount || 0;
  const displayTotal = summary ? summary.totalAmount : cart?.totalAmount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-6 sm:mb-8 text-charcoal">Checkout Experience</h1>

      {cart && cart.items?.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-300 p-8 sm:p-12 rounded-xl">
          <p className="font-serif text-base sm:text-lg text-gray-500 mb-4">Your bag is empty.</p>
          <Link to="/shop" className="inline-block bg-leather text-white px-8 py-3 text-xs uppercase tracking-widest font-bold rounded">
            Explore Handcrafted Creations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* 1. Delivery Address Section */}
            <div className="bg-white p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-charcoal">1. Delivery Address</h3>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm((prev) => !prev)}
                    className="text-xs uppercase tracking-wider font-bold text-leather hover:underline"
                  >
                    {showNewAddressForm ? 'Select Saved Address' : '+ Add New Address'}
                  </button>
                )}
              </div>

              {/* Saved Address Selection */}
              {!showNewAddressForm && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`block p-3.5 sm:p-4 border rounded-lg cursor-pointer transition ${
                        selectedAddressId === a.id ? 'border-leather bg-leather/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start sm:items-center space-x-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="accent-leather mt-1 sm:mt-0"
                        />
                        <div className="text-xs text-gray-700">
                          <p className="font-bold text-sm text-charcoal">{a.addressLine1}</p>
                          {a.addressLine2 && <p>{a.addressLine2}</p>}
                          <p>{a.city}, {a.state} - {a.postalCode}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Inline New Address Form */}
              {showNewAddressForm && (
                <form onSubmit={handleSaveInlineAddress} className="space-y-3 sm:space-y-4 pt-2">
                  <p className="text-xs text-gray-500 font-medium">Enter your delivery address:</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address / House No / Landmark *"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="w-full px-3.5 py-2.5 border text-xs focus:outline-none focus:border-leather rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Apartment, Suite, Unit (Optional)"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      className="w-full px-3.5 py-2.5 border text-xs focus:outline-none focus:border-leather rounded"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 border text-xs focus:outline-none focus:border-leather rounded"
                    />
                    <input
                      type="text"
                      placeholder="State / Province *"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 border text-xs focus:outline-none focus:border-leather rounded"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="PIN / Postal Code *"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 border text-xs focus:outline-none focus:border-leather rounded"
                    />
                    <input
                      type="text"
                      disabled
                      value="India (IN)"
                      className="w-full px-3.5 py-2.5 border text-xs bg-gray-50 text-gray-500 cursor-not-allowed rounded"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="w-full sm:w-auto bg-charcoal text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-leather transition rounded"
                  >
                    {savingAddress ? 'Saving...' : 'Save & Use This Address'}
                  </button>
                </form>
              )}
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4 rounded-xl">
              <h3 className="font-serif font-bold text-base sm:text-lg border-b pb-3 text-charcoal">2. Payment Method</h3>
              <div className="space-y-3">
                {[
                  { id: 'COD', label: 'Cash on Delivery (Pay upon arrival at your doorstep)' },
                  { id: 'RAZORPAY', label: 'Razorpay Secure (UPI, Credit/Debit Cards, NetBanking)' },
                  { id: 'STRIPE', label: 'Stripe Global (International Cards)' },
                ].map((p) => (
                  <label
                    key={p.id}
                    className={`block p-3.5 sm:p-4 border rounded-lg cursor-pointer transition ${
                      paymentProvider === p.id ? 'border-leather bg-leather/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentProvider === p.id}
                        onChange={() => setPaymentProvider(p.id as any)}
                        className="accent-leather"
                      />
                      <span className="font-semibold text-xs text-charcoal">{p.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white p-5 sm:p-6 border border-gray-200 h-fit space-y-4 shadow-sm rounded-xl">
            <h3 className="font-serif font-bold text-base sm:text-lg border-b pb-3 text-charcoal">Order Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-charcoal">₹{displaySubtotal.toLocaleString()}</span>
              </div>
              {displayDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-₹{displayDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span className="font-semibold text-charcoal">{displayShipping === 0 ? 'FREE' : `₹${displayShipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-charcoal">₹{displayTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold border-t pt-3 text-charcoal">
                <span>Total Amount:</span>
                <span className="text-leather">₹{displayTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="block text-[11px] font-semibold uppercase text-gray-600">Promotional Coupon</label>
              <input
                type="text"
                placeholder="e.g. WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full p-2.5 border uppercase text-xs font-mono focus:outline-none focus:border-leather rounded"
              />
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-leather text-white py-3.5 sm:py-4 font-bold uppercase tracking-widest text-xs hover:bg-leather-dark transition shadow-lg disabled:opacity-50 mt-4 rounded"
            >
              {loading ? 'Processing Order...' : paymentProvider === 'COD' ? 'Confirm Order (Cash on Delivery)' : 'Proceed to Payment'}
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-tight">
              By confirming, you agree to the Stitch & Crafts Terms of Service & Lifetime Patina Guarantee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
