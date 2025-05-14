import React, { useState } from 'react';
import { FiX, FiZoomIn } from 'react-icons/fi';

const ImageGrid = ({ images = [], maxDisplay = 12 }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
        No images available
      </div>
    );
  }

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length > maxDisplay ? images.length - maxDisplay : 0;

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {displayImages.map((image, index) => (
          <div 
            key={index} 
            className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer group"
            onClick={() => openImageModal(image)}
          >
            <img 
              src={image.url || image} 
              alt={`Survey image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <FiZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all text-xl" />
            </div>
            {image.quality && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                {image.quality}/10
              </div>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-md">
            <span className="text-gray-500 font-medium">+{remainingCount} more</span>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <FiX className="h-6 w-6" />
            </button>
            <img 
              src={selectedImage.url || selectedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-[85vh] object-contain"
            />
            {selectedImage.metadata && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2">
                {selectedImage.metadata.timestamp && (
                  <span className="mr-4">
                    Captured: {new Date(selectedImage.metadata.timestamp).toLocaleString()}
                  </span>
                )}
                {selectedImage.metadata.location && (
                  <span className="mr-4">
                    Location: {selectedImage.metadata.location.lat.toFixed(6)}, {selectedImage.metadata.location.lng.toFixed(6)}
                  </span>
                )}
                {selectedImage.metadata.altitude && (
                  <span>Altitude: {selectedImage.metadata.altitude}m</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGrid;