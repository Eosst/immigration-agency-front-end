// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Graphic */}
            <div className="relative mb-8">
              <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                  <AlertTriangle className="text-blue-600" size={40} />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Page Introuvable
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Oops! La page que vous recherchez semble avoir pris un vol vers une destination inconnue.
              </p>
              <p className="text-gray-500">
                Il se peut que cette page ait été déplacée, supprimée, ou que l'URL soit incorrecte.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Home className="mr-2" size={20} />
                Retour à l'Accueil
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <ArrowLeft className="mr-2" size={20} />
                Page Précédente
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pages Populaires
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/"
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <Home className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-gray-700">Accueil</span>
                </Link>
                
                <Link
                  to="/booking"
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <MapPin className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-gray-700">Prendre Rendez-vous</span>
                </Link>
                
                <Link
                  to="/#services"
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700">Nos Services</span>
                </Link>
                
                <Link
                  to="/#contact"
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700">Contact</span>
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Besoin d'aide?
              </h3>
              <p className="text-gray-600 mb-4">
                Si vous pensez qu'il s'agit d'une erreur ou si vous avez besoin d'assistance, 
                n'hésitez pas à nous contacter.
              </p>
              <Link
                to="/#contact"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Nous Contacter
                <ArrowLeft className="ml-1 rotate-180" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;