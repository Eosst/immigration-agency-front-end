import React from 'react';
import { Calendar, Info, UserCheck, Clock, Globe } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white pt-32 pb-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
                Votre Rêve Canadien
              </span>
              <br />
              Commence Ici
            </h1>
            <p className="text-xl mb-8 text-gray-200 leading-relaxed">
              Expert en immigration au Québec avec plus de 10 ans d'expérience. 
              Nous vous accompagnons dans toutes vos démarches d'immigration, 
              de visa et de résidence permanente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/booking"
                className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <Calendar className="mr-2" size={20} />
                Consultation Gratuite
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 hover:border-yellow-400 transition-all duration-200"
              >
                <Info className="mr-2" size={20} />
                Nos Services
              </a>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative hidden lg:block">
            <div className="relative h-96">
              {/* Floating Cards */}
              <div className="absolute top-5 left-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-float">
                <UserCheck className="text-yellow-400 mb-3" size={32} />
                <h4 className="font-bold text-lg mb-1">98% de Réussite</h4>
                <p className="text-sm text-gray-300">Taux de succès exceptionnel</p>
              </div>

              <div className="absolute top-32 right-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-float-delayed">
                <Clock className="text-yellow-400 mb-3" size={32} />
                <h4 className="font-bold text-lg mb-1">Support 24/7</h4>
                <p className="text-sm text-gray-300">Disponible quand vous en avez besoin</p>
              </div>

              <div className="absolute bottom-10 left-20 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl animate-float-slow">
                <Globe className="text-yellow-400 mb-3" size={32} />
                <h4 className="font-bold text-lg mb-1">Expertise Globale</h4>
                <p className="text-sm text-gray-300">Connaissance approfondie des lois</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 lg:hidden">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <UserCheck className="text-yellow-400 mx-auto mb-2" size={24} />
            <h4 className="font-bold mb-1">98% Réussite</h4>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <Clock className="text-yellow-400 mx-auto mb-2" size={24} />
            <h4 className="font-bold mb-1">Support 24/7</h4>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <Globe className="text-yellow-400 mx-auto mb-2" size={24} />
            <h4 className="font-bold mb-1">Expert Global</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;