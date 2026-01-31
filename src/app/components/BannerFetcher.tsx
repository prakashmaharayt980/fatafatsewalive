import React from 'react';
import RemoteServices from '../api/remoteservice';

interface BannerFetcherProps {
    slug: string;
    Component: any;
    propName?: string; // Optional: name of the prop to pass data to (default: 'data')
    className?: string;
    // Allow passing additional props to the Component
    [key: string]: any;
}

const BannerFetcher = async ({
    slug,
    Component,
    propName = 'data',
    className,
    ...rest
}: BannerFetcherProps) => {
    let data = null;
    try {
        const res = await RemoteServices.getBannerSlug(slug);
        data = res.data?.[0] || null;
    } catch (error) {
        console.error(`Failed to fetch banner for slug: ${slug}`, error);
    }

    if (!data) return null;

    const componentProps = {
        [propName]: data,
        ...rest
    };

    return (
        <div className={className}>
            <Component {...componentProps} />
        </div>
    );
};

export default BannerFetcher;
