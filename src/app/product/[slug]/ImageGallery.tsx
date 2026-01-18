import React from "react";
import Image from "next/image";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";

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
    <>
      <div className="w-full h-full max-w-lg flex flex-col gap-3 sm:gap-1 justify-center">
        {/* Main Image Container */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-white overflow-hidden group">
          <Image
            src={selectedImage || currentImages[0]}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-500`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 60vw"
          />
        </div>

        {/* Thumbnail Strip */}
        {currentImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide items-center justify-center p-2">
            {currentImages.slice(0, 4).map((image, idx) => (
              <div
                key={`thumbnail-${idx}`}
                className={`relative w-16 h-16 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 flex-shrink-0 group/thumb 
                  ${selectedImage === image
                    ? "ring-2 ring-[var(--colour-fsP2)] ring-offset-2"
                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                  }`}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover/thumb:scale-105"
                  fill
                  quality={85}
                  sizes="(max-width: 640px) 64px, 80px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ImageGallery;