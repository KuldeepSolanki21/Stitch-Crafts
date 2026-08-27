import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/product.api';
import { apiClient } from '../services/api.client';
import { ProductCard } from '../components/product/ProductCard';

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    productApi.getProducts({ sort: 'newest' }).then((res) => setFeatured(res.data.data)).catch(console.error);
    productApi.getCategories().then((res) => setCategories(res.data.data)).catch(console.error);
    apiClient.get('/banners').then((res) => {
      if (res.data.data && res.data.data.length > 0) {
        setBanners(res.data.data);
      }
    }).catch(console.error);
  }, []);

  const defaultBanners = [
    {
      title: 'Crafted for Every Journey',
      subtitle: 'Full-grain vegetable tanned luxury leather goods, hand-stitched by generational artisans.',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1800&auto=format&fit=crop',
      targetUrl: '/shop',
    },
    {
      title: 'The Patina Heritage Collection',
      subtitle: 'Heirloom document briefcases and weekender duffles that mature with age.',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1800&auto=format&fit=crop',
      targetUrl: '/shop',
    },
    {
      title: 'Bespoke Pueblo Wallets & Belts',
      subtitle: 'Cut from premium Italian Badalassi Carlo hide with natural beeswax burnishing.',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1800&auto=format&fit=crop',
      targetUrl: '/shop',
    },
  ];

  const activeBanners = banners.length > 0 ? banners : defaultBanners;

  // Auto slide banner every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await apiClient.post('/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Subscription failed');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 sm:pb-24">
      {/* Animated Cinematic Hero Carousel */}
      <section className="relative h-[65vh] sm:h-[80vh] min-h-[460px] bg-charcoal text-white overflow-hidden">
        {activeBanners.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.42] scale-105 transition-transform duration-[6000ms]"
            />
            <div className="relative z-10 h-full flex items-center justify-center text-center px-4 sm:px-6">
              <div className="max-w-3xl space-y-4 sm:space-y-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-brass font-bold inline-block">
                  Generational Craftsmanship
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-wide leading-tight text-parchment drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-xl mx-auto font-light leading-relaxed px-2">
                  {slide.subtitle}
                </p>
                <div className="pt-2 sm:pt-4">
                  <Link
                    to={slide.targetUrl || '/shop'}
                    className="inline-block bg-brass text-charcoal hover:bg-white px-7 sm:px-10 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] transition duration-300 shadow-2xl"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center text-base sm:text-xl transition"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center text-base sm:text-xl transition"
            >
              ›
            </button>
            {/* Carousel Dots Indicator */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'bg-brass w-6 sm:w-8' : 'bg-white/50 w-2 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Featured Masterpieces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-leather font-bold">Handpicked Silhouettes</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-charcoal">Featured Creations</h2>
          <p className="text-xs sm:text-sm text-gray-500">Each piece is cut from the densest full-grain hides and stitched with waxed thread.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {featured.length > 0 && (
          <div className="text-center pt-8 sm:pt-10">
            <Link
              to="/shop"
              className="inline-block border-2 border-charcoal text-charcoal px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition"
            >
              Explore Complete Catalog ({featured.length} Creations) →
            </Link>
          </div>
        )}
      </section>

      {/* Craftsmanship Narrative */}
      <section className="bg-charcoal text-parchment py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-4 sm:space-y-6">
            <span className="text-xs uppercase tracking-widest text-brass font-bold">The Stitch & Crafts Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              An Heirloom That Matures With Time
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Unlike mass-manufactured bonded leather that degrades within months, our creations are forged exclusively from 100% full-grain vegetable-tanned hides.
            </p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Every scratch, sunlight exposure, and natural oil absorption enriches the leather, forging an irreplaceable golden-amber patina unique to your journey.
            </p>
            <div className="pt-2 sm:pt-4">
              <Link to="/about" className="text-xs font-bold uppercase tracking-widest text-brass hover:underline">
                Discover Our Atelier Story →
              </Link>
            </div>
          </div>
          <div className="aspect-[4/3] bg-leather-dark overflow-hidden border border-brass/20 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop"
              alt="Artisan Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Atelier Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-leather font-bold">Curated Silhouettes</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">Shop by Collection</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {categories.slice(0, 3).map((cat) => (
            <div key={cat.id} className="group relative h-80 sm:h-96 overflow-hidden shadow-sm">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">{cat.name}</h3>
                <Link to={`/shop?category=${cat.slug}`} className="text-xs uppercase tracking-widest text-brass font-bold hover:underline">
                  Browse Atelier →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Atelier */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 sm:space-y-6 bg-parchment p-6 sm:p-12 border border-leather/10">
          <span className="text-xs uppercase tracking-widest text-leather font-bold">Privé Circle</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">Subscribe to The Artisan Gazette</h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Receive exclusive early access to small-batch leather drops, seasonal releases, and bespoke care masterclasses.
          </p>
          {newsletterSubscribed ? (
            <p className="text-green-800 font-bold text-sm">✓ Thank you for subscribing to our luxury newsletter.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-xs focus:outline-none focus:border-leather"
              />
              <button type="submit" className="bg-charcoal text-white px-8 py-3 text-xs uppercase font-bold tracking-widest hover:bg-leather transition">
                Join
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Flagship Atelier Location & Interactive Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-3">
          {/* Atelier Details */}
          <div className="p-6 sm:p-10 space-y-4 sm:space-y-6 flex flex-col justify-center bg-parchment-light">
            <span className="text-xs uppercase tracking-widest text-leather font-bold">Visit Our Flagship</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">The Atelier & Showroom</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Experience the tactile luxury of full-grain vegetable tanned hides in person. Consult with our master leathercraft artisans for bespoke monograms and custom commissions.
            </p>

            <div className="space-y-2.5 text-xs text-gray-700 pt-2">
              <div className="flex items-start space-x-2">
                <span className="text-leather font-bold">📍</span>
                <span>74 Artisan Boulevard, Indiranagar, Bengaluru, Karnataka 560038</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-leather font-bold">⏱</span>
                <span>Mon – Sat: 10:00 AM – 7:00 PM IST (Sun: Closed)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-leather font-bold">📞</span>
                <span>+91 (080) 4920-8812</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Indiranagar,+Bengaluru"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-charcoal text-white px-6 py-3 text-[11px] uppercase font-bold tracking-widest hover:bg-leather transition"
              >
                Get Directions →
              </a>
            </div>
          </div>

          {/* Interactive Google Maps Embed */}
          <div className="lg:col-span-2 h-72 sm:h-96 lg:h-auto min-h-[280px] sm:min-h-[380px] bg-gray-200">
            <iframe
              title="Stitch & Crafts Flagship Atelier Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9855523912196!2d77.6388484758779!3d12.972778814856697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a771146313%3A0x6a21396a84d4b3b2!2sIndiranagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
