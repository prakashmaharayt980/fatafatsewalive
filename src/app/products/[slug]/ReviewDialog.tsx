"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Star, Check, ThumbsUp, Camera, ChevronLeft, Upload, Trash2, ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Review } from "@/app/types/ReviewTypes";

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    reviews?: Review;
    averageRating: number;
}

export default function ReviewDialog({
    isOpen,
    onClose,
    productName,
    reviews,
    averageRating,
}: ReviewDialogProps) {
    // Mode State
    const [isWriting, setIsWriting] = useState(false);

    // Write Review Forms State
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalReviews = reviews?.meta?.total || 0;

    // --- Helpers ---

    // Calculate distribution (mock logic preserved but prepared for real data)
    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
        // If we had real distribution data in meta, we'd use it. 
        // For now, use the mock percentages or calculate from loaded reviews if available.
        // Fallback to the previous mocked percentages if totalReviews is small/mocked.
        let count = 0;
        let percent = 0;

        if (reviews?.data && reviews.data.length > 0) {
            count = reviews.data.filter(r => Math.round(r.rating) === stars).length;
            percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        } else {
            // Retain the mock distribution from the original file for visual consistency when no reviews
            percent = stars === 5 ? 53 : stars === 4 ? 21 : stars === 3 ? 7 : stars === 2 ? 3 : 16;
            count = Math.round(totalReviews * (percent / 100));
        }

        return { stars, count, percent };
    });

    // Collect all unique images from reviews for the gallery
    const customerPhotos = reviews?.data?.flatMap(r => r.images || []) || [];
    // Fallback/Mock photos if none exist, just to show the UI as requested (can be removed later)
    if (customerPhotos.length === 0) {
        customerPhotos.push("/imgfile/gift1.png", "/imgfile/gift2.png");
    }

    // --- Handlers ---

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Append new files
            const newImages = [...selectedImages, ...files];
            setSelectedImages(newImages);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]); // Free memory
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmitReview = () => {
        // Here you would normally dispatch an API action
        console.log("Submitting review:", {
            rating: userRating,
            review: reviewText,
            images: selectedImages,
            productName // just for context
        });

        // Reset and close write mode
        setIsWriting(false);
        setUserRating(0);
        setReviewText("");
        setSelectedImages([]);
        setImagePreviews([]);
        // Optional: Show success message
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setIsWriting(false); // Reset mode on close
                // Cleanup previews
                imagePreviews.forEach(url => URL.revokeObjectURL(url));
                setImagePreviews([]);
                setSelectedImages([]);
            }
            onClose();
        }}>
            <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-white max-h-[90vh] flex flex-col sm:rounded-2xl border-none shadow-2xl">

                {/* --- Header --- */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
                    <div className="flex items-center gap-3">
                        {isWriting && (
                            <button
                                onClick={() => setIsWriting(false)}
                                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isWriting ? "Write a Review" : "Ratings & Reviews"}
                            </h2>
                            <p className="text-xs text-slate-500 line-clamp-1 max-w-xs sm:max-w-md">{productName}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* --- Body --- */}
                <div className="overflow-y-auto p-0 sm:p-6 flex-1 bg-white">

                    {isWriting ? (
                        /* --- WRITE REVIEW FORM --- */
                        <div className="max-w-2xl mx-auto space-y-8 py-4 px-4 sm:px-0">

                            {/* Rating Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-800">
                                    Overall Rating
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setUserRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-10 h-10 transition-colors",
                                                    star <= (hoverRating || userRating)
                                                        ? "fill-[var(--colour-fsP2)] text-[var(--colour-fsP2)]"
                                                        : "fill-gray-100 text-gray-300"
                                                )}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm font-medium text-[var(--colour-fsP2)]">
                                        {hoverRating || userRating ? (
                                            (hoverRating || userRating) === 5 ? "Excellent" :
                                                (hoverRating || userRating) === 4 ? "Good" :
                                                    (hoverRating || userRating) === 3 ? "Average" :
                                                        (hoverRating || userRating) === 2 ? "Below Average" : "Poor"
                                        ) : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Image Upload Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-800">
                                    Add Photos
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                            <Image
                                                src={src}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 rounded-lg bg-blue-50/30 border-2 border-dashed border-[var(--colour-fsP2)]/30 flex flex-col items-center justify-center gap-2 text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                                    >
                                        <Camera className="w-6 h-6" />
                                        <span className="text-[10px] font-bold">Add Photos</span>
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Upload photos of the product. Up to 5 images supported.
                                </p>
                            </div>

                            {/* Review Text Area */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-800">
                                    Your Review
                                </label>
                                <textarea
                                    className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[var(--colour-fsP2)] focus:border-[var(--colour-fsP2)] outline-none resize-none text-sm text-slate-700 placeholder:text-slate-400"
                                    placeholder="What did you like or dislike? Use this space to share your thoughts with others."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsWriting(false)}
                                    className="text-slate-500 hover:text-slate-900"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={userRating === 0 || !reviewText.trim()}
                                    className="bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white min-w-[140px]"
                                >
                                    Submit Review
                                </Button>
                            </div>

                        </div>
                    ) : (
                        /* --- READ REVIEWS VIEW --- */
                        <div className="flex flex-col md:flex-row gap-8">

                            {/* LEFT: Summary & Stats */}
                            <div className="w-full md:w-1/3 space-y-6">
                                {/* Main Score */}
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="text-5xl font-extrabold text-slate-900 leading-none tracking-tight">
                                            {averageRating.toFixed(1)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "w-5 h-5",
                                                            i < Math.round(averageRating) ? "fill-[var(--colour-fsP2)] text-[var(--colour-fsP2)]" : "fill-gray-200 text-gray-200"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">Based on {totalReviews} ratings</p>
                                        </div>
                                    </div>

                                    {/* Bars */}
                                    <div className="space-y-2.5">
                                        {ratingDistribution.map((rate) => (
                                            <div key={rate.stars} className="flex items-center gap-3 text-sm">
                                                <span className="w-3 font-bold text-slate-600 tabular-nums">{rate.stars}</span>
                                                <Star className="w-3.5 h-3.5 fill-slate-300 text-slate-300" />
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--colour-fsP2)] rounded-full transition-all duration-500"
                                                        style={{ width: `${rate.percent}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-right text-xs text-slate-400 tabular-nums">{Math.round(rate.percent)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Action */}
                                <div className="bg-[var(--colour-fsP2)]/5 p-6 rounded-2xl border border-[var(--colour-fsP2)]/10 space-y-3">
                                    <h3 className="font-bold text-slate-800 text-sm">Review this product</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Bought this product recently? Share your experience to help others make the right choice.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            onClick={() => setIsWriting(true)}
                                            className="flex-1 bg-[var(--colour-fsP2)] text-white hover:bg-[var(--colour-fsP2)]/90 transition-all font-semibold shadow-sm"
                                        >
                                            Write a Review
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 bg-white border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] hover:bg-blue-50 font-semibold shadow-sm"
                                        >
                                            <Camera className="w-4 h-4 mr-2" />
                                            Add Photo
                                        </Button>
                                    </div>
                                </div>

                                {/* Photos Preview - Always visible to encourage uploads */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="font-bold text-slate-800 text-sm">Customer Photos ({customerPhotos.length})</h3>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Add Photo Tile Shortcut */}
                                        <div
                                            onClick={() => setIsWriting(true)}
                                            className="aspect-square rounded-lg bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:bg-blue-50/30 transition-all"
                                        >
                                            <Camera className="w-5 h-5 mb-1" />
                                            <span className="text-[9px] font-bold">Add</span>
                                        </div>

                                        {customerPhotos.slice(0, 3).map((src, i) => (
                                            <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                                                <Image src={src} alt="Customer photo" fill className="object-cover" />
                                            </div>
                                        ))}
                                        {customerPhotos.length > 3 && (
                                            <div className="aspect-square rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100">
                                                +{customerPhotos.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Reviews List */}
                            <div className="w-full md:w-2/3 space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4 sticky top-0 bg-white z-10 pt-2">
                                    <h3 className="font-bold text-slate-900 text-lg">Reviews ({totalReviews})</h3>
                                    <select className="text-xs border border-gray-200 bg-white rounded-lg px-3 py-2 text-slate-600 font-medium cursor-pointer outline-none focus:border-[var(--colour-fsP2)]">
                                        <option>Top Reviews</option>
                                        <option>Most Recent</option>
                                    </select>
                                </div>

                                <div className="space-y-8">
                                    {reviews?.data?.map((review) => (
                                        <div key={review.id} className="border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative border border-slate-100">
                                                        {review.user?.avatar_image?.thumb ? (
                                                            <Image src={review.user.avatar_image.thumb} alt={review.user.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] text-sm font-bold">
                                                                {review.user?.name?.charAt(0) || "U"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-900">{review.user?.name || "Anonymous"}</span>
                                                            <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-emerald-100 uppercase tracking-wider">
                                                                <Check className="w-2.5 h-2.5" />
                                                                Verified
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex text-[10px]">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={cn(
                                                                            "w-3 h-3",
                                                                            i < review.rating ? "fill-[var(--colour-fsP2)] text-[var(--colour-fsP2)]" : "fill-gray-200 text-gray-200"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-slate-400">
                                                                • {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pl-[52px]">
                                                {/* If review has a title (not in current type but good to have in UI structure) */}
                                                {/* <h4 className="font-bold text-slate-800 text-sm mb-1">Great Product</h4> */}

                                                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                                    {review.review}
                                                </p>

                                                {/* Review Images */}
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {review.images.map((img, idx) => (
                                                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in hover:opacity-90">
                                                                <Image src={img} alt="User review image" fill className="object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[var(--colour-fsP2)] transition-colors group">
                                                        <ThumbsUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        Helpful
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!reviews?.data || reviews.data.length === 0) && (
                                        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                <Star className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold mb-1">No reviews yet</h3>
                                            <p className="text-slate-500 text-sm mb-4">Be the first to share your thoughts on this product.</p>
                                            <Button
                                                variant="outline"
                                                className="border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)] hover:text-white"
                                                onClick={() => setIsWriting(true)}
                                            >
                                                Write a Review
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Global File Input - Hidden but accessible from both views */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        handleImageSelect(e);
                        setIsWriting(true); // Switch to write mode when files are selected
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
