'use client';

import React, { useState, useRef } from 'react';
import { Play, Eye, Clock } from 'lucide-react';

interface YouTubeVideo {
    id: string;
    title: string;
    channel: string;
    views: string;
    date: string;
    category: string;
}

interface YouTubeVideoCardProps {
    video: YouTubeVideo;
}

export default function YouTubeVideoCard({ video }: YouTubeVideoCardProps) {
    const [isHovering, setIsHovering] = useState(false);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(() => setIsHovering(true), 600);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setIsHovering(false);
    };

    return (
        <div
            className="group bg-white rounded-lg border border-[var(--colour-border3)] overflow-hidden hover:shadow-lg hover:shadow-black/8 transition-all duration-400 flex flex-col hover:-translate-y-0.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Area */}
            <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
                {isHovering ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="absolute inset-0 w-full h-full"
                        loading="lazy"
                    />
                ) : (
                    <>
                        {/* Thumbnail */}
                        <img
                            src={thumbnailUrl}
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            </div>
                        </div>
                        {/* Duration mock */}
                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            {Math.floor(8 + Math.random() * 15)}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
                        </div>
                    </>
                )}
                {/* Category Badge */}
                <div className="absolute top-1.5 left-1.5 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider z-10">
                    {video.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-2.5 flex flex-col flex-1 gap-1.5">
                <h3 className="text-[12px] font-bold text-[var(--colour-text2)] line-clamp-2 leading-snug group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {video.title}
                </h3>
                <div className="flex items-center justify-between mt-auto text-[9px] text-[var(--colour-text3)]">
                    <span className="font-semibold text-[var(--colour-text2)]">{video.channel}</span>
                    <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" />
                            {video.views}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {video.date}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { YouTubeVideo };
