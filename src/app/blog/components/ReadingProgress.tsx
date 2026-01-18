'use client';
import React, { useEffect, useState } from 'react';

const ReadingProgress = () => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setWidth(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
            <div
                className="h-full bg-blue-600 transition-all duration-100 ease-out"
                style={{ width: `${width}%` }}
            />
        </div>
    );
};

export default ReadingProgress;
