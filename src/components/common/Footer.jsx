import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              {COMPANY_INFO.name}
            </h3>
            <p className="text-gray-300 mb-4">
              Votre partenaire de confiance pour l'immigration au Canada. Expertise, 
              professionnalisme et accompagnement personnalisé par {COMPANY_INFO.expert.name}, 
              consultant certifié.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#services" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Visa de Travail
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Visa Étudiant
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Résidence Permanente
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Regroupement Familial
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-yellow-400" />
                <span className="text-gray-300">{COMPANY_INFO.contact.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-yellow-400" />
                <span className="text-gray-300">{COMPANY_INFO.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-yellow-400" />
                <span className="text-gray-300">{COMPANY_INFO.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 {COMPANY_INFO.name} - {COMPANY_INFO.expert.name}, CRIC-CISR | RCIC-IRB. 
            Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;