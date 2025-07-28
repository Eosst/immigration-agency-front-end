// src/components/home/ExpertProfile.jsx
import React from 'react';
import { UserCircle, Award, Clock, CheckCircle, Calendar } from 'lucide-react';
import { COMPANY_INFO } from '../../utils/constants';

const ExpertProfile = () => {
  return (
    <section id="about" className="bg-gradient-to-b from-gray-50 to-gray-100 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Profile Image */}
          <div className="text-center md:text-left">
            <div className="relative inline-block">
              <div className="w-64 h-80 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl shadow-2xl mx-auto md:mx-0 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/10 to-transparent"></div>
                <UserCircle className="text-white relative z-10" size={120} />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg whitespace-nowrap">
                CRIC-CISR | RCIC-IRB
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {COMPANY_INFO.expert.name}
            </h2>
            <p className="text-xl text-blue-600 font-semibold mb-6">
              {COMPANY_INFO.expert.title}
            </p>

            {/* Credentials */}
            <div className="space-y-3 mb-6">
              {COMPANY_INFO.expert.credentials.map((credential, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="text-yellow-500 mt-0.5" size={20} />
                  <span className="text-gray-700">{credential}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              Expert reconnu en immigration canadienne, {COMPANY_INFO.expert.name} accompagne 
              avec passion et professionnalisme les individus et familles dans leur projet 
              d'immigration au Canada. Sa certification officielle et son expérience approfondie 
              garantissent un service de qualité supérieure adapté à chaque situation unique.
            </p>

            {/* CTA Button */}
            <a
              href="/booking"
              className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-8 py-3 rounded-full font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Calendar className="mr-2" size={20} />
              Consulter avec {COMPANY_INFO.expert.name.split(' ')[0]}
            </a>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10+</div>
                <div className="text-sm text-gray-600">Années d'expérience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertProfile;