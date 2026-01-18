import React from 'react';
import Image from 'next/image';

interface SpotlightProps {
    image: string;
    name: string;
    specs: {
        battery: string;
        chipset: string;
        display: string;
    };
    price: string;
    shopLink: string;
}

const ProductSpotlight = ({ image, name, specs, price, shopLink }: SpotlightProps) => {
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] my-12 flex flex-col md:flex-row items-center gap-8 group hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="relative w-full md:w-1/3 aspect-square md:aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden">
                <Image src={image} alt={name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
            </div>

            <div className="flex-1 space-y-4 w-full text-center md:text-left">
                <h4 className="font-bold text-xl text-gray-900">{name}</h4>
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="w-20 font-medium">Display:</span>
                        <span>{specs.display}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="w-20 font-medium">Chipset:</span>
                        <span>{specs.chipset}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="w-20 font-medium">Battery:</span>
                        <span>{specs.battery}</span>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center gap-3 min-w-[180px]">
                <span className="text-2xl font-bold text-blue-600">{price}</span>
                <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Fatafat Delivery
                </div>
                <a
                    href={shopLink}
                    className="w-full text-center bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors"
                >
                    Buy Now
                </a>
            </div>
        </div>
    );
};

export default ProductSpotlight;
