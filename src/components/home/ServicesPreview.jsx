// src/components/home/ServicesPreview.jsx
import React from 'react';
import { Briefcase, GraduationCap, Home, Heart, FileText } from 'lucide-react';
import { SERVICES } from '../../utils/constants';

const ServicesPreview = () => {
  // Map icon names to actual icon components
  const iconMap = {
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Home': Home,
    'Heart': Heart,
    'FileText': FileText
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos Services d'Expert
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une gamme complète de services pour réussir votre immigration au Canada et au Québec
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {SERVICES.map((service) => {
            const IconComponent = iconMap[service.icon] || Briefcase;
            
            return (
              <div
                key={service.id}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden hover:-translate-y-2"
              >
                {/* Gradient bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                    <IconComponent className="text-blue-600 group-hover:text-white transition-colors duration-300" size={32} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Hidden arrow that appears on hover */}
                <div className="mt-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-semibold">En savoir plus →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/booking"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Découvrir tous nos services
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;