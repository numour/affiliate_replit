import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AffiliateForm from "@/components/AffiliateForm";
import BenefitsList from "@/components/BenefitsList";
import ProductCarousel from "@/components/ProductCarousel";
import Footer from "@/components/Footer";
import { createBlobs } from "@/lib/utils";

const Home = () => {
  const [blobStyles, setBlobStyles] = useState({
    topRight: {},
    bottomLeft: {},
  });

  // Animate blobs
  useEffect(() => {
    setBlobStyles(createBlobs());
    
    const interval = setInterval(() => {
      setBlobStyles(createBlobs());
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-numourLightLavender min-h-screen font-sans text-numourDark">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute top-0 right-0 bg-numourLavender opacity-20 rounded-full filter blur-3xl transition-all duration-[15s]" 
          style={blobStyles.topRight}
        />
        <div 
          className="absolute bottom-0 left-0 bg-numourPurple opacity-10 rounded-full filter blur-3xl transition-all duration-[15s]" 
          style={blobStyles.bottomLeft}
        />
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Header />
        
        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
          
          {/* Left Side - Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
            <div className="space-y-6">
              <BenefitsList />
              <ProductCarousel />
            </div>
          </div>
          
          {/* Right Side - Form */}
          <AffiliateForm />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Home;
