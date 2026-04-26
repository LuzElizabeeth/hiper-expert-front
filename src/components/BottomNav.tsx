import { Link, useLocation } from 'react-router-dom';
import { Bell, ClipboardPlus, History, Home, PillBottle } from 'lucide-react';

const navItems = [
  {
    path: '/',
    label: 'Inicio',
    icon: Home,
  },
  {
    path: '/configuracion',
    label: 'Alertas',
    icon: Bell,
  },
  {
    path: '/medicacion',
    label: 'Medicación',
    icon: PillBottle,
  },
  {
    path: '/historial',
    label: 'Historial',
    icon: History,
  },
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
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};