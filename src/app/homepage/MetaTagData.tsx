'use client';

import { useState, useMemo } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerTypes } from "@/app/types/BannerTypes";

interface MetaTagDataProps {
    bannerData?: BannerTypes;
}

const MetaTagData = ({ bannerData }: MetaTagDataProps) => {
    // Generate dynamic SEO content based on banner types
    const seoContent = useMemo(() => {
        if (!bannerData?.data || bannerData.data.length === 0) {
            return getSeoContent();
        }

        // Get unique banner types/slugs for SEO
        const bannerTypes = bannerData.data.map(banner => ({
            name: banner.name,
            slug: banner.slug,
            imageCount: banner.images?.length || 0
        }));

        return getSeoContent(bannerTypes);
    }, [bannerData]);

    // Preview content using slice (first ~450 characters + ellipsis)
    const previewContent = seoContent.slice(0, 450) + "...";

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-white w-full max-w-8xl mx-auto p-6 rounded-lg shadow-sm">
            <div
                className="text-gray-700 space-y-4"
                dangerouslySetInnerHTML={{ __html: isExpanded ? seoContent : previewContent }}
            />
            <button
                onClick={toggleExpand}
                className="mt-4 flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-300"
            >
                <span>{isExpanded ? '   Read Less' : '   Read More'}</span>
                <ArrowDown className={cn(
                    "ml-2 transform transition-transform duration-300",
                    isExpanded && "rotate-180"
                )}
                />
            </button>

        </div>
    );
};

/**
 * Generate SEO content based on banner types
 * @param bannerTypes - Array of banner type information
 * @returns HTML string with SEO content
 */
function getSeoContent(bannerTypes?: Array<{ name: string; slug: string; imageCount: number }>) {
    const bannerSection = bannerTypes && bannerTypes.length > 0
        ? `
    <h3>Featured Banners</h3>
    <p>Explore our featured banners and promotions:</p>
    <ul>
        ${bannerTypes.map(banner =>
            `<li><strong>${banner.name}</strong> - ${banner.imageCount} promotional images</li>`
        ).join('\n        ')}
    </ul>
    `
        : '';

    return `
    <h1><strong>Nepal's first service-oriented Shopping Site</strong></h1>
    <p>Fatafat Sewa: Your Go-To Destination for Online Shopping in Nepal with EMI Services. We're Nepal's first service-oriented online shopping platform since Jan 1, 2021. Fatafat Sewa offers you a fast, easy, and hassle-free shopping experience. We know your time is valuable, and that's why we've made shopping as simple as possible. Whether you're looking for the latest mobile phone, a new laptop, a high-quality camera, or even home appliances, Fatafat Sewa has it all, with the added benefit of EMI services to make shopping more affordable!</p>

    ${bannerSection}

    <h3>What Can You Shop</h3>
    <p>From mobiles, laptops, and drones to cameras and home appliances, we have a wide variety of products waiting for you. Our collection includes top brands like Samsung, Canon, GoPro, and more. You can even find liquor and essential hardware accessories—everything you need in one place!</p>
    <ul>
      <li><strong>Mobile Phones</strong> - Looking for a new phone? Whether you're after something budget-friendly or a high-end smartphone, we've got plenty of options. Choose from top brands like Samsung, Xiaomi, Oppo, and OnePlus. And if you're worried about breaking the bank, don't be! With our EMI options, you can easily pay in manageable installments with 0% interest for up to 18 months.</li>
      <li><strong>DSLR Cameras & Drones</strong> - For those who love photography, our range of DSLR cameras from Canon, Sony, and GoPro is perfect for capturing those precious moments. And if you're into drones, we have a variety of models to suit your needs—from beginner-friendly options to professional drones.</li>
      <li><strong>Laptops</strong> - If you're in the market for a new laptop, Fatafat Sewa has you covered. We offer a wide range of laptops, perfect for students, professionals, or gamers. You can filter your search based on your needs, whether you're after something for work, school, or gaming. Plus, our EMI services make it easy to pay in installments, making it even more affordable.</li>
      <li><strong>Home Appliances</strong> - Looking to upgrade your home? From microwaves and refrigerators to ACs and sandwich makers, we have appliances that will make your life easier. And with EMI options, you can spread the cost over several months, so you don't have to worry about paying upfront.</li>
      <li><strong>Liquor and Beverages</strong> - Want to celebrate or surprise someone with a special gift? We offer a selection of fine liquors and beverages for any occasion. Browse our collection of whiskeys, wines, and more!</li>
      <li><strong>Hardware Accessories</strong> - If you're working on a project, Fatafat Sewa also offers a variety of hardware tools like drill machines, grinders, and heat guns, so you can get your work done efficiently and with the right tools.</li>
    </ul>

    <h3>Why Shop at Fatafat Sewa?</h3>
    <ul>
      <li><strong>Flexible EMI Services</strong> - Enjoy 0% EMI on electronics, home appliances, and more, making it easier to buy the things you need without breaking the bank. Nationwide Delivery - No matter where you are in Nepal, we deliver straight to your doorstep.</li>
      <li><strong>Mobile Exchange Offers</strong> - Trade in your old phone and get an instant discount on your new device! Free Delivery - Get free delivery on all orders—no hidden fees, just great service.</li>
      <li><strong>Shop Worldwide</strong> - You can even shop from anywhere in the world and send gifts to loved ones in Nepal. Hassle-Free Returns - Not happy with your purchase? Our easy return policy ensures you can shop with peace of mind.</li>
    </ul>

    <h3>Customer Support, Anytime!</h3>
    <p>Got questions? Our 24/7 support team is always here to help you with anything you need. We're committed to making your shopping experience as smooth as possible. Visit Us Online or In-Store.</p>

    <h3>Meta Tags for SEO & Google PageSpeed Insights</h3>
    <pre><code>&lt;meta charset='UTF-8'&gt;
&lt;meta name='viewport' content='width=device-width, initial-scale=1.0'&gt;
&lt;meta name='description' content='Fatafat Sewa - Fast and reliable online shopping in Nepal with quick delivery.'&gt;
&lt;meta name='keywords' content='online shopping Nepal, fast delivery, e-commerce Nepal'&gt;
&lt;meta name='robots' content='index, follow'&gt;
&lt;link rel='canonical' href='https://fatafatsewa.com/'&gt;</code></pre>
    <p>These meta tags are optimized for SEO and performance in tools like Google PageSpeed Insights, ensuring mobile-friendliness and better indexing.</p>
  `;
}

export default MetaTagData;