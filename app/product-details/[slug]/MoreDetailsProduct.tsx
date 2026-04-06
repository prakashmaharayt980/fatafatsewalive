"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, MessageCircle, Send, ChevronDown, Scale, Check, Camera, X, MessageCircleMore } from 'lucide-react';
import ParsedContent from '../ParsedContent';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import IconRenderer from '@/app/CommonVue/CustomIconImg';


import type { Review } from '@/app/types/ReviewTypes';
import { useAuthStore } from '@/app/context/AuthContext';
import { useShallow } from 'zustand/react/shallow';

// Pagination replaced with custom inline buttons

import { toast } from 'sonner';
import { cn } from '@/lib/utils';


import { ReviewService } from '@/app/api/services/reviews.service';
import type { ProductData } from '@/app/types/ProductDetailsTypes';
import Image from 'next/image';
import menpersonIcon from '@/public/svgfile/menperson.svg';



interface MoreDetailsProductProps {
  productDescription: string;
  keyFeatures?: Record<string, string>;
  specifications?: Record<string, string>;
  productID: number;
  product?: ProductData; // Added product prop
  categoryId?: string; // Added categoryId prop
}

interface RatingInterface {
  hoverRating: number;
  newRating: number;
  newReview: string;
  isSubmittingReview: boolean;
  commentOpen: boolean;
  images: File[];
}

