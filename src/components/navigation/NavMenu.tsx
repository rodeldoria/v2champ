import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavMenuProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const NavMenu: React.FC<NavMenuProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        className="w-full flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 transition-colors duration-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <Icon size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-500 dark:text-gray-400 transition-transform duration-300" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 transition-transform duration-300" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-1 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-1 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
};