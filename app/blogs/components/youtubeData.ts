import { YouTubeVideo } from './YouTubeVideoCard';

/**
 * Shared YouTube video data used in both blog listing and blog details pages.
 * Centralized here to avoid duplicating the same hardcoded arrays.
 */
export const YOUTUBE_VIDEOS: YouTubeVideo[] = [
    { id: 'dQw4w9WgXcQ', title: 'Samsung Galaxy S25 Ultra Review: The Best Phone of 2026?', channel: 'Fatafat Sewa', views: '45K', date: '2 days ago', category: 'Smartphone' },
    { id: 'ScMzIvxBSi4', title: 'iPhone 17 Pro Max vs Galaxy S25 Ultra Camera Test', channel: 'Fatafat Sewa', views: '32K', date: '5 days ago', category: 'Comparison' },
    { id: '2Vv-BfVoq4g', title: 'Top 5 Budget Laptops Under Rs. 80,000 in Nepal', channel: 'Fatafat Sewa', views: '28K', date: '1 week ago', category: 'Laptops' },
    { id: 'jNQXAC9IVRw', title: 'Best TWS Earbuds Under Rs. 5000 — Ranked!', channel: 'Fatafat Sewa', views: '19K', date: '3 days ago', category: 'Audio' },
    { id: 'M7lc1UVf-VE', title: 'OnePlus 13 Complete Review After 30 Days of Use', channel: 'Fatafat Sewa', views: '61K', date: '4 days ago', category: 'Smartphone' },
    { id: 'L_jWHffIx5E', title: 'Smartwatch Showdown: Galaxy Watch 7 vs Apple Watch', channel: 'Fatafat Sewa', views: '14K', date: '6 days ago', category: 'Wearables' },
    { id: 'YE7VzlLtp-4', title: 'Gaming Laptop Guide 2026: What to Buy & Avoid', channel: 'Fatafat Sewa', views: '22K', date: '1 week ago', category: 'Gaming' },
    { id: 'dQw4w9WgXcQ', title: 'Xiaomi 15 Ultra Camera vs iPhone 17 Pro Blind Test', channel: 'Fatafat Sewa', views: '38K', date: '2 days ago', category: 'Camera' },
    { id: 'M7lc1UVf-VE', title: 'OnePlus 13 Complete Review After 30 Days of Use', channel: 'Fatafat Sewa', views: '61K', date: '4 days ago', category: 'Smartphone' },
    { id: 'L_jWHffIx5E', title: 'Smartwatch Showdown: Galaxy Watch 7 vs Apple Watch', channel: 'Fatafat Sewa', views: '14K', date: '6 days ago', category: 'Wearables' },
    { id: 'YE7VzlLtp-4', title: 'Gaming Laptop Guide 2026: What to Buy & Avoid', channel: 'Fatafat Sewa', views: '22K', date: '1 week ago', category: 'Gaming' },
    { id: 'dQw4w9WgXcQ', title: 'Xiaomi 15 Ultra Camera vs iPhone 17 Pro Blind Test', channel: 'Fatafat Sewa', views: '38K', date: '2 days ago', category: 'Camera' },
];

/** Shorter list for the blog details page (first 4 videos) */
export const YOUTUBE_VIDEOS_SHORT = YOUTUBE_VIDEOS.slice(0, 4);
