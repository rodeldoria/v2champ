import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Menu, X } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme } = useThemeStore();
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Set page loaded after a short delay for animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Mobile menu button */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rotate-90' 
            : 'bg-primary-500 text-white scale-100'
        }`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} className="animate-fade-in" /> : <Menu size={24} className="animate-fade-in" />}
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-40 transform 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          bg-white dark:bg-gray-800 w-[280px] md:w-64 mt-16 md:mt-0
          overflow-y-auto
          shadow-lg md:shadow-none
        `}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        
        {/* Page content */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6 pt-20 md:pt-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
          onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
        >
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;