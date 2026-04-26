import {
  Activity,
  HeartPulse,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { HealthCard } from '../components/HealthCard';

export const Profile = () => {
  return (
    <div className="screen">
      <div className="profile-card">
        <div className="profile-avatar">
          <UserRound size={56} />
        </div>

        <h1>Ricardo García</h1>
        <p>72 años · Paciente cardiovascular</p>

        <div className="profile-stats">
          <div>
            <span>Presión</span>
            <strong>128/82</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>Controlado</strong>
          </div>
        </div>
      </div>

      <HealthCard>
        <h2>Información médica</h2>

        <div className="info-row">
          <HeartPulse size={19} />
          <div>
            <span>Enfermedad seleccionada</span>
            <strong>Cardiovasculares</strong>
          </div>
        </div>

        <div className="info-row">
          <Stethoscope size={19} />
          <div>
            <span>Objetivo del sistema</span>
            <strong>Detección temprana de síntomas</strong>
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

      <button className="logout-button">
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  );
};