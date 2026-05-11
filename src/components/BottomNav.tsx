import { Link, useLocation } from 'react-router-dom';
import { Bell, History, Home, PillBottle } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/historial', label: 'Historial', icon: History },
  { path: '/alertas', label: 'Alertas', icon: Bell },
  { path: '/medicacion', label: 'Medicación', icon: PillBottle },
];

const routesWithoutBottomNav = ['/evaluacion'];

export const BottomNav = () => {
  const location = useLocation();

  if (routesWithoutBottomNav.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
          >
            <Icon className="nav-item-icon" size={26} strokeWidth={2.2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
