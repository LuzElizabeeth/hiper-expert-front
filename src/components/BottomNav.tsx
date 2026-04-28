import { Link, useLocation } from 'react-router-dom';
import { Bell, ClipboardPlus, HeartPulse, History, Home, PillBottle } from 'lucide-react';

const navItems = [
  {
    path: '/',
    label: 'Inicio',
    icon: Home,
  },
 
  {
    path: '/alertas',
    label: 'Alertas',
    icon: Bell,
  },
   {
    path: '/evaluacion',
    label: 'Presión',
    icon: HeartPulse,
  },
  {
    path: '/medicacion',
    label: 'Medicación',
    icon: PillBottle,
  },
  
 //   {
 //     path: '/historial',
 //     label: 'Historial',
 //     icon: History,
 //   },
    
  {
    path: '/perfil',
    label: 'Registro',
    icon: ClipboardPlus,
  },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path;

        return (
          <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
            <Icon className="nav-item-icon" size={26} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};