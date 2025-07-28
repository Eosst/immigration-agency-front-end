import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSection from '../components/home/HeroSection';
import ExpertProfile from '../components/home/ExpertProfile';
import ServicesPreview from '../components/home/ServicesPreview';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ExpertProfile />
        <ServicesPreview />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;