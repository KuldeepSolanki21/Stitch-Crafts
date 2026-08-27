import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/admin-api.client';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@stitchandcrafts.com');
  const [password, setPassword] = useState('Admin@StitchCrafts2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      const { accessToken, user } = res.data.data;
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        setError('Access denied: Staff credentials required.');
        setLoading(false);
        return;
      }
      localStorage.setItem('adminAccessToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors.map((e: any) => e.message).join(' | '));
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-charcoal">STITCH & CRAFTS</h1>
          <p className="text-xs uppercase tracking-widest text-admin-primary font-bold">Admin Atelier Control</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Staff Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-admin-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Master Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-admin-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm focus:outline-none"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-admin-primary text-white py-3 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-leather-dark transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Control Desk'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[11px] text-gray-400">
            Default credentials: <span className="font-mono text-gray-600">admin@stitchandcrafts.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};
