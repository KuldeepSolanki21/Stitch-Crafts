import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/admin-api.client';

export const ReviewsManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReviews();
      setReviews(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveReview(id);
      fetchReviews();
    } catch (e) {
      alert('Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.rejectReview(id);
      fetchReviews();
    } catch (e) {
      alert('Rejection failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete review permanently?')) return;
    try {
      await adminApi.deleteReview(id);
      fetchReviews();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews Moderation</h2>
          <p className="text-sm text-gray-500">Review, verify and publish client feedback on leather goods</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Reviewer</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Feedback</th>
              <th className="p-4">Buyer Status</th>
              <th className="p-4">Approval</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No reviews found.</td></tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-900">{r.product?.title}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{r.user?.name}</p>
                    <p className="text-xs text-gray-400">{r.user?.email}</p>
                  </td>
                  <td className="p-4 text-yellow-600 font-bold">★ {r.rating}.0</td>
                  <td className="p-4 max-w-xs text-xs text-gray-600">
                    {r.title && <p className="font-bold text-gray-800">{r.title}</p>}
                    <p className="line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs rounded font-semibold ${
                      r.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.isVerified ? 'Verified Buyer' : 'Public'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      r.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.isApproved ? 'Published' : 'Under Review'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {!r.isApproved ? (
                      <button onClick={() => handleApprove(r.id)} className="text-green-600 font-bold hover:underline">Approve</button>
                    ) : (
                      <button onClick={() => handleReject(r.id)} className="text-amber-600 font-bold hover:underline">Unpublish</button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline ml-2">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
