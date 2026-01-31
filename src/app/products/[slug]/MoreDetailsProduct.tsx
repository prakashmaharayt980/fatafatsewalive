"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, MessageCircle, Send, ChevronDown, Scale, Check } from 'lucide-react';
import ParsedContent from '../ParsedContent';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import IconRenderer from '@/app/CommonVue/CustomIconImg';
import RemoteServices from '@/app/api/remoteservice';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { Review } from '@/app/types/ReviewTypes';
// AlertDialog removed — login is handled by AuthContext.triggerLoginAlert()
import { useAuth } from '@/app/context/AuthContext';
// Pagination replaced with custom inline buttons

import { toast } from 'sonner';
import { cn } from '@/lib/utils';



import RelatedComparison from './RelatedComparison';

interface MoreDetailsProductProps {
  productDesciption: string;
  keyFeatures?: Record<string, string>;
  specifications?: Record<string, string>;
  productID: number;
  product?: ProductDetails; // Added product prop
  categoryId?: string; // Added categoryId prop
}

interface RatingInterface {
  rating: number;
  hoverRating: number;
  newRating: number;
  newReview: string;
  isSubmittingReview: boolean;
  commentOpen: boolean;
}

export default function MoreDetailsProduct({
  productDesciption,
  keyFeatures = {},
  specifications = {},
  productID,
  product,
  categoryId
}: MoreDetailsProductProps) {
  const [Rating, setRating] = useState<RatingInterface>({
    rating: 0,
    hoverRating: 0,
    newRating: 0,
    newReview: '',
    isSubmittingReview: false,
    commentOpen: false,
  });
  const [reviews, setReviews] = useState<Review>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const reviewTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const specsRef = useRef<HTMLDivElement | null>(null);



  const hasSpecifications = Object.keys(specifications).length > 0;
  const hasAttributes = Object.keys(keyFeatures).length > 0;
  const hasAnyFeatures = hasSpecifications || hasAttributes;

  const { triggerLoginAlert, authState } = useAuth();

  useEffect(() => {
    if (productID) {
      RemoteServices.getReviews(productID, currentPage)
        .then(res => {
          setReviews({
            data: res.data,
            meta: res.meta
          });

        })
    }
  }, [productID, currentPage]);

  const handleWriteReviewClick = () => {
    if (!authState.access_token) {
      triggerLoginAlert();
    } else {
      setRating({ ...Rating, commentOpen: !Rating.commentOpen });
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (reviews?.meta && page > reviews.meta.last_page)) return;
    setCurrentPage(page);
  };

  // Get the specs data to display
  const specsData = hasSpecifications ? specifications : keyFeatures;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!Rating.newReview.trim() || Rating.newRating === 0) return;
    setRating({ ...Rating, isSubmittingReview: true });

    RemoteServices.createReview({
      id: productID,
      data: {
        rating: Rating.newRating,
        review: Rating.newReview,
      }
    })
      .then(res => {

        toast.success(`${res.message}`)
      })

    setTimeout(() => {
      setRating({
        rating: 0,
        hoverRating: 0,
        newRating: 0,
        newReview: '',
        isSubmittingReview: false,
        commentOpen: false,

      });
    }, 1500);
  };

  return (
    <div className="w-full  mx-auto py-4 bg-white" id="specifications">
      {/* Description + Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Product Description Section (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <section ref={descriptionRef} className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm h-full ">
            <div className="pb-4 mb-6 flex items-center gap-3 ">
              <div className="w-1 h-8 bg-[var(--colour-fsP1)] rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Product Description</h2>
            </div>

            <div className={cn(
              "prose prose-sm sm:prose-base prose-slate max-w-none",
              "prose-headings:font-bold prose-headings:text-gray-900",
              "prose-p:text-gray-600 prose-p:leading-7 prose-p:mb-4",
              "prose-li:text-gray-600 prose-li:marker:text-[var(--colour-fsP1)]",
              "prose-img:rounded-xl prose-img:shadow-md prose-img:my-6",
              "prose-strong:text-gray-900 prose-strong:font-semibold",
              "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            )}>
              <ParsedContent description={productDesciption} className="" />
            </div>
          </section>
        </div>

        {/* Full Specifications Sidebar (1/3 width on desktop) */}
        <div className="lg:col-span-1">
          {hasAnyFeatures && (
            <section ref={specsRef} className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <Scale className="w-5 h-5 text-[var(--colour-fsP1)]" />
                    </div>
                    Specifications
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(specsData).map(([key, value], index) => (
                    <div
                      key={`spec-${index}`}
                      className="bg-white p-3.5 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="flex flex-row gap-4">
                        <IconRenderer iconKey={key} size={18} className="text-[var(--colour-fsP1)]" />
                        <div className='flex flex-col items-start gap-2'>
                          <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{key}</h4>
                          <p className="text-sm font-medium text-gray-900 leading-snug break-words ">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Related Comparison Widget */}
              {product && categoryId && (
                <RelatedComparison currentProduct={product} categoryId={categoryId} />
              )}
            </section>
          )}
        </div>

      </div>

      {/* Reviews Section — Rating Summary + Review Cards */}
      <div className="mt-8" id="reviews">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-[var(--colour-fsP1)] rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Ratings & Reviews</h2>
          {reviews?.meta?.total ? (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {reviews.meta.total} {reviews.meta.total === 1 ? 'review' : 'reviews'}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Rating Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-100 p-6 space-y-5 lg:sticky lg:top-24">
              {/* Big average score */}
              <div className="text-center">
                <div className="text-5xl font-extrabold text-slate-900 leading-none">
                  {reviews?.meta?.average_rating?.toFixed(1) || product?.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }, (_, i) => {
                    const avg = reviews?.meta?.average_rating || product?.average_rating || 0;
                    return (
                      <Star
                        key={i}
                        size={18}
                        className={cn(
                          i < Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        )}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Based on {reviews?.meta?.total || 0} {(reviews?.meta?.total || 0) === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Star distribution bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews?.data?.filter(r => r.rating === star).length || 0;
                  const total = reviews?.data?.length || 0;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  const barColors: Record<number, string> = {
                    5: 'bg-emerald-500',
                    4: 'bg-green-400',
                    3: 'bg-amber-400',
                    2: 'bg-orange-400',
                    1: 'bg-red-400',
                  };

                  return (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-gray-500 w-4 text-right">{star}</span>
                      <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 h-2 bg-gray-200/70 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", barColors[star])}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 w-6 text-right tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Write review CTA */}
              {!Rating.commentOpen && (
                <Button
                  onClick={handleWriteReviewClick}
                  className="w-full h-11 bg-[var(--colour-fsP1)] hover:bg-orange-600 text-white font-semibold rounded-xl shadow-none text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT: Review Form + Review Cards */}
          <div className="lg:col-span-8 space-y-4">

            {/* Review Form (Inline) */}
            {Rating.commentOpen && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="text-sm font-bold text-gray-900">Share your experience</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Star picker */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Tap to rate</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onClick={() => setRating({ ...Rating, newRating: star })}
                          onMouseEnter={() => setRating({ ...Rating, hoverRating: star })}
                          onMouseLeave={() => setRating({ ...Rating, hoverRating: 0 })}
                        >
                          <Star
                            size={28}
                            className={cn(
                              "transition-colors duration-150",
                              star <= (Rating.hoverRating || Rating.newRating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 hover:text-amber-200'
                            )}
                          />
                        </button>
                      ))}
                      {Rating.newRating > 0 && (
                        <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {Rating.newRating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text */}
                  <Textarea
                    ref={reviewTextareaRef}
                    placeholder="What did you like or dislike? How was the quality?"
                    value={Rating.newReview}
                    onChange={(e) => setRating({ ...Rating, newReview: e.target.value })}
                    className="w-full min-h-[100px] resize-none bg-gray-50 border-gray-200 focus:border-[var(--colour-fsP1)] focus:ring-[var(--colour-fsP1)]/20 rounded-xl text-sm"
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRating({ ...Rating, commentOpen: false, newRating: 0, newReview: '' })
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!Rating.newReview.trim() || Rating.newRating === 0}
                      className="bg-[var(--colour-fsP1)] hover:bg-orange-600 text-white font-semibold px-5 rounded-lg"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Review Cards */}
            {reviews?.meta && reviews.meta.total > 0 ? (
              <div className="space-y-3">
                {reviews.data.map((review, index) => {
                  const ratingLabel =
                    review.rating >= 4 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                    review.rating === 3 ? 'text-amber-700 bg-amber-50 border-amber-100' :
                    'text-red-700 bg-red-50 border-red-100';

                  return (
                    <div key={review.id || index} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 transition-colors">
                      {/* Top row: avatar + name + rating badge + date */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarImage src={review.user.avatar_image?.thumb || "/svgfile/menperson.svg"} />
                          <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xs">
                            {review.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900 truncate">{review.user.name}</span>
                              <span className={cn(
                                "inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded border",
                                ratingLabel
                              )}>
                                <Star size={10} className="fill-current" />
                                {review.rating}
                              </span>
                            </div>
                            <time className="text-[11px] text-gray-400 flex-shrink-0">
                              {new Date(review.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                          </div>

                          {/* Verified badge */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-green-600 font-medium">Verified Purchase</span>
                          </div>
                        </div>
                      </div>

                      {/* Stars row */}
                      <div className="flex items-center gap-0.5 mt-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={cn(
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            )}
                          />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-sm text-gray-600 leading-relaxed mt-2 whitespace-pre-line">
                        {review.review}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-gray-300" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">No reviews yet</h4>
                <p className="text-sm text-gray-500 max-w-xs mb-5">
                  Be the first to share your experience with this product.
                </p>
                {!Rating.commentOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWriteReviewClick}
                    className="rounded-lg border-gray-300 text-gray-700 font-medium"
                  >
                    Write First Review
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {reviews?.meta && reviews.meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors",
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>

                {Array.from({ length: reviews.meta.last_page }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === reviews.meta.last_page ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                          page === currentPage
                            ? "bg-[var(--colour-fsP1)] text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === reviews.meta.last_page}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors",
                    currentPage === reviews.meta.last_page
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
    </div>
  );
}