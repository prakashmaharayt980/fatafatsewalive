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

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-square bg-white rounded-xl overflow-hidden border border-gray-200">
        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Fullscreen Icon */}
        <button className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Main Image */}
        <div className="relative w-full h-full p-4">
          <Image
            src={selectedImage || currentImages[0]}
            alt={product.name}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 400px"
          />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {currentImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {currentImages.slice(0, 6).map((image, idx) => (
            <button
              key={`thumbnail-${idx}`}
              className={cn(
                "relative w-16 h-16 cursor-pointer overflow-hidden rounded-lg transition-all flex-shrink-0 border-2",
                selectedImage === image
                  ? "border-[var(--colour-fsP2)] shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image}
                alt={`${product.name} - View ${idx + 1}`}
                className="object-contain p-1"
                fill
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;