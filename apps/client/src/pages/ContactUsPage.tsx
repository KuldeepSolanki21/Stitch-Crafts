import React, { useState } from 'react';

export const ContactUsPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 space-y-16">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-leather font-bold">Client Concierge</span>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Contact Our Atelier</h1>
        <p className="text-xs text-gray-500">Have an inquiry regarding bespoke commissions, monogramming, or order logistics?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="bg-white p-8 border border-gray-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto font-bold">✓</div>
              <h3 className="font-serif text-xl font-bold">Inquiry Received</h3>
              <p className="text-xs text-gray-500">Our concierge team will respond within 24 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border focus:outline-none focus:border-leather"
                />
              </div>
              <div>
                <label className="block uppercase font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border focus:outline-none focus:border-leather"
                />
              </div>
              <div>
                <label className="block uppercase font-semibold text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border focus:outline-none focus:border-leather"
                />
              </div>
              <div>
                <label className="block uppercase font-semibold text-gray-600 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 border focus:outline-none focus:border-leather"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-charcoal text-white py-3.5 uppercase font-bold tracking-widest text-[11px] hover:bg-leather transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8 text-sm text-gray-600">
          <div>
            <h4 className="font-serif font-bold text-base text-charcoal mb-2">Flagship Atelier</h4>
            <p>74 Artisan Boulevard, Indiranagar</p>
            <p>Bengaluru, Karnataka 560038, India</p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-charcoal mb-2">Direct Concierge</h4>
            <p>Email: <span className="font-semibold text-charcoal">concierge@stitchandcrafts.com</span></p>
            <p>Phone: <span className="font-semibold text-charcoal">+91 (080) 4920-8812</span></p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-charcoal mb-2">Artisan Hours</h4>
            <p>Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
            <p>Sunday: Closed for Leather Tanning Rest</p>
          </div>
        </div>
      </div>
    </div>
  );
};
