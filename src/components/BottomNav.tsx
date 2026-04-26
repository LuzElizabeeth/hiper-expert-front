import { Link, useLocation } from 'react-router-dom';
import { Activity, ClipboardPlus, History, Home, UserRound } from 'lucide-react';

const navItems = [
  {
    path: '/',
    label: 'Inicio',
    icon: Home,
  },
  {
    path: '/evaluacion',
    label: 'Evaluar',
    icon: ClipboardPlus,
  },
  {
    path: '/resultado',
    label: 'Resultado',
    icon: Activity,
  },
  {
    path: '/historial',
    label: 'Historial',
    icon: History,
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: UserRound,
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