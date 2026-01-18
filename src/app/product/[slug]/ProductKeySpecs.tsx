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
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-[var(--colour-fsP1)] rounded-full"></div>
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
                            <div className="mt-0.5 p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <Icon className="w-4 h-4 text-[var(--colour-fsP1)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                                    {spec.label}
                                </div>
                                <div className="text-sm font-medium text-gray-900 leading-tight">
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
