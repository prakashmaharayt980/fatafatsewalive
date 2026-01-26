"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, MessageCircle, Send, ChevronDown, ChevronUp, User, Scale, Check } from 'lucide-react';
import ParsedContent from '../ParsedContent';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import IconRenderer from '@/app/CommonVue/CustomIconImg';
import RemoteServices from '@/app/api/remoteservice';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { Review } from '@/app/types/ReviewTypes';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/app/context/AuthContext';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

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
  const router = useRouter();

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
    <div className="w-full max-w-7xl mx-auto py-4 bg-white" id="specifications">
      {/* Description + Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Product Description Section (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <section ref={descriptionRef} className="bg-white rounded-[2rem] p-6 sm:p-8 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 h-full border border-gray-100">
            <div className="pb-6 mb-8 flex items-center gap-4 border-b border-gray-100/50">
              <div className="w-1.5 h-12 bg-[var(--colour-fsP1)] rounded-full shadow-sm"></div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Product Description</h2>
            </div>

            <div className={cn(
              "prose prose-sm sm:prose-lg prose-slate max-w-none",
              "prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight",
              "prose-p:text-gray-600 prose-p:leading-8 prose-p:mb-6",
              "prose-li:text-gray-600 prose-li:marker:text-[var(--colour-fsP1)]",
              "prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8",
              "prose-strong:text-gray-900 prose-strong:font-bold",
              "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            )}>
              <ParsedContent description={productDesciption} className="" />
            </div>
          </section>
        </div>

        {/* Full Specifications Sidebar (1/3 width on desktop) */}
        <div className="lg:col-span-1">
          {hasAnyFeatures && (
            <section ref={specsRef} className="lg:sticky lg:top-24 space-y-8">
              <div>
                <div className="pb-4 mb-4 px-2 sm:px-0 border-b border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <Scale className="w-6 h-6 text-[var(--colour-fsP1)]" />
                    </div>
                    Specifications
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(specsData).map(([key, value], index) => (
                    <div
                      key={`spec-${index}`}
                      className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-violet-100 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex flex-col gap-2 h-full">
                        <div className="flex items-center gap-2 text-[var(--colour-fsP1)] mb-auto">
                          {/* Dot indicator for 'destila dot' request */}
                          <div className="w-2 h-2 rounded-full bg-[var(--colour-fsP1)] flex-shrink-0 group-hover:scale-125 transition-transform" />
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">{key}</h4>
                        </div>
                        <p className="text-base font-bold text-gray-900 leading-tight break-words pl-4">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Content Section */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100/50">
                <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Additional Info
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span>Official Warranty Available</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span>7 Days Return Policy</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span>Express Delivery Support</span>
                  </li>
                </ul>
              </div>

              {/* Related Comparison Widget */}
              {product && categoryId && (
                <RelatedComparison currentProduct={product} categoryId={categoryId} />
              )}
            </section>
          )}
        </div>

      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
              <p className="text-sm text-gray-500 mt-1">See what others are saying about this product</p>
            </div>
            {!Rating.commentOpen && (
              <Button
                onClick={handleWriteReviewClick}
                className="bg-[var(--colour-fsP1)] hover:bg-blue-700 text-white font-medium shadow-none"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            )}
          </div>

          <div className="p-4 sm:p-6 bg-white">
            {/* Review Form */}
            {Rating.commentOpen && (
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-900 mb-3 block">Overall Rating</label>
                      <div className="flex items-center gap-2">
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
                              size={32}
                              className={`transition-colors duration-200 ${star <= (Rating.newRating || Rating.hoverRating)
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                                : 'text-gray-300 hover:text-yellow-200'
                                }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {Rating.newRating ? `${Rating.newRating}/5` : 'Select a rating'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Your Feedback</label>
                    <Textarea
                      ref={reviewTextareaRef}
                      placeholder="What did you like or dislike about the product?"
                      value={Rating.newReview}
                      onChange={(e) => setRating({ ...Rating, newReview: e.target.value })}
                      className="w-full min-h-[120px] resize-y bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setRating({ ...Rating, commentOpen: false, newRating: 0, newReview: '' })
                      }
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!Rating.newReview.trim() || Rating.newRating === 0}
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Review
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {reviews?.meta && reviews?.meta?.total > 0 ? (
              <div className="space-y-6">
                {reviews?.data.map((review, index) => (
                  <div key={index} className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md ring-2 ring-gray-50">
                      <AvatarImage src="/svgfile/menperson.svg" />
                      <AvatarFallback className="bg-[var(--colour-fsP1)] text-white font-bold">
                        {review.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      {/* Header Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight text-base">{review.user.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-yellow-400">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating ? 'fill-current text-yellow-400' : 'text-gray-200'
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified Purchase
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                          {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Review Body */}
                      <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pt-2">
                        {review.review}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h4>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  Be the first to share your experience with this product. Your feedback helps others make better decisions.
                </p>
                {!Rating.commentOpen && (
                  <Button variant="outline" onClick={handleWriteReviewClick}>Write First Review</Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {reviews?.meta && reviews.meta.last_page > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                      />
                    </PaginationItem>

                    {Array.from({ length: reviews.meta.last_page }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === reviews.meta.last_page ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              className={cn(
                                "cursor-pointer transition-all",
                                page === currentPage ? "bg-[var(--colour-fsP1)] text-white hover:bg-blue-700" : "hover:bg-gray-100"
                              )}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === reviews.meta.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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