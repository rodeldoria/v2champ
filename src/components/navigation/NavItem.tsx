import React from 'react';
import { NavLink } from 'react-router-dom';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          isActive 
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 transform scale-105' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
        }`
      }
    >
      <Icon size={18} className="mr-3 transition-transform duration-300 group-hover:rotate-3" />
      <span className="transition-all duration-300">{label}</span>
    </NavLink>
  );
};