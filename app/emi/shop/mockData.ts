import type { ProductSummary } from '@/app/types/ProductDetailsTypes'

export const MOCK_EMI_PRODUCTS: Record<string, any[]> = {
    'mobile-price-in-nepal': [
        {
            id: 9991,
            name: 'iPhone 16 Pro Max (256GB, Titanium)',
            slug: 'iphone-16-pro-max-mock',
            price: 214000,
            original_price: 220000,
            discounted_price: 214000,
            emi_enabled: 1,
            average_rating: 4.9,
            brand: { name: 'Apple' },
            image: { full: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 9992,
            name: 'Samsung Galaxy S24 Ultra (12/256GB)',
            slug: 'samsung-s24-ultra-mock',
            price: 184999,
            original_price: 199999,
            discounted_price: 184999,
            emi_enabled: 1,
            average_rating: 4.8,
            brand: { name: 'Samsung' },
            image: { full: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 9993,
            name: 'Google Pixel 9 Pro (Hazle)',
            slug: 'google-pixel-9-pro-mock',
            price: 145000,
            original_price: 155000,
            discounted_price: 145000,
            emi_enabled: 1,
            average_rating: 4.7,
            brand: { name: 'Google' },
            image: { full: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 9994,
            name: 'OnePlus 12 (16/512GB)',
            slug: 'oneplus-12-mock',
            price: 124999,
            original_price: 139999,
            discounted_price: 124999,
            emi_enabled: 1,
            average_rating: 4.6,
            brand: { name: 'OnePlus' },
            image: { full: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 9995,
            name: 'Nothing Phone (2a) Plus',
            slug: 'nothing-phone-2a-plus-mock',
            price: 54999,
            original_price: 59999,
            discounted_price: 54999,
            emi_enabled: 1,
            average_rating: 4.5,
            brand: { name: 'Nothing' },
            image: { full: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600&auto=format&fit=crop' }
        }
    ],
    'laptop-price-in-nepal': [
        {
            id: 8881,
            name: 'MacBook Pro 14 M3 Max (36GB/1TB)',
            slug: 'macbook-pro-m3-max-mock',
            price: 445000,
            original_price: 460000,
            discounted_price: 445000,
            emi_enabled: 1,
            average_rating: 5.0,
            brand: { name: 'Apple' },
            image: { full: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 8882,
            name: 'Dell XPS 15 9530 (i9-13th/32GB/1TB)',
            slug: 'dell-xps-15-mock',
            price: 325000,
            original_price: 350000,
            discounted_price: 325000,
            emi_enabled: 1,
            average_rating: 4.8,
            brand: { name: 'Dell' },
            image: { full: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 8883,
            name: 'ASUS ROG Zephyrus G14 (2024)',
            slug: 'asus-rog-g14-mock',
            price: 285000,
            original_price: 310000,
            discounted_price: 285000,
            emi_enabled: 1,
            average_rating: 4.9,
            brand: { name: 'ASUS' },
            image: { full: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 8884,
            name: 'HP Spectre x360 14 (i7-13th/16GB)',
            slug: 'hp-spectre-mock',
            price: 225000,
            original_price: 245000,
            discounted_price: 225000,
            emi_enabled: 1,
            average_rating: 4.7,
            brand: { name: 'HP' },
            image: { full: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 8885,
            name: 'Acer Swift Go 14 (OLED)',
            slug: 'acer-swift-go-mock',
            price: 115000,
            original_price: 125000,
            discounted_price: 115000,
            emi_enabled: 1,
            average_rating: 4.5,
            brand: { name: 'Acer' },
            image: { full: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop' }
        }
    ],
    'trending-picks': [
        {
            id: 7771,
            name: 'iPad Pro M4 (13-inch, 256GB)',
            slug: 'ipad-pro-m4-mock',
            price: 185000,
            original_price: 195000,
            discounted_price: 185000,
            emi_enabled: 1,
            average_rating: 5.0,
            brand: { name: 'Apple' },
            image: { full: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 7772,
            name: 'Sony WH-1000XM5 Noise Canceling',
            slug: 'sony-wh1000xm5-mock',
            price: 48000,
            original_price: 52000,
            discounted_price: 48000,
            emi_enabled: 1,
            average_rating: 4.9,
            brand: { name: 'Sony' },
            image: { full: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 7773,
            name: 'PlayStation 5 Slim (Disc Edition)',
            slug: 'ps5-slim-mock',
            price: 78000,
            original_price: 85000,
            discounted_price: 78000,
            emi_enabled: 1,
            average_rating: 4.8,
            brand: { name: 'Sony' },
            image: { full: 'https://images.unsplash.com/photo-1605898930773-7548f4ef647b?q=80&w=600&auto=format&fit=crop' }
        },
        {
            id: 7774,
            name: 'GoPro HERO13 Black (Special Bundle)',
            slug: 'gopro-hero13-mock',
            price: 65000,
            original_price: 72000,
            discounted_price: 65000,
            emi_enabled: 1,
            average_rating: 4.7,
            brand: { name: 'GoPro' },
            image: { full: 'https://images.unsplash.com/photo-1542156822-6924d1a71ace?q=80&w=600&auto=format&fit=crop' }
        }
    ]
};
