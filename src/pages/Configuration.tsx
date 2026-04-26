import { Link } from 'react-router-dom';
import { Bell, UserRound, Phone, ArrowRight } from 'lucide-react';

const hubItems = [
  {
    to: '/configuracion/notificaciones',
    title: 'Notificaciones y alertas',
    description: 'Activar avisos de salud, medicación y recordatorios diarios.',
    icon: Bell,
  },
  {
    to: '/contacto-emergencia',
    title: 'Contacto de emergencia',
    description: 'Persona a avisar en caso de alerta o emergencia.',
    icon: Phone,
  },
  {
    to: '/configuracion/perfil',
    title: 'Mi perfil',
    description: 'Foto, teléfono, edad, sexo y datos clínicos básicos guardados en el dispositivo.',
    icon: UserRound,
  },
] as const;

export const Configuration = () => {
  return (
    <div className="screen configuration-screen">
      <div className="page-topbar configuration-topbar">
        <h1>Configuración</h1>
      </div>
      <p className="configuration-intro">
        Elija una opción para ajustar la aplicación a sus necesidades.
      </p>

      <div className="configuration-hub-grid">
        {hubItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="configuration-hub-card">
              <span className="configuration-hub-icon">
                <Icon size={28} strokeWidth={2} />
              </span>
              <div className="configuration-hub-text">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <ArrowRight className="configuration-hub-chevron" size={26} aria-hidden />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
