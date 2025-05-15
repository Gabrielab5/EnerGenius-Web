
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavigation = () => {
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
        <span className="nav-text">Home</span>
      </NavLink>
      
      <NavLink
        to="/upload"
        className={({ isActive }) =>
          cn("nav-item", isActive ? "active" : "")
        }
      >
        <Upload className="nav-icon" />
        <span className="nav-text">Upload</span>
      </NavLink>
      
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn("nav-item", isActive ? "active" : "")
        }
      >
        <Settings className="nav-icon" />
        <span className="nav-text">Settings</span>
      </NavLink>
    </nav>
  );
};
