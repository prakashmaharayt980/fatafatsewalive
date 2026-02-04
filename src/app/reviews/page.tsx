'use client';

import React, { useState, useRef } from 'react';
import { Star, MessageCircle, Send, Image as ImageIcon, ThumbsUp, CheckCircle2, X, Search, Trophy, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';
import imglogo from '@/app/assets/logoimg.png';

// Mock Data
const ALL_REVIEWS = [
    {
        id: 1,
        user: { name: 'Aarav Sharma', avatar: '/svgfile/menperson.svg' },
        rating: 5,
        date: '2 Oct 2024',
        content: 'Absolutely amazing service! The delivery was super fast and the product quality is top-notch. Highly recommended Fatafat Sewa for genuine products.',
        verified: true,
        source: 'platform',
        images: ['/imgfile/mi10iproduct.jpg']
    },
    {
        id: 'g1',
        user: { name: 'Sita Verma', avatar: null },
        rating: 5,
        date: 'Yesterday',
        content: 'Valid and authentic products. Very happy with my purchase. The customer support team was very responsive.',
        verified: false,
        source: 'google',
        images: []
    },
    {
        id: 2,
        user: { name: 'Priya K.', avatar: null },
        rating: 4,
        date: '28 Sep 2024',
        content: 'Great experience overall. The exchange process was smooth. Minor delay in pickup but support was helpful.',
        verified: true,
        source: 'platform',
        images: []
    },
    {
        id: 'g2',
        user: { name: 'Amit Patel', avatar: null },
        rating: 5,
        date: '3 days ago',
        content: 'Trusted platform in Nepal. Fatafat delivery indeed! I was worried about the payment but the cash on delivery option worked perfectly.',
        verified: false,
        source: 'google',
        images: []
    },
    {
        id: 3,
        user: { name: 'Rohan Deshmukh', avatar: null },
        rating: 5,
        date: '15 Sep 2024',
        content: 'Best value for money. I exchanged my old Samsung and got a great deal on the iPhone 15.',
        verified: true,
        source: 'platform',
        images: []
    },
    {
        id: 4,
        user: { name: 'Kiran Thapa', avatar: null },
        rating: 5,
        date: '10 Sep 2024',
        content: 'Provides excellent EMI facilities. The documentation process was quick and easy.',
        verified: true,
        source: 'platform',
        images: []
    }
];

export default function ReviewsPage() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived stats
    const totalReviews = ALL_REVIEWS.length;
    const averageRating = (ALL_REVIEWS.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1); // e.g. "4.8"
    const averageRatingNum = Number(averageRating);

    // Calculate distribution
    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = ALL_REVIEWS.filter(r => r.rating === star).length;
        return { star, count, percent: (count / totalReviews) * 100 };
    });

    // Filter Logic
    const filteredReviews = ALL_REVIEWS.filter(review => {
        const matchesSearch = review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.user.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Image Handling
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (images.length + selectedFiles.length > 5) {
                toast.error("You can upload a maximum of 5 images.");
                return;
            }
            setImages(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewText.trim() || rating === 0) return;

        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Review submitted successfully!");
            setRating(0);
            setReviewText('');
            setImages([]);
            setIsSubmitting(false);
            setIsFormOpen(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
            {/* Navbar Placeholder if needed, but assuming global navbar exists */}

            <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">

                {/* HERO SECTION: "Customer Favorite" Badge Style */}
                <div className="flex flex-col items-center justify-center text-center mb-16 relative">

                    {/* Laurel / Badge Effect */}
                    <div className="relative mb-6">
                        <div className="flex items-center justify-center relative">
                            {/* Left Laurel */}
                            <img src="/svgfile/laurel-left.svg" alt="" className="hidden" /> {/* Placeholder if SVG available */}
                            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-[var(--colour-yellow1)] absolute -top-10 opacity-20 blur-xl" />

                            <h1 className="text-[6rem] md:text-[8rem] font-black leading-none tracking-tighter text-[var(--colour-fsP2)] drop-shadow-sm">
                                {averageRating.slice(0, 1)}<span className="text-[4rem] md:text-[5rem] text-[var(--colour-yellow1)]">.</span>{averageRating.slice(2)}
                            </h1>
                        </div>

                        {/* Stars underneath */}
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={24} className={cn("fill-[var(--colour-yellow1)] text-[var(--colour-yellow1)]", i > Math.round(averageRatingNum) && "text-gray-200 fill-gray-200")} />
                            ))}
                        </div>
                    </div>

                    {/* Logo & Text */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-8 w-auto relative">
                                <Image src={imglogo} alt="Fatafat Sewa" width={100} height={40} className="object-contain h-full w-auto" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-gray-900">
                                Customer Favorite
                            </span>
                        </div>
                        <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
                            One of the most trusted platforms in Nepal. Rated highly for reliability, speed, and service.
                        </p>
                    </div>

                    {/* Stats Breakdown (Floating Card Style) */}
                    <div className="mt-12 w-full max-w-2xl bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                        <div className="grid gap-3">
                            {distribution.map((item) => (
                                <div key={item.star} className="flex items-center gap-4 group">
                                    <span className="w-4 font-semibold text-gray-700 text-sm">{item.star}</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--colour-fsP2)] group-hover:bg-[var(--colour-yellow1)] transition-colors duration-500 rounded-full"
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-right text-gray-400 text-xs font-medium">{item.percent > 0 ? `${Math.round(item.percent)}%` : '0%'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {/* CONTENT AREA: Search + Review Form + List */}
                <div className="max-w-4xl mx-auto">

                    {/* Controls Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--colour-fsP2)] transition-colors w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-[var(--colour-fsP2)]/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                            />
                        </div>

                        <Button
                            onClick={() => setIsFormOpen(!isFormOpen)}
                            className="w-full md:w-auto rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 h-11 shadow-lg shadow-gray-200 transition-transform active:scale-95"
                        >
                            {isFormOpen ? 'Close' : 'Write a review'}
                        </Button>
                    </div>

                    {/* Collapsible Form */}
                    <div className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out mb-12",
                        isFormOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Rate your experience</h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Stars */}
                                <div className="flex justify-center py-4">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="focus:outline-none transition-all hover:scale-110 p-1"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                            >
                                                <Star
                                                    size={42}
                                                    className={cn(
                                                        "transition-colors duration-200",
                                                        star <= (hoverRating || rating)
                                                            ? 'fill-[var(--colour-yellow1)] text-[var(--colour-yellow1)]'
                                                            : 'text-gray-300'
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Textarea
                                    placeholder="Share details of your own experience at this place..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className="min-h-[140px] bg-white border-gray-200 rounded-2xl text-base p-4 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/20"
                                />

                                {/* Image Upload & Submit Row */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        {images.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                                            >
                                                <ImageIcon size={18} className="text-gray-500" />
                                                <span className="text-gray-700">Add photos</span>
                                            </button>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleImageSelect} multiple accept="image/*" className="hidden" />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !reviewText.trim() || rating === 0}
                                        className="rounded-xl px-8 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold h-11"
                                    >
                                        Post
                                    </Button>
                                </div>

                                {/* Preview Images */}
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {images.map((file, index) => (
                                            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>


                    {/* Reviews GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                        {filteredReviews.length > 0 ? (
                            filteredReviews.map((review) => (
                                <div key={review.id} className="flex flex-col gap-3 group">
                                    {/* User Review Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={review.user.avatar || undefined} />
                                                <AvatarFallback className="bg-[var(--colour-fsP2)] text-white font-bold text-lg">
                                                    {review.user.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-base">{review.user.name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    {review.source === 'google' ? 'Google Review' : 'Nepal'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Star Rating Line */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={cn("fill-current", i < review.rating ? "text-gray-900" : "text-gray-200")} />
                                            ))}
                                        </div>
                                        <span>•</span>
                                        <span className="text-gray-500 text-sm">{review.date}</span>
                                    </div>

                                    {/* Content */}
                                    <p className="text-gray-700 leading-relaxed text-[15px]">
                                        {review.content}
                                    </p>

                                    {/* Images if any */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mt-1">
                                            {review.images.map((img, idx) => (
                                                <div key={idx} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100">
                                                    <img src={img} alt="Review" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {/* <button className="self-start text-sm underline font-medium text-gray-900 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Show more
                                    </button> */}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg font-medium">No reviews match your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
