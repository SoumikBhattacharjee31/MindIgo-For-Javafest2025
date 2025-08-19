import React from 'react';
import Navbar from './components/Navbar';
import MetaHead from './components/MetaHead';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import AdditionalFeaturesSection from './components/AdditionalFeaturesSection';
import TechSection from './components/TechSection';
import CTASection from './components/CTASection';

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">

      <MetaHead />

      <Navbar />

      <HeroSection />
      
      <FeaturesSection />

      <AdditionalFeaturesSection />

      <TechSection />
      
      <CTASection />
      
      <Footer />
    </div>
  );
};

export default Page;