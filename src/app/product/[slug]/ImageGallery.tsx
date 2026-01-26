// ImageGallery.tsx
import React from "react";
import Image from "next/image";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { Heart, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  product: ProductDetails;
  images: string[];
  selectedImage: string;
  setSelectedImage: (image: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  product,
  images,
  selectedImage,
  setSelectedImage
}) => {
  const currentImages = images.length > 0 ? images : [product.image.full];
  const isInStock = product.quantity > 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden border border-gray-200">
        {/* Stock Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={cn(
            "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide",
            isInStock
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          )}>
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Fullscreen Icon */}
        <button className="absolute bottom-3 right-3 z-10 w-7 h-7 rounded bg-black/50 flex items-center justify-center text-white/80 hover:bg-black/70 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Main Image */}
        <div className="relative w-full h-full p-4">
          <Image
            src={selectedImage || currentImages[0]}
            alt={product.name}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 400px"
          />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {currentImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {currentImages.slice(0, 5).map((image, idx) => (
            <button
              key={`thumbnail-${idx}`}
              className={cn(
                "relative w-14 h-14 cursor-pointer overflow-hidden rounded-lg transition-all flex-shrink-0 border-2",
                selectedImage === image
                  ? "border-[var(--colour-fsP2)]"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image}
                alt={`View ${idx + 1}`}
                className="object-contain p-1"
                fill
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;