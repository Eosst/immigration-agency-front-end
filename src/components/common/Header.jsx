import React, { useState } from 'react';
import { Leaf, Menu, X } from 'lucide-react';
import { COMPANY_INFO } from '../../utils/constants';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'À propos', href: '/#about' },
    { label: 'Services', href: '/#services' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-lg">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border-2 border-white/20">
              <Leaf className="text-yellow-400" size={24} />
            </div>
            <div>
              <div className="text-xl font-bold">{COMPANY_INFO.name}</div>
              <div className="text-xs opacity-80">{COMPANY_INFO.tagline}</div>
            </div>
            {/* Flags */}
            <div className="hidden sm:flex space-x-2">
              <div className="w-6 h-4 bg-gradient-to-r from-red-600 via-white to-red-600 rounded shadow-sm relative">
                <span className="absolute inset-0 flex items-center justify-center text-xs">🍁</span>
              </div>
              <div className="w-6 h-4 bg-gradient-to-b from-blue-700 to-white rounded shadow-sm"></div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <a 
                  href={item.href} 
                  className="hover:text-yellow-400 transition-colors font-medium"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a 
                href="/booking" 
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-6 py-2.5 rounded-full font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Prendre RDV
              </a>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    className="block py-2 hover:text-yellow-400 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a 
                  href="/booking" 
                  className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-6 py-2.5 rounded-full font-bold mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Prendre RDV
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;