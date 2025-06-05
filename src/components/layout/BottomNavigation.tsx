

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export const BottomNavigation = () => {
  const { t } = useLanguage();
  
  return (
    <nav className="mobile-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn("nav-item", isActive ? "active" : "")
        }
        end
      >
        <Home className="nav-icon" />
        <span className="nav-text">{t('nav.home')}</span>
      </NavLink>
      
      <NavLink
        to="/upload"
        className={({ isActive }) =>
          cn("nav-item", isActive ? "active" : "")
        }
      >
        <Upload className="nav-icon" />
        <span className="nav-text">{t('nav.upload')}</span>
      </NavLink>
      
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn("nav-item", isActive ? "active" : "")
        }
      >
        <Settings className="nav-icon" />
        <span className="nav-text">{t('nav.settings')}</span>
      </NavLink>
    </nav>
  );
};

