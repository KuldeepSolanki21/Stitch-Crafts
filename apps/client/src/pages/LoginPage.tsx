import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth.api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('customerAccessToken', res.data.data.accessToken);
      localStorage.setItem('customerUser', JSON.stringify(res.data.data.user));
      navigate('/profile');
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
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-charcoal">Sign In</h1>
          <p className="text-xs text-gray-500">Access your saved creations, addresses and order invoices</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border text-sm focus:border-leather focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border text-sm focus:border-leather focus:outline-none pr-10"
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
            className="w-full bg-charcoal text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-leather transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 border-t pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-leather font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
