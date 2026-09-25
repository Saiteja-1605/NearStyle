import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Heart,
  ShoppingBag,
  Store,
  ShieldCheck,
  Check,
  Star,
  ChevronRight,
  ArrowLeft,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { IProduct, IReview } from '../types';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import { Button } from '../components/common/Button';
import { RatingStars } from '../components/common/RatingStars';
import { ReserveModal } from '../components/customer/ReserveModal';
import { EmptyState } from '../components/common/EmptyState';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userCoords } = useLocation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        const coords = userCoords ? `?lat=${userCoords.lat}&lng=${userCoords.lng}` : '';
        const res = await api.get(`/products/${id}${coords}`);
        const p: IProduct = res.data;
        setProduct(p);

        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0]);
        }
        if (p.sizes && p.sizes.length > 0) {
          setSelectedSize(p.sizes[0].size);
        }
        if (p.colors && p.colors.length > 0) {
          setSelectedColour(p.colors[0]);
        }

        // Fetch reviews
        const revRes = await api.get(`/reviews/product/${id}`);
        setReviews(revRes.data || []);
      } catch (err) {
        console.warn('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductAndReviews();
  }, [id, userCoords]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-4/5 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-slate-200 rounded" />
            <div className="h-10 w-4/5 bg-slate-200 rounded" />
            <div className="h-6 w-1/4 bg-slate-200 rounded" />
            <div className="h-24 w-full bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <EmptyState
          title="Product Not Found"
          description="The product you are looking for is unavailable or has been archived."
          actionText="Back to Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const store = typeof product.storeId === 'object' ? product.storeId : null;
  const storeName = store ? store.name : 'Local Boutique';
  const wishlisted = isInWishlist(product._id);

  const activeStock = product.sizes.find((s) => s.size === selectedSize);
  const availableQty = activeStock ? Math.max(0, activeStock.quantity - (activeStock.reserved || 0)) : 0;
  const isOutOfStock = availableQty < 1;

  const originalPrice = product.price;
  const currentPrice = product.discountPrice || product.price;
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColour) {
      error('Please select both a size and colour.');
      return;
    }
    addToCart(product, selectedSize, selectedColour, 1);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColour) {
      error('Please select both a size and colour.');
      return;
    }
    const added = addToCart(product, selectedSize, selectedColour, 1);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      info('Please sign in as a customer to post a review.');
      navigate('/customer/login');
      return;
    }

    if (!reviewComment.trim()) {
      error('Please enter review remarks.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: userRating,
        comment: reviewComment.trim(),
      });

      setReviews([res.data.review, ...reviews]);
      setProduct({ ...product, rating: res.data.averageRating, numReviews: reviews.length + 1 });
      setReviewComment('');
      success('Review posted successfully! Thank you for your feedback.');
    } catch (err: any) {
      error(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/products" className="hover:text-slate-900">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-3/4 rounded-3xl bg-slate-100 overflow-hidden border border-slate-200/80 shadow-xs">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all ${
                wishlisted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-600 ring-2 ring-brand-300'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                {product.brand}
              </span>
              <RatingStars
                rating={product.rating}
                showNumber
                reviewCount={product.numReviews}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{currentPrice.toLocaleString()}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-lg text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  Save ₹{(originalPrice - currentPrice).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Inclusive of all local taxes</p>
          </div>

          {/* Local Store Card */}
          {store && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Available in Nearby Physical Store
                </span>
                <Link
                  to={`/stores/${store._id}`}
                  className="font-bold text-slate-900 hover:text-brand-600 text-sm block mt-0.5"
                >
                  {store.name}
                </Link>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{store.address}, {store.area}</span>
                  {product.distanceKm !== undefined && product.distanceKm !== null && (
                    <strong className="text-brand-600 ml-1">
                      ({product.distanceKm} km away)
                    </strong>
                  )}
                </p>
              </div>
              <Link
                to={`/stores/${store._id}`}
                className="text-xs font-bold text-brand-600 hover:underline shrink-0 self-center"
              >
                Store Details
              </Link>
            </div>
          )}

          {/* Colour Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Colour: <span className="text-brand-600 font-semibold">{selectedColour}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColour(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selectedColour === c
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Size: <span className="text-brand-600 font-semibold">{selectedSize}</span>
              </label>
              {activeStock && (
                <span
                  className={`text-xs font-bold ${
                    availableQty > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {availableQty > 0 ? `${availableQty} units left` : 'Out of stock'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const avail = s.quantity - (s.reserved || 0);
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={avail <= 0}
                    onClick={() => setSelectedSize(s.size)}
                    className={`min-w-[48px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                        : avail > 0
                        ? 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                        : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {/* The Signature Feature: Reserve & Try Button */}
            {product.reservationEligible && store?.allowsReservation !== false && (
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-extrabold shadow-md bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700"
                onClick={() => setIsReserveModalOpen(true)}
                disabled={isOutOfStock}
                leftIcon={<Clock className="w-5 h-5 text-white" />}
              >
                Reserve & Try (Hold for 8 Hours in Store)
              </Button>
            )}

            {/* Standard Buy & Cart Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full font-bold"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                leftIcon={<ShoppingBag className="w-5 h-5 text-slate-600" />}
              >
                Add to Cart
              </Button>

              <Button
                variant="dark"
                size="lg"
                className="w-full font-bold"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Highlights & Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Free Delivery above ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Easy Returns within 7 Days</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Same-Day Store Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>100% Genuine Local Retailer</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Product Details
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || 'High-grade fabric meticulously crafted for optimal comfort and longevity.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-8 border-t border-slate-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Customer Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={product.rating} showNumber size="md" />
              <span className="text-xs text-slate-500">Based on {reviews.length} reviews</span>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-xl">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Leave a Verified Customer Review
          </h4>

          <div>
            <label className="block text-xs text-slate-600 mb-1">Your Rating:</label>
            <RatingStars
              rating={userRating}
              interactive
              onRate={(r) => setUserRating(r)}
              size="lg"
            />
          </div>

          <div>
            <textarea
              placeholder="Tell other shoppers about the fit, fabric quality, and your in-store try experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" isLoading={submittingReview}>
            Submit Review
          </Button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4 max-w-3xl">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No reviews yet for this product. Be the first to try and review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {rev.customerName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{rev.customerName}</span>
                  </div>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-9">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Reserve Modal */}
      <ReserveModal
        product={product}
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        selectedSize={selectedSize}
        selectedColour={selectedColour}
      />
    </div>
  );
};
