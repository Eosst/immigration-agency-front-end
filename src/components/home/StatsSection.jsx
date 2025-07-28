// src/components/home/StatsSection.jsx
import React, { useState, useEffect } from 'react';
import { STATS } from '../../utils/constants';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState(STATS.map(() => 0));

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('stats-section');
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
        if (isInViewport && !isVisible) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      STATS.forEach((stat, index) => {
        const targetValue = parseInt(stat.value.replace(/[^\d]/g, ''));
        const duration = 2000; // 2 seconds
        const steps = 50;
        const increment = targetValue / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
          }
          
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = Math.floor(current);
            return newCounters;
          });
        }, duration / steps);

        return () => clearInterval(timer);
      });
    }
  }, [isVisible]);

  const formatValue = (value, originalFormat) => {
    if (originalFormat.includes('+')) return `${value}+`;
    if (originalFormat.includes('%')) return `${value}%`;
    if (originalFormat.includes('/')) return originalFormat;
    return value.toString();
  };

  return (
    <section id="stats-section" className="bg-gradient-to-r from-blue-900 to-blue-600 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                {isVisible ? formatValue(counters[index], stat.value) : '0'}
              </div>
              <p className="text-white text-lg opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;