import React from 'react';
import { Link } from 'react-router-dom';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-24">
      <section className="bg-charcoal text-parchment py-24 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-brass font-bold">Heritage & Soul</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wide">The Stitch & Crafts Atelier</h1>
          <p className="text-sm text-gray-300 max-w-xl mx-auto font-light leading-relaxed">
            Preserving timeless hand-stitching techniques and honoring full-grain vegetable tanned hides since inception.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden shadow-lg border border-gray-200">
          <img
            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop"
            alt="Artisan at work"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-leather font-bold">Philosophy of Uncompromising Quality</span>
          <h2 className="text-3xl font-serif font-bold text-charcoal leading-tight">
            Hand-Cut, Saddle-Stitched, Never Bonded.
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-light">
            In an era of disposable fashion and synthetic plastic finishes, Stitch & Crafts was conceived as an homage to authentic leather goods that outlive their owners.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed font-light">
            Every briefcase, messenger bag, and wallet is saddle-stitched by master artisans using two needles on a single waxed thread. If a single loop ever breaks, the remaining seam will never unravel.
          </p>
          <div className="pt-4">
            <Link to="/shop" className="inline-block bg-leather text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-leather-dark transition">
              Explore Our Creations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
