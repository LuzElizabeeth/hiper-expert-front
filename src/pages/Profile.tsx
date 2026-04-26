import { Link } from 'react-router-dom';
import {
  Activity,
  Bell,
  HeartPulse,
  LogOut,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { HealthCard } from '../components/HealthCard';
import { getPressureHistory, getUserProfile } from '../services/expertApi';

export const Profile = () => {
  const profile = getUserProfile();
  const history = getPressureHistory();
  const last = history[0];

  const displayName = profile.displayName.trim() || 'Nombre';

  const subtitleParts: string[] = [];
  if (profile.age != null) subtitleParts.push(`${profile.age} años`);
  if (profile.hasHypertension) subtitleParts.push('Hipertensión');
  if (profile.hasDiabetes) subtitleParts.push('Diabetes');
  if (subtitleParts.length === 0) {
    subtitleParts.push('Paciente cardiovascular');
  }
  const ageLine = subtitleParts.join(' · ');

  const pressureLabel = last ? `${last.systolic}/${last.diastolic}` : 'Sin registro';
  const statusLabel = last ? 'Datos recientes' : 'Registre en Inicio';

  return (
    <div className="screen profile-screen">
      <div className="page-topbar profile-screen-topbar">
        <h1>Mi registro</h1>
        <div className="home-topbar-actions">
          <Link
            to="/configuracion/notificaciones"
            className="icon-button topbar-action-btn"
            aria-label="Notificaciones"
          >
            <Bell size={26} strokeWidth={2} />
          </Link>
          <Link to="/configuracion" className="icon-button topbar-action-btn" aria-label="Configuración">
            <Settings size={26} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="profile-card">
        <div className={profile.photoDataUrl ? 'profile-avatar profile-avatar--photo' : 'profile-avatar'}>
          {profile.photoDataUrl ? (
            <img src={profile.photoDataUrl} alt="" />
          ) : (
            <UserRound size={56} />
          )}
        </div>

        <h1>{displayName}</h1>
        <p>{ageLine}</p>

        <Link to="/configuracion/perfil" className="primary-button profile-edit-cta">
          Editar nombre, foto y datos
        </Link>

        <div className="profile-stats">
          <div>
            <span>Presión</span>
            <strong>{pressureLabel}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{statusLabel}</strong>
          </div>
        </div>
      </div>

      <HealthCard>
        <h2>Información médica</h2>

        <div className="info-row">
          <HeartPulse size={19} />
          <div>
            <span>Enfermedad seleccionada</span>
            <strong>Hipertensión arterial</strong>
          </div>
        </div>

        <div className="info-row">
          <Stethoscope size={19} />
          <div>
            <span>Objetivo del sistema</span>
            <strong>Control y detección temprana de hipertensión</strong>
          </div>
        </div>

        <div className="info-row">
          <Activity size={19} />
          <div>
            <span>Tipo de sistema</span>
            <strong>Sistema experto con reglas if-then</strong>
          </div>
        </div>
      </HealthCard>

      <HealthCard className="success-card">
        <ShieldCheck size={24} />
        <div>
          <h3>Privacidad</h3>
          <p>
            En esta versión los datos se guardan localmente en el navegador. Después podrán
            enviarse a PostgreSQL mediante Flask.
          </p>
        </div>
      </HealthCard>

      <button type="button" className="logout-button">
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  );
};
