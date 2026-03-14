import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiTruck, FiDownload, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import API from '../../utils/api';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [mainImg, setMainImg]   = useState(0);
  const [qty,     setQty]       = useState(1);
  const [adding,  setAdding]    = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/products/${slug}`)
      .then(r => setProduct(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="page-container py-10">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-gray-200 h-96 rounded-xl" />
        <div className="space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded" /><div className="h-4 bg-gray-200 rounded w-2/3" /></div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="page-container py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Product not found</h2>
      <Link to="/products" className="btn-primary inline-block mt-4">Back to Products</Link>
    </div>
  );

  const images    = product.images?.length ? product.images : [{ url: 'https://via.placeholder.com/500?text=No+Image' }];
  const isDigital = product.product_type === 'digital';
  const discount  = product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, qty);
    setAdding(false);
  };

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/products" className="hover:text-orange-500">Products</Link>
        {product.category_name && <>
          <FiChevronRight size={14} />
          <Link to={`/products?category=${product.category_slug}`} className="hover:text-orange-500">{product.category_name}</Link>
        </>}
        <FiChevronRight size={14} />
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="card overflow-hidden rounded-xl mb-3">
            <img src={images[mainImg]?.url} alt={product.name} className="w-full h-96 object-contain p-4" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${mainImg === i ? 'border-orange-500' : 'border-gray-200'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            {product.category_name && (
              <Link to={`/products?category=${product.category_slug}`} className="badge bg-orange-100 text-orange-700">{product.category_name}</Link>
            )}
            {isDigital && <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1"><FiDownload size={10} /> Digital</span>}
            {product.brand && <span className="badge bg-gray-100 text-gray-700">{product.brand}</span>}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={16} className={s <= Math.round(product.rating_avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating_avg} ({product.rating_count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && <span className="badge bg-green-100 text-green-700 text-sm">{discount}% OFF</span>}
          </div>

          {/* Stock/availability */}
          {!isDigital && (
            <p className={`text-sm mb-4 font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock_quantity > 0 ? `✓ In Stock (${product.stock_quantity} left)` : '✗ Out of Stock'}
            </p>
          )}
          {isDigital && <p className="text-sm text-purple-600 mb-4 font-medium">✓ Instant digital download</p>}

          {/* Short description */}
          {product.short_description && (
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.short_description}</p>
          )}

          {/* Qty + Add to cart */}
          {(product.stock_quantity > 0 || isDigital) && (
            <div className="flex items-center gap-3 mb-5">
              {!isDigital && (
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 rounded-l-lg transition">
                    <FiMinus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))} className="px-3 py-2 hover:bg-gray-50 rounded-r-lg transition">
                    <FiPlus size={14} />
                  </button>
                </div>
              )}
              <button onClick={handleAdd} disabled={adding} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiShoppingCart size={16} />}
                {isDigital ? 'Add to Cart' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Delivery info */}
          <div className="card p-4 space-y-2">
            {!isDigital && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiTruck size={16} className="text-orange-500 flex-shrink-0" />
                <span>Free delivery on orders above ₹500 · COD available</span>
              </div>
            )}
            {isDigital && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <FiDownload size={16} className="text-purple-500 flex-shrink-0" />
                <span>Instant download after payment confirmation</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="card p-6 prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>
      )}
    </div>
  );
}
