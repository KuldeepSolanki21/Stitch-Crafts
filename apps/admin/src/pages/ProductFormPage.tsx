import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../services/admin-api.client';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [imageUrlInput, setImageUrlInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sku: '',
    price: '' as string | number,
    discountPrice: '' as string | number,
    stock: '' as string | number,
    categoryId: '',
    images: [] as string[],
    featured: false,
    isPublished: true,
    details: {
      material: '100% Full-Grain Vegetable Tanned Leather',
      dimensions: '40 x 30 x 10 cm',
      lining: 'Suede Finish',
      careInstructions: 'Condition every 6 months with beeswax polish',
    },
    variants: [] as any[],
  });

  const [newVariant, setNewVariant] = useState({
    colorName: 'Cognac Tan',
    colorHex: '#8B4513',
    size: '15-inch',
    sku: '',
    priceDelta: 0,
    stock: 10,
    images: [] as string[],
  });

  useEffect(() => {
    adminApi.getCategories().then((res) => setCategories(res.data.data));
    if (id) {
      adminApi.getProductById(id).then((res) => {
        const p = res.data.data;
        setFormData({
          title: p.title,
          description: p.description,
          sku: p.sku,
          price: p.price,
          discountPrice: p.discountPrice || '',
          stock: p.stock,
          categoryId: p.categoryId,
          images: p.images || [],
          featured: p.featured,
          isPublished: p.isPublished,
          details: p.details || {},
          variants: p.variants || [],
        });
      });
    }
  }, [id]);

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http://') && !imageUrlInput.startsWith('https://')) {
      alert('Please enter a valid HTTP/HTTPS image URL');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const data = new FormData();
    data.append('file', file);

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(data);
      const uploadedUrl = res.data.data.url;
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, uploadedUrl],
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Image upload failed. You can also paste an Image URL.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = () => {
    if (!newVariant.colorName || !newVariant.sku) {
      alert('Please provide Variant Color Name and SKU');
      return;
    }
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          ...newVariant,
          images: formData.images.length > 0 ? [formData.images[0]] : [],
        },
      ],
    });
    setNewVariant({
      colorName: '',
      colorHex: '#8B4513',
      size: '',
      sku: '',
      priceDelta: 0,
      stock: 10,
      images: [],
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.images.length === 0) {
      setErrorMessage('Product Images: Please add at least 1 product image URL or upload a photo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        title: formData.title,
        description: formData.description,
        sku: formData.sku,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock) || 0,
        categoryId: formData.categoryId,
        images: formData.images,
        featured: formData.featured,
        isPublished: formData.isPublished,
        details: formData.details,
      };

      if (!id) {
        payload.variants = formData.variants;
        await adminApi.createProduct(payload);
      } else {
        await adminApi.updateProduct(id, payload);
      }
      navigate('/products');
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const list = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | ');
        setErrorMessage(list);
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to save product');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{id ? 'Edit Leather Creation' : 'Add New Handcrafted Creation'}</h2>
          <p className="text-xs text-gray-500">Configure master catalog specs, high-res leather imagery, and variant pricing</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium leading-relaxed shadow-sm">
          <span className="font-bold">⚠️ Form Errors: </span>{errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">1. Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sovereign Messenger Bag"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Detail the leather tanning, craftsmanship, grain texture, and internal compartments..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="SC-BAG-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border rounded-lg text-sm font-mono focus:border-leather focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Regular Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="14500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Discount Price (₹) (Optional)
              </label>
              <input
                type="number"
                placeholder="11999"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="25"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Product Images & Gallery Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                2. Product Images & Gallery <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-gray-500">Add high-resolution photography URLs or upload image files</p>
            </div>
            <span className="text-xs font-bold text-leather">{formData.images.length} Image(s) Added</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Add via URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-gray-600">Option A: Paste Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-xs focus:border-leather focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="bg-gray-800 text-white px-4 py-2 text-xs font-bold rounded-lg hover:bg-leather transition"
                >
                  + Add URL
                </button>
              </div>
            </div>

            {/* Upload File */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-gray-600">Option B: Upload Image File</label>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={handleFileUpload}
                className="w-full px-3 py-1.5 border rounded-lg text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              {uploadingImage && <p className="text-xs text-leather font-medium animate-pulse">Uploading photo...</p>}
            </div>
          </div>

          {/* Image Thumbnails Gallery Preview */}
          {formData.images.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed rounded-xl border-gray-200">
              <p className="text-xs text-gray-400">No images added yet. Please add at least 1 image URL or file above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group shadow-sm bg-gray-50">
                  <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center opacity-80 hover:opacity-100 transition shadow"
                  >
                    ×
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Artisan Specifications */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">3. Artisan Leather Specifications</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Material</label>
              <input
                type="text"
                placeholder="100% Full-Grain Vegetable Tanned Leather"
                value={formData.details.material}
                onChange={(e) => setFormData({ ...formData, details: { ...formData.details, material: e.target.value } })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Dimensions</label>
              <input
                type="text"
                placeholder="40 x 30 x 10 cm"
                value={formData.details.dimensions}
                onChange={(e) => setFormData({ ...formData, details: { ...formData.details, dimensions: e.target.value } })}
                className="w-full p-2.5 border rounded-lg text-sm focus:border-leather focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Variants Matrix */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">4. Product Variants Matrix (Optional)</h3>
          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Color Name (e.g. Cognac)"
              value={newVariant.colorName}
              onChange={(e) => setNewVariant({ ...newVariant, colorName: e.target.value })}
              className="p-2 border rounded text-xs"
            />
            <input
              type="text"
              placeholder="Hex (#8B4513)"
              value={newVariant.colorHex}
              onChange={(e) => setNewVariant({ ...newVariant, colorHex: e.target.value })}
              className="p-2 border rounded text-xs"
            />
            <input
              type="text"
              placeholder="Variant SKU (e.g. SC-01-COG)"
              value={newVariant.sku}
              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value.toUpperCase() })}
              className="p-2 border rounded text-xs"
            />
            <button
              type="button"
              onClick={handleAddVariant}
              className="bg-gray-800 text-white text-xs font-bold py-2 rounded hover:bg-leather transition"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {formData.variants.map((v, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                <div className="flex items-center space-x-3">
                  <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: v.colorHex }}></span>
                  <span className="font-semibold">{v.colorName}</span>
                  <span className="text-gray-500 font-mono text-xs">({v.sku})</span>
                </div>
                <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 text-xs font-bold hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Publishing Status */}
        <div className="flex items-center space-x-6 bg-white p-4 rounded-xl border border-gray-100">
          <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 accent-leather"
            />
            <span>Published on Customer Storefront</span>
          </label>
          <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 accent-leather"
            />
            <span>Featured Luxury Collection</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-admin-primary text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-leather-dark transition shadow-lg disabled:opacity-50"
        >
          {loading ? 'Publishing...' : id ? 'Update Master Product' : 'Publish Product to Catalog'}
        </button>
      </form>
    </div>
  );
};
