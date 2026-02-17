'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, BookOpen, ShoppingBag, Share2, ShoppingCart } from 'lucide-react';
import { Article } from '../../types/Blogtypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

interface StoryViewerProps {
    stories: Article[];
    initialIndex: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isEntering, setIsEntering] = useState(true);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const story = stories[currentIndex];
    const STORY_DURATION = 8000;

    // Entrance animation
    useEffect(() => {
        requestAnimationFrame(() => setIsEntering(false));
    }, []);

    // Auto-progress
    useEffect(() => {
        if (isPaused) return;
        setProgress(0);
        const tick = 100 / (STORY_DURATION / 40);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (currentIndex < stories.length - 1) {
                        setSlideDirection('left');
                        setTimeout(() => {
                            setCurrentIndex((i) => i + 1);
                            setSlideDirection(null);
                        }, 200);
                        return 0;
                    } else {
                        handleClose();
                        return 100;
                    }
                }
                return prev + tick;
            });
        }, 40);
        return () => clearInterval(interval);
    }, [currentIndex, isPaused, stories.length]);

    const goNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setSlideDirection('left');
            setTimeout(() => {
                setCurrentIndex((i) => i + 1);
                setProgress(0);
                setSlideDirection(null);
            }, 200);
        } else {
            handleClose();
        }
    }, [currentIndex, stories.length]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setSlideDirection('right');
            setTimeout(() => {
                setCurrentIndex((i) => i - 1);
                setProgress(0);
                setSlideDirection(null);
            }, 200);
        }
    }, [currentIndex]);

    const handleClose = useCallback(() => {
        setIsEntering(true);
        setTimeout(onClose, 250);
    }, [onClose]);

    // Keyboard
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev, handleClose]);

    // Lock scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!story) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ease-out ${isEntering ? 'bg-black/0' : 'bg-black/90 backdrop-blur-sm'
                }`}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            {/* Close */}
            <button
                onClick={handleClose}
                className={`absolute top-5 right-5 z-50 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 ${isEntering ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                    }`}
            >
                <X className="w-4.5 h-4.5" />
            </button>

            {/* Nav Arrows */}
            {currentIndex > 0 && (
                <button
                    onClick={goPrev}
                    className={`absolute left-3 sm:left-6 lg:left-12 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/15 hover:text-white transition-all duration-200 ${isEntering ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            {currentIndex < stories.length - 1 && (
                <button
                    onClick={goNext}
                    className={`absolute right-3 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/15 hover:text-white transition-all duration-200 ${isEntering ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Story Card */}
            <div
                ref={containerRef}
                className={`relative w-full max-w-[400px] aspect-[9/16] max-h-[740px] rounded-xl overflow-hidden transition-all duration-300 ease-out`}
                style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)' }}
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-30 flex gap-[3px] px-3 pt-2.5">
                    {stories.map((_, idx) => (
                        <div key={idx} className="flex-1 h-[2.5px] rounded-full bg-white/20 overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                                    backgroundColor: idx <= currentIndex ? 'white' : 'transparent',
                                    opacity: idx < currentIndex ? 0.7 : 1,
                                    transition: idx === currentIndex ? 'width 40ms linear' : 'none',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Image */}
                <Image
                    src={story.thumbnail_image?.preview}
                    alt={story.title}
                    fill
                    className="object-fill"
                    sizes="400px"
                    priority
                    key={story.id}
                />

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />

                {/* Top Bar */}
                <div className="absolute top-7 left-0 right-0 px-4 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div

                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center ring-2 ring-white/20">


                            <Image
                                src={imglogo}
                                alt="Fatafatsewa Logo"
                                width={120}
                                height={40}
                                priority

                            />
                        </div>
                        <div>
                            <p className="text-white text-[11px] font-semibold leading-none">Fatafat Sewa</p>
                            <p className="text-white/50 text-[9px] mt-0.5">{formatDate(story.publish_date)}</p>
                        </div>
                    </div>
                    {/* <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all">
                        <Share2 className="w-3.5 h-3.5" />
                    </button> */}
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-1 z-20">
                    {/* Category */}
                    <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-1 border border-white/10">
                        {story.category?.title}
                    </span>

                    {/* Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug mb-2 line-clamp-3 tracking-[-0.01em]">
                        {story.title}
                    </h2>

                    {/* Author */}
                    <div className="flex items-center gap-2 text-[11px] text-white/60 mb-4">
                        <span className="font-medium text-white/80">{story.author}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40" />
                        <span>{formatDate(story.publish_date)}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={`/blogs/${story.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--colour-fsP2)]/80 group/btn flex-1 relative flex items-center justify-center gap-2 text-white text-[13px] font-semibold py-2 rounded-xl overflow-hidden transition-all duration-300  active:scale-[0.98]"

                        >
                            <BookOpen className="w-4 h-4 transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
                            <span>Read Story</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-200" />
                        </Link>
                        <Link
                            href="/category/smartphones?id=1"
                            onClick={(e) => e.stopPropagation()}
                            className="group/btn flex items-center justify-center gap-2 bg-[var(--colour-fsP2)]/80 backdrop-blur-md text-white text-[13px] font-semibold py-2 px-5 rounded-2xl transition-all duration-300 border border-white/15 hover:bg-white/20 hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-inset ring-white/5"
                        >
                            <ShoppingCart className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-[-8deg]" />
                            <span>Shop</span>
                        </Link>
                    </div>
                </div>

                {/* Tap zones */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
                    <div className="w-1/3 h-full" />
                    <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
                </div>
            </div>

            {/* Counter */}
            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-medium tracking-wide transition-opacity duration-300 ${isEntering ? 'opacity-0' : 'opacity-100'
                }`}>
                {currentIndex + 1} / {stories.length}
            </div>
        </div>
    );
}
