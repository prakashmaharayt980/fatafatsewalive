import React from 'react';
import { Monitor, Cpu, Camera, Battery, HardDrive, Smartphone } from 'lucide-react';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { cn } from '@/lib/utils';

interface ProductKeySpecsProps {
    product: ProductDetails;
}

const ProductKeySpecs: React.FC<ProductKeySpecsProps> = ({ product }) => {
    const specs = product.attributes?.product_attributes || {};

    // Define key specs to display with icons
    const keySpecs = [
        {
            icon: Monitor,
            label: 'Display',
            value: specs['Display'] || specs['Screen Size'] || 'N/A'
        },
        {
            icon: Cpu,
            label: 'Processor',
            value: specs['Processor'] || specs['CPU'] || specs['Chipset'] || 'N/A'
        },
        {
            icon: Camera,
            label: 'Camera',
            value: specs['Camera'] || specs['Rear Camera'] || specs['Main Camera'] || 'N/A'
        },
        {
            icon: Battery,
            label: 'Battery',
            value: specs['Battery'] || specs['Battery Capacity'] || 'N/A'
        },
        {
            icon: HardDrive,
            label: 'Storage',
            value: specs['Storage'] || specs['Internal Storage'] || 'N/A'
        },
        {
            icon: Smartphone,
            label: 'RAM',
            value: specs['RAM'] || specs['Memory'] || 'N/A'
        }
    ];

    // Filter out specs with 'N/A' values
    const availableSpecs = keySpecs.filter(spec => spec.value !== 'N/A');

    if (availableSpecs.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/50 backdrop-blur-sm border border-gray-100/80 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wide flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[var(--colour-fsP1)] rounded-full ring-4 ring-blue-50"></div>
                Key Specifications
            </h3>

            <div className="space-y-3">
                {availableSpecs.map((spec, index) => {
                    const Icon = spec.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white transition-colors group"
                        >
                            <div className="mt-0.5 p-2.5 rounded-xl bg-blue-50/80 group-hover:bg-blue-100 text-blue-600 transition-colors">
                                <Icon className="w-5 h-5 text-[var(--colour-fsP1)]" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                                    {spec.label}
                                </div>
                                <div className="text-sm font-medium text-gray-900 leading-tight border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    {spec.value}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Link to full specs */}
            <a
                href="#specifications"
                className="block mt-4 pt-3 border-t border-gray-200 text-xs font-semibold text-[var(--colour-fsP1)] hover:text-[var(--colour-fsP2)] transition-colors text-center"
            >
                View Full Specifications →
            </a>
        </div>
    );
};

export default ProductKeySpecs;
