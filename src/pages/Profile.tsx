import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import {
  getCurrentUser,
  getLatestVital,
  getRiskProfile,
} from '../api/profile.api';

const sexLabels = {
  male: 'Hombre',
  female: 'Mujer',
};

export const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [latestVital, setLatestVital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        const [userRes, riskRes, vitalRes] = await Promise.all([
          getCurrentUser(),
          getRiskProfile(),
          getLatestVital(),
        ]);

        setUser(userRes.data);
        setRiskProfile(riskRes.data);
        setLatestVital(vitalRes.data?.[0] ?? null);
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const displayName = user?.full_name?.trim() || 'Nombre';

  const subtitleParts: string[] = [];

  if (riskProfile?.age != null) {
    subtitleParts.push(`${riskProfile.age} años`);
  }

  if (riskProfile?.sex) {
    subtitleParts.push(
      sexLabels[riskProfile.sex as keyof typeof sexLabels] ?? riskProfile.sex
    );
  }

  if (riskProfile?.has_diabetes) {
    subtitleParts.push('Diabetes');
  }

  if (riskProfile?.is_smoker) {
    subtitleParts.push('Fumador');
  }

  if (subtitleParts.length === 0) {
    subtitleParts.push('Paciente cardiovascular');
  }

  const ageLine = subtitleParts.join(' · ');

  const pressureLabel = latestVital
    ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp}`
    : 'Sin registro';

  const statusLabel = latestVital
    ? latestVital.bp_category_label
    : 'Registre en Inicio';

  if (loading) {
    return (
      <div className="screen profile-screen">
        <HealthCard>
          <h2>Cargando perfil...</h2>
          <p>Estamos obteniendo tu información.</p>
        </HealthCard>
      </div>
    );
  }

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

          <Link
            to="/configuracion"
            className="icon-button topbar-action-btn"
            aria-label="Configuración"
          >
            <Settings size={26} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <UserRound size={56} />
        </div>

        <h1>{displayName}</h1>
        <p>{ageLine}</p>

        <Link
          to="/globorisk"
          className="primary-button profile-edit-cta"
        >
          Completar formulario GLOBORISK
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

      <HealthCard>
        <h2>Riesgo cardiovascular</h2>

        {riskProfile ? (
          <>
            <div className="info-row">
              <ShieldCheck size={19} />
              <div>
                <span>Resultado GLOBORISK</span>
                <strong>
                  {riskProfile.is_applicable
                    ? `${riskProfile.risk_display} · ${riskProfile.risk_category_label}`
                    : 'No aplicable'}
                </strong>
              </div>
            </div>

            <p>{riskProfile.calculation_message}</p>
          </>
        ) : (
          <p>
            Aún no has completado tu perfil de riesgo cardiovascular.
          </p>
        )}
      </HealthCard>

      <HealthCard className="success-card">
        <ShieldCheck size={24} />

        <div>
          <h3>Privacidad</h3>
          <p>
            Tus datos se guardan en tu cuenta y se consultan mediante el backend
            protegido con sesión.
          </p>
        </div>
      </HealthCard>

      <button type="button" className="logout-button" onClick={handleLogout}>
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  );
};