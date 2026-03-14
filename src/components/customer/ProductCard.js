import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiDownload } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const image  = product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';
  const isDigital = product.product_type === 'digital';
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div className="card group hover:shadow-md transition-shadow">
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden rounded-t-xl">
        <img src={image} alt={product.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-red-500 text-white">{discount}% OFF</span>
        )}
        {isDigital && (
          <span className="absolute top-2 right-2 badge bg-purple-500 text-white flex items-center gap-1">
            <FiDownload size={10} /> Digital
          </span>
        )}
        {product.stock_quantity === 0 && !isDigital && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <p className="text-xs text-orange-500 font-medium mb-1">{product.category_name || 'Uncategorized'}</p>
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-orange-500 transition mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-600">{product.rating_avg} ({product.rating_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {product.compare_price && (
            <span className="text-xs text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
          )}
        </div>

        <button
          onClick={() => addToCart(product.id)}
          disabled={product.stock_quantity === 0 && !isDigital}
          className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
        >
          <FiShoppingCart size={14} />
          {isDigital ? 'Add to Cart' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
