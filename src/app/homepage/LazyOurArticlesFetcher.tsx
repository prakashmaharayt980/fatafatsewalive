'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import OurArticles from './OurArticles';
import { BlogService } from '@/app/api/services/blog.service';

export default function LazyOurArticlesFetcher({ blogpage }: { blogpage: string }) {
    const [articles, setArticles] = useState<any[] | undefined>(undefined);
    const [hasFetched, setHasFetched] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    useEffect(() => {
        if (inView && !hasFetched) {
            setHasFetched(true);

            BlogService.getBlogList({ per_page: 10 })
                .then((response) => {
                    if (response && response.data) {
                        setArticles(response.data);
                    } else {
                        setArticles([]);
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch lazy articles:", error);
                    setArticles([]);
                });
        }
    }, [inView, hasFetched]);

    return (
        <div ref={ref} className="min-h-[200px] w-full mt-4">
            <OurArticles blogpage={blogpage} initialData={articles} />
        </div>
    );
}
