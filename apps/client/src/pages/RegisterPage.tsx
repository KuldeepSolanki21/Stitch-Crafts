import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth.api';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, phone: phone || undefined });
      localStorage.setItem('customerAccessToken', res.data.data.accessToken);
      localStorage.setItem('customerUser', JSON.stringify(res.data.data.user));
      navigate('/profile');
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorList = err.response.data.errors.map((e: any) => e.message).join(' | ');
        setError(errorList);
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="bg-white p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6 rounded-2xl">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">Join the Atelier</h1>
          <p className="text-xs text-gray-500">Create an account for personalized luxury service</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kuldeep Solanki"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg text-xs sm:text-sm focus:border-leather focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg text-xs sm:text-sm focus:border-leather focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">Phone (Optional)</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg text-xs sm:text-sm focus:border-leather focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. Secret@123"
                className="w-full px-4 py-2.5 border rounded-lg text-xs sm:text-sm focus:border-leather focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm focus:outline-none"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Must be at least 8 characters with 1 uppercase letter (A-Z) and 1 number (0-9).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-leather transition disabled:opacity-50 rounded-lg shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 border-t pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-leather font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