export default function MoreDetailsProduct({
  productDescription,
  keyFeatures = {},
  specifications = {},
  productID,
  product,
  categoryId
}: MoreDetailsProductProps) {
  const [Rating, setRating] = useState<RatingInterface>({
    hoverRating: 0,
    newRating: 0,
    newReview: '',
    isSubmittingReview: false,
    commentOpen: false,
    images: [],
  });
  const [reviews, setReviews] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const reviewTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const specsRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);



  const hasSpecifications = Object.keys(specifications).length > 0;
  const hasAttributes = Object.keys(keyFeatures).length > 0;
  const hasAnyFeatures = hasSpecifications || hasAttributes;

  const { isLoggedIn, triggerLoginAlert } = useAuthStore(useShallow(state => ({
    isLoggedIn: state.isLoggedIn,
    triggerLoginAlert: state.triggerLoginAlert
  })));


  useEffect(() => {
    if (productID) {
      ReviewService.getReviews(productID, currentPage)
        .then(res => {
          setReviews({
            data: res.data,
            meta: res.meta
          });

        })
    }
  }, [productID, currentPage]);

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      triggerLoginAlert();
    } else {
      setRating({ ...Rating, commentOpen: !Rating.commentOpen });
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (reviews?.meta && page > reviews.meta.last_page)) return;
    setCurrentPage(page);
  };


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (Rating.images.length + selectedFiles.length > 5) {
        toast.error("You can upload a maximum of 5 images.");
        return;
      }
      setRating(prev => ({ ...prev, images: [...prev.images, ...selectedFiles] }));
    }
  };

  const removeImage = (index: number) => {
    setRating(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Get the specs data to display
  const specsData = hasSpecifications ? specifications : keyFeatures;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!Rating.newReview.trim() || Rating.newRating === 0) return;
    setRating({ ...Rating, isSubmittingReview: true });

    ReviewService.createReview({
      id: productID,
      data: {
        rating: Rating.newRating,
        review: Rating.newReview,
        // images: Rating.images (Check API service if it supports File[])
      }
    })
      .then(res => {

        toast.success(`${res.message}`)
      })

    setTimeout(() => {
      setRating({
        hoverRating: 0,
        newRating: 0,
        newReview: '',
        isSubmittingReview: false,
        commentOpen: false,
        images: [],

      });
    }, 1500);
  };

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);

  // Ref for the desktop unified button
  const desktopButtonRef = useRef<HTMLButtonElement | null>(null);

  const toggleDesc = () => {
    if (isDescExpanded) {
      setIsDescExpanded(false);
      setTimeout(() => {
        descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      setIsDescExpanded(true);
    }
  };

  const toggleSpecs = () => {
    if (isSpecsExpanded) {
      setIsSpecsExpanded(false);
      setTimeout(() => {
        specsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      setIsSpecsExpanded(true);
    }
  };

  // Desktop unified toggle
  const toggleBoth = () => {
    const shouldExpand = !isDescExpanded || !isSpecsExpanded;

    if (!shouldExpand) {
      setIsDescExpanded(false);
      setIsSpecsExpanded(false);
      setTimeout(() => {
        desktopButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setIsDescExpanded(true);
      setIsSpecsExpanded(true);
    }
  };

  const isBothExpanded = isDescExpanded && isSpecsExpanded;

  const hasDescription = !!productDescription && productDescription.trim() !== "" && productDescription !== "<p><br></p>";

  const showDescription = hasDescription;
  const showSpecs = hasAnyFeatures;

  return (
    <div className="w-full  mx-auto py-4 px-3 bg-white" id="specifications">
      {/* Description + Specifications Grid */}
      {(showDescription || showSpecs) && (
        <div className={cn(
          "grid grid-cols-1 gap-6 lg:gap-8",
          showDescription && showSpecs ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}>

          {/* Product Description Section */}
          {showDescription && (
            <div className={cn(
              showSpecs ? "lg:col-span-2" : "lg:col-span-1"
            )}>
              <section ref={descriptionRef} className={cn(
                "bg-white sm:p-2 lg:p-3 h-full flex flex-col",
                showSpecs && "sm:border-r sm:border-gray-200"
              )}>
                <div className=" flex items-center gap-3 mb-4 ">
                  <div className="w-1 h-8 bg-[var(--colour-fsP2)] rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Product Description</h2>
                </div>

                <div className={cn(
                  "prose prose-sm sm:prose-base prose-slate max-w-none relative transition-all duration-500 ease-in-out",
                  !isDescExpanded && "max-h-[500px] overflow-hidden"
                )}>
                  <div >
                    <ParsedContent description={productDescription} className="" />
                  </div>

                  {/* Gradient Overlay for Description */}
                  {!isDescExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Mobile Toggle Button - Description */}
                <div className="mt-4 lg:hidden">
                  <Button
                    variant="outline"
                    onClick={toggleDesc}
                    className="w-full rounded border-none cursor-pointer text-gray-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)]"
                  >
                    {isDescExpanded ? 'Show Less' : 'Show More'}
                    <ChevronDown className={cn("ml-2 w-4 h-4 transition-transform", isDescExpanded && "rotate-180")} />
                  </Button>
                </div>
              </section>
            </div>
          )}

          {/* Full Specifications Sidebar */}
          {showSpecs && (
            <div className={cn(
              showDescription ? "lg:col-span-1" : "lg:col-span-1"
            )}>
              <section ref={specsRef} className="lg:sticky lg:top-24">
                <div className="relative">

                  {/* Header */}
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-gray-100">
                    <Scale className="w-4 h-4 text-[var(--colour-fsP2)]" />
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Specifications
                    </h2>
                  </div>

                  {/* Spec rows */}
                  <div className={cn(
                    "relative transition-all duration-500 ease-in-out",
                    !isSpecsExpanded && "max-h-[500px] overflow-hidden"
                  )}>
                    <dl className={cn(
                      "divide-y divide-gray-100",
                      !showDescription && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 divide-none"
                    )}>
                      {Object.entries(specsData).map(([key, value], index) => (
                        <div
                          key={`spec-${index}`}
                          className={cn(
                            "flex flex-col items-start gap-3 py-2.5 group",
                            !showDescription && "border-b border-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <IconRenderer
                              iconKey={key}
                              size={15}
                              className="mt-0.5 shrink-0 font-bold text-[var(--colour-fsP2)]"
                            />
                            <dt className=" shrink-0 text-[11px] font-bold text-[var(--colour-fsP2)] uppercase tracking-wide pt-px">
                              {key}
                            </dt>
                          </div>
                          <dd className="text-sm text-gray-800 leading-snug break-words min-w-0 flex-1">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {/* Fade overlay */}
                    {!isSpecsExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* Mobile toggle */}
                  <div className="mt-2 lg:hidden">
                    <button
                      onClick={toggleSpecs}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-[var(--colour-fsP2)] transition-colors"
                    >
                      {isSpecsExpanded ? 'Show less' : 'Show more'}
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 transition-transform",
                        isSpecsExpanded && "rotate-180"
                      )} />
                    </button>
                  </div>

                </div>
              </section>
            </div>
          )}

        </div>
      )}

      {/* Desktop Unified Toggle Button */}
      {(showDescription || showSpecs) && (
        <div className="hidden lg:flex justify-center mt-8">
          <Button
            ref={desktopButtonRef}
            variant="outline"
            onClick={toggleBoth}
            className="px-8 rounded border-none cursor-pointer text-gray-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-white"
          >
            {isBothExpanded ? 'Show Less' : 'Show More'}
            <ChevronDown className={cn("ml-2 w-4 h-4 transition-transform", isBothExpanded && "rotate-180")} />
          </Button>
        </div>
      )}


      {/* Reviews Section */}
      <div className="mt-12" id="reviews">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Ratings & Reviews</h2>
          {reviews?.meta?.total ? (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {reviews.meta.total} {reviews.meta.total === 1 ? 'review' : 'reviews'}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* LEFT: Rating Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:sticky lg:top-24">

              {/* Score + stars */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl bg-[#EBF3FC] flex items-center justify-center text-2xl font-black text-[var(--colour-fsP2)] tracking-tighter flex-shrink-0">
                  {reviews?.meta?.average_rating?.toFixed(1) || product?.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }, (_, i) => {
                      const avg = reviews?.meta?.average_rating || product?.average_rating || 0;
                      return (
                        <Star
                          key={i}
                          size={14}
                          className={cn(
                            i < Math.round(avg)
                              ? 'fill-[var(--colour-fsP2)] text-[var(--colour-fsP2)]'
                              : 'text-gray-200 fill-gray-200'
                          )}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Overall Rating</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Based on {reviews?.meta?.total || 0} reviews</p>
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-4" />

              {/* Bar distribution */}
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews?.data?.filter(r => r.rating === star).length || 0;
                  const total = reviews?.data?.length || 0;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold text-slate-400 w-3 text-right">{star}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--colour-fsP2)] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 w-4 text-right tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Write review CTA */}
              {!Rating.commentOpen && (
                <button
                  onClick={handleWriteReviewClick}
                  className="mt-5 w-full h-10 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircleMore className="w-4 h-4" />
                  Write a Review
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Form + Cards */}
          <div className="lg:col-span-8 space-y-3">

            {/* Review Form */}
            {Rating.commentOpen && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-sm font-bold text-gray-800">Share your experience</h3>
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Star picker */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-400 mb-2 block">Your rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          className="focus:outline-none cursor-pointer"
                          onClick={() => setRating({ ...Rating, newRating: star })}
                          onMouseEnter={() => setRating({ ...Rating, hoverRating: star })}
                          onMouseLeave={() => setRating({ ...Rating, hoverRating: 0 })}
                        >
                          <Star
                            size={26}
                            className={cn(
                              "transition-colors duration-100",
                              star <= (Rating.hoverRating || Rating.newRating)
                                ? 'text-[var(--colour-fsP2)] fill-[var(--colour-fsP2)]'
                                : 'text-gray-200 fill-gray-200'
                            )}
                          />
                        </button>
                      ))}
                      {Rating.newRating > 0 && (
                        <span className="ml-2 text-[10px] font-bold text-[var(--colour-fsP2)] bg-[#EBF3FC] px-2 py-0.5 rounded-full">
                          {Rating.newRating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Textarea */}
                  <Textarea
                    ref={reviewTextareaRef}
                    placeholder="What did you like or dislike? How was the quality?"
                    value={Rating.newReview}
                    onChange={(e) => setRating({ ...Rating, newReview: e.target.value })}
                    className="w-full min-h-[90px] resize-none bg-gray-50 border-gray-100 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/20 rounded-xl text-sm"
                  />

                  {/* Image Upload */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-400 mb-2 block">Add photos (optional)</label>
                    <div className="flex flex-wrap gap-2.5">
                      {Rating.images.map((file, index) => (
                        <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 group">
                          {file && (
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-4 h-4 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {Rating.images.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 cursor-pointer rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] transition-colors bg-gray-50"
                        >
                          <Camera size={16} />
                          <span className="text-[9px] font-medium">Add</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRating({ ...Rating, commentOpen: false, newRating: 0, newReview: '', images: [] })}
                      className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer px-3 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!Rating.newReview.trim() || Rating.newRating === 0 || Rating.isSubmittingReview}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--colour-fsP2)] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--colour-fsP2)]/90 cursor-pointer transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Review Cards */}
            {reviews?.meta && reviews.meta.total > 0 ? (
              <div className="space-y-3">
                {reviews.data.map((review, index) => {
                  const pillStyle =
                    review.rating >= 4 ? 'text-emerald-700 bg-emerald-50' :
                      review.rating === 3 ? 'text-amber-700 bg-amber-50' :
                        'text-red-700 bg-red-50';

                  return (
                    <div
                      key={review.id || index}
                      className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5"
                    >
                      {/* Top: avatar + name + badge + date */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarImage src={review.user.avatar_image?.thumb || menpersonIcon} className="object-cover" />
                          <AvatarFallback className="bg-[#EBF3FC] text-[var(--colour-fsP2)] font-black text-xs">
                            {review.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-gray-900 block truncate">{review.user.name}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified Buyer</span>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-md", pillStyle)}>
                            ★ {review.rating}
                          </span>
                          <time className="text-[10px] text-gray-400">
                            {new Date(review.created_at).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={cn(
                              i < review.rating
                                ? 'fill-[var(--colour-fsP2)] text-[var(--colour-fsP2)]'
                                : 'text-gray-200 fill-gray-200'
                            )}
                          />
                        ))}
                      </div>

                      {/* Text */}
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {review.review}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-[#EBF3FC] rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5 text-[var(--colour-fsP2)]" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">No reviews yet</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-4">Be the first to share your experience.</p>
                {!Rating.commentOpen && (
                  <button
                    onClick={handleWriteReviewClick}
                    className="text-xs font-semibold text-[var(--colour-fsP2)] border border-[var(--colour-fsP2)]/30 px-4 py-1.5 rounded-lg hover:bg-[#EBF3FC] transition-colors cursor-pointer"
                  >
                    Write First Review
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {reviews?.meta && reviews.meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-1 pt-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer",
                    currentPage === 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"
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
                          "w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                          page === currentPage
                            ? "bg-[var(--colour-fsP2)] text-white"
                            : "text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">
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
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors cursor-pointer",
                    currentPage === reviews.meta.last_page ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"
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

    </div>
  );
}