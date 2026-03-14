import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [images,     setImages]     = useState([]); // File objects
  const [previews,   setPreviews]   = useState([]); // URL strings
  const [saving,     setSaving]     = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', short_description: '',
    price: '', compare_price: '', cost_price: '',
    sku: '', product_type: 'physical',
    stock_quantity: '', low_stock_threshold: '5',
    category_id: '', brand: '', weight: '',
    tags: '', is_featured: false, is_active: true,
    digital_file_url: ''
  });

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
  };

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data));
    if (isEdit) {
      // Fetch product by id — we use admin list with filter as fallback
      API.get('/admin/products', { params: { limit: 1000 } }).then(r => {
        const p = r.data.products.find(x => String(x.id) === id);
        if (p) {
          setForm({
            name: p.name || '', description: p.description || '',
            short_description: p.short_description || '',
            price: p.price || '', compare_price: p.compare_price || '',
            cost_price: p.cost_price || '', sku: p.sku || '',
            product_type: p.product_type || 'physical',
            stock_quantity: p.stock_quantity || '',
            low_stock_threshold: p.low_stock_threshold || '5',
            category_id: p.category_id || '', brand: p.brand || '',
            weight: p.weight || '', tags: (p.tags || []).join(', '),
            is_featured: p.is_featured || false, is_active: p.is_active !== false,
            digital_file_url: p.digital_file_url || ''
          });
          if (p.images?.length) setPreviews(p.images.map(img => img.url));
        }
      });
    }
  }, [id, isEdit]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...urls]);
  };

  const removePreview = (i) => {
    setImages(prev => prev.filter((_, j) => j !== i));
    setPreviews(prev => prev.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach(img => fd.append('images', img));

    try {
      if (isEdit) {
        await API.put(`/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await API.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const Label = ({ children, required }) => (
    <label className="block text-xs font-medium text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isEdit ? 'Update product details' : 'Fill in the details to add a new product'}</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary ml-auto flex items-center gap-2">
          <FiSave size={15} /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main fields */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div>
              <Label required>Product Name</Label>
              <input value={form.name} onChange={set('name')} className="input-field" placeholder="e.g. iPhone 15 Pro Max" required />
            </div>
            <div>
              <Label>Short Description</Label>
              <input value={form.short_description} onChange={set('short_description')} className="input-field" placeholder="One-line summary shown on cards" />
            </div>
            <div>
              <Label>Full Description</Label>
              <textarea value={form.description} onChange={set('description')} rows={5} className="input-field resize-none" placeholder="Detailed product description…" />
            </div>
            <div>
              <Label>Tags</Label>
              <input value={form.tags} onChange={set('tags')} className="input-field" placeholder="Comma separated: tag1, tag2, tag3" />
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label required>Selling Price (₹)</Label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className="input-field" placeholder="0.00" required />
              </div>
              <div>
                <Label>MRP / Compare Price (₹)</Label>
                <input type="number" min="0" step="0.01" value={form.compare_price} onChange={set('compare_price')} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <Label>Cost Price (₹)</Label>
                <input type="number" min="0" step="0.01" value={form.cost_price} onChange={set('cost_price')} className="input-field" placeholder="0.00" />
              </div>
            </div>
            {form.compare_price && form.price && Number(form.compare_price) > Number(form.price) && (
              <p className="text-sm text-green-600">
                Discount: {Math.round(((form.compare_price - form.price) / form.compare_price) * 100)}% off
              </p>
            )}
          </div>

          {/* Inventory */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Type</Label>
                <select value={form.product_type} onChange={set('product_type')} className="input-field">
                  <option value="physical">📦 Physical Product</option>
                  <option value="digital">💻 Digital Product</option>
                </select>
              </div>
              <div>
                <Label>SKU</Label>
                <input value={form.sku} onChange={set('sku')} className="input-field" placeholder="e.g. SKU-001" />
              </div>
            </div>

            {form.product_type === 'physical' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock Quantity</Label>
                  <input type="number" min="0" value={form.stock_quantity} onChange={set('stock_quantity')} className="input-field" placeholder="0" />
                </div>
                <div>
                  <Label>Low Stock Alert (qty)</Label>
                  <input type="number" min="0" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} className="input-field" placeholder="5" />
                </div>
              </div>
            ) : (
              <div>
                <Label>Digital File URL</Label>
                <input value={form.digital_file_url} onChange={set('digital_file_url')} className="input-field" placeholder="https://drive.google.com/... or S3 link" />
                <p className="text-xs text-gray-400 mt-1">Customer receives this link after successful payment</p>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Product Images</h2>
            {/* Previews */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {previews.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => removePreview(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                      <FiX size={10} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-orange-500 text-white px-1 rounded">Main</span>}
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl p-8 cursor-pointer transition">
              <FiUpload size={24} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each (max 6)</p>
              <input type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
            </label>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">

          {/* Status */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Visibility</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Active / Visible</p>
                <p className="text-xs text-gray-400">Show product in store</p>
              </div>
              <div className="relative">
                <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="sr-only" />
                <div onClick={() => setForm(f => ({...f, is_active: !f.is_active}))}
                  className={`w-11 h-6 rounded-full cursor-pointer transition ${form.is_active ? 'bg-orange-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Featured</p>
                <p className="text-xs text-gray-400">Show on homepage</p>
              </div>
              <div className="relative">
                <div onClick={() => setForm(f => ({...f, is_featured: !f.is_featured}))}
                  className={`w-11 h-6 rounded-full cursor-pointer transition ${form.is_featured ? 'bg-orange-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </label>
          </div>

          {/* Organization */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Organization</h2>
            <div>
              <Label>Category</Label>
              <select value={form.category_id} onChange={set('category_id')} className="input-field text-sm">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Brand</Label>
              <input value={form.brand} onChange={set('brand')} className="input-field text-sm" placeholder="e.g. Apple, Nike" />
            </div>
            {form.product_type === 'physical' && (
              <div>
                <Label>Weight (kg)</Label>
                <input type="number" min="0" step="0.01" value={form.weight} onChange={set('weight')} className="input-field text-sm" placeholder="0.00" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end gap-3 pb-6">
        <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8">
          <FiSave size={15} /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
