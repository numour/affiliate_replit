import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  {
    src: "https://images.unsplash.com/photo-1619451334481-e01c6ede5ea5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Purple skincare product"
  },
  {
    src: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Natural skincare ingredients"
  },
  {
    src: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Model with glowing skin"
  },
  {
    src: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Purple skincare packaging"
  }
];

const ProductCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 relative">
      <h3 className="font-outfit font-semibold text-lg mb-4">Our Products</h3>
      
      <div className="relative h-48 rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex].src}
            alt={images[activeIndex].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, index) => (
          <button 
            key={index}
            onClick={() => setActiveIndex(index)} 
            className={`w-2 h-2 rounded-full transition-colors ${
              activeIndex === index ? 'bg-numourPurple' : 'bg-numourLavender'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
