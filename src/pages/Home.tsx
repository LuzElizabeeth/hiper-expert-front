import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  PhoneCall,
  Check,
  CircleHelp,
  ClipboardPlus,
  Heart,
  History,
  PillBottle,
  Settings,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { HomeHealthTips } from '../components/HomeHealthTips';
import { getEmergencyContact, getNotificationSettings, getUserProfile } from '../services/expertApi';

const profileInitial = (name: string) => {
  const t = name.trim();
  if (!t) return 'N';
  return t[0].toUpperCase();
};

const greetingForHour = (d: Date): string => {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

export const Home = () => {
  const [now, setNow] = useState(() => new Date());
  const userProfile = getUserProfile();
  const emergencyContact = getEmergencyContact();
  const settings = getNotificationSettings();

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const cleanedPhone = emergencyContact?.phone.replace(/[^\d+]/g, '') ?? '';

  const relationLabel =
    emergencyContact?.relation === 'hijo'
      ? 'Hijo'
      : emergencyContact?.relation === 'hija'
        ? 'Hija'
        : emergencyContact?.relation === 'cuidador'
          ? 'Cuidador'
          : 'Contacto';

  return (
    <div className="screen home-dashboard">
      <header className="home-topbar">
        <div className="home-user">
          {userProfile.photoDataUrl ? (
            <div className="home-avatar home-avatar--photo">
              <img src={userProfile.photoDataUrl} alt="" />
            </div>
          ) : (
            <div className="home-avatar" aria-hidden>
              {profileInitial(userProfile.displayName)}
            </div>
          )}

          <div className="home-user-text">
            <span>Paciente</span>
            <strong>Inicio</strong>
          </div>
        </div>

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
      </header>

      <section className="home-greeting">
        <time className="home-greeting-datetime" dateTime={now.toISOString()}>
          <span className="home-greeting-date">
            {now
              .toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .replace(/^\w/, (c) => c.toUpperCase())}
          </span>

          <span className="home-greeting-time">
            {now.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </time>

        <div className="home-greeting-message">
          <h1>{greetingForHour(now)}</h1>
          <p>Seguimiento de hipertensión</p>
        </div>
      </section>

      <div className="home-week-pill">
        <ShieldCheck size={22} />
        <span>Este sistema no sustituye una consulta médica profesional.</span>
      </div>

      <section className="home-pressure-card">
        <div className="home-pressure-card-header">
          <div>
            <h3>Presión controlada esta semana</h3>
            <p className="home-card-subtitle">Última medición hoy 08:30 AM</p>
          </div>
          <Heart size={44} />
        </div>

        <div className="pressure-gauge">
          <div className="pressure-inner">
            <h2>128/82</h2>
            <span>mmHg</span>
          </div>
        </div>

        <p className="heart-rate">
          <Heart size={16} />
          <strong>72</strong> lpm
        </p>

        <div className="home-status-box">Tu presión está en rango controlado</div>
      </section>

      {settings.aiTrends ? (
        <section className="home-ai-card">
          <div className="home-card-header-icon">
            <Stethoscope size={28} strokeWidth={2} />
          </div>

          <div>
            <h3>Análisis de hipertensión</h3>
            <p>Posible falta de adherencia nocturna. No registraste tu toma de Amlodipino ayer.</p>
          </div>
        </section>
      ) : null}

      {settings.medicationReminders ? (
        <section className="home-med-card">
          <h3>
            <span className="home-card-header-icon">
              <PillBottle size={28} strokeWidth={2} />
            </span>
            Medicamentos de hoy
          </h3>

          <div className="med-item med-item-done">
            <span className="med-check">
              <Check size={14} />
            </span>

            <div>
              <strong>Losartan</strong>
              <p>8:00 AM • 50mg</p>
            </div>

            <span className="med-status">Tomado</span>
          </div>

          <div className="med-item">
            <span className="med-check med-check-empty" />

            <div>
              <strong>Amlodipino</strong>
              <p>8:00 PM • 5mg</p>
            </div>
          </div>

          <button className="primary-button home-mark-button" type="button">
            <Check size={18} />
            Marcar como tomado
          </button>
        </section>
      ) : null}

      <section className="home-trend-card">
        <h3>Tendencia semanal</h3>

        <div className="home-chart">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={`${day}-${index}`} className="bar-day">
              <span className="bar-top" />
              <span className="bar-bottom" />
              <small>{day}</small>
            </div>
          ))}
        </div>

        <div className="home-chart-legend">
          <span>
            <i className="legend-dot legend-sys" />
            Sistólica
          </span>

          <span>
            <i className="legend-dot legend-dia" />
            Diastólica
          </span>
        </div>
      </section>

      <section className="home-actions-grid">
        <Link to="/evaluacion" className="action-card action-primary">
          <ClipboardPlus size={22} />
          {settings.dailyMeasurement ? 'Registrar presión' : 'Nueva medición'}
        </Link>

        <Link to="/medicacion" className="action-card">
          <Stethoscope size={22} />
          Añadir medicación
        </Link>

        <Link to="/historial" className="action-card">
          <History size={22} />
          Ver historial
        </Link>

        <Link to="/contacto-emergencia" className="action-card action-warning">
          <CircleHelp size={22} />
          Contactar cuidador
        </Link>
      </section>

      {!settings.criticalAlerts && !settings.aiTrends && !settings.medicationReminders ? (
        <section className="home-muted-info">
          Varias alertas están desactivadas. Puedes reactivarlas desde la sección de configuración.
        </section>
      ) : null}

      {emergencyContact ? (
        <section className="home-emergency-card">
          <div>
            <p>Contacto de emergencia</p>
            <h3>{emergencyContact.fullName}</h3>
            <small>{relationLabel}</small>
          </div>

          <div className="home-emergency-actions">
            <a href={`tel:${cleanedPhone}`} className="home-call-btn">
              <PhoneCall size={15} />
              Llamar
            </a>

            <Link to="/contacto-emergencia" className="home-edit-contact-link">
              Editar
            </Link>
          </div>
        </section>
      ) : null}

      {settings.healthTips ? <HomeHealthTips /> : null}
    </div>
  );
};