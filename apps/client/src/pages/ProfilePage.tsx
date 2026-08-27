import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/auth.api';
import { orderApi } from '../services/order.api';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    isDefault: false,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, addrRes, ordersRes] = await Promise.all([
        authApi.getProfile(),
        authApi.getAddresses(),
        orderApi.getMyOrders(),
      ]);
      setUser(profileRes.data.data);
      setAddresses(addrRes.data.data);
      setOrders(ordersRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    localStorage.removeItem('customerAccessToken');
    localStorage.removeItem('customerUser');
    navigate('/login');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.addAddress(newAddress);
      setShowAddModal(false);
      setNewAddress({ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'IN', isDefault: false });
      loadData();
    } catch (err: any) {

      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await authApi.deleteAddress(id);
      loadData();
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="py-24 text-center font-serif text-gray-400">Loading your bespoke atelier file...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center border-b pb-6 mb-12">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Patron Account</h1>
          <p className="text-xs text-gray-500 mt-1">Welcome back, {user?.name} ({user?.email})</p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-charcoal text-charcoal px-5 py-2 text-xs uppercase tracking-widest font-bold hover:bg-charcoal hover:text-white transition"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Addresses Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-serif font-bold text-lg text-charcoal">Saved Addresses</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold uppercase text-leather hover:underline"
            >
              + Add New
            </button>
          </div>

          <div className="space-y-4">
            {addresses.length === 0 ? (
              <p className="text-xs text-gray-400">No saved addresses yet.</p>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="p-4 bg-white border border-gray-200 text-xs space-y-1 relative">
                  <p className="font-semibold text-charcoal">{a.addressLine1}</p>
                  {a.addressLine2 && <p className="text-gray-500">{a.addressLine2}</p>}
                  <p className="text-gray-500">{a.city}, {a.state} - {a.postalCode}</p>
                  <button
                    onClick={() => handleDeleteAddress(a.id)}
                    className="text-red-500 font-bold hover:underline pt-2 inline-block"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders Overview */}
        <div className="md:col-span-2 space-y-6">
          <div className="border-b pb-2">
            <h3 className="font-serif font-bold text-lg text-charcoal">Recent Invoices & Orders</h3>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed">
                <p className="text-sm text-gray-500 mb-2">No orders placed yet.</p>
                <Link to="/shop" className="text-xs uppercase font-bold text-leather underline">Explore Catalog</Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-5 bg-white border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-mono text-xs text-gray-400">#{o.id.substring(0, 8)}</p>
                    <p className="font-bold text-sm text-charcoal mt-1">₹{Number(o.totalAmount).toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-leather/10 text-leather uppercase">
                      {o.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <Link to={`/orders/${o.id}`} className="text-xs font-bold uppercase tracking-wider text-charcoal hover:text-leather underline">
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Address Line 1"
                required
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                className="w-full p-2.5 border"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                className="w-full p-2.5 border"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full p-2.5 border"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full p-2.5 border"
                />
              </div>
              <input
                type="text"
                placeholder="Postal Code"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="w-full p-2.5 border"
              />
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="bg-charcoal text-white px-6 py-2 uppercase font-bold tracking-widest text-[11px]">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
