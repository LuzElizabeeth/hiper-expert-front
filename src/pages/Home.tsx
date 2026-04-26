import { Link } from 'react-router-dom';
import {
  Bell,
  PhoneCall,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardPlus,
  Heart,
  History,
  PillBottle,
  Stethoscope,
} from 'lucide-react';
import { getEmergencyContact, getNotificationSettings } from '../services/expertApi';

export const Home = () => {
  const emergencyContact = getEmergencyContact();
  const settings = getNotificationSettings();
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
          <div className="home-avatar">N</div>
          <strong>Nombre</strong>
        </div>
        <button className="icon-button" type="button" aria-label="Notificaciones">
          <Bell size={18} />
        </button>
      </header>

      <section className="home-greeting">
        <h1>Buenos días</h1>
        <p>Seguimiento de hipertensión</p>
      </section>

      <div className="home-week-pill">
        <span className="home-dot" />
        <span>Presión controlada esta semana</span>
      </div>

      <section className="home-pressure-card">
        <p className="home-card-subtitle">Última medición hoy 08:30 AM</p>
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
          <div className="home-ai-icon">
            <Stethoscope size={16} />
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
            <PillBottle size={18} />
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
            Sistolica
          </span>
          <span>
            <i className="legend-dot legend-dia" />
            DIASTÓLICA
          </span>
        </div>
      </section>

      <section className="home-actions-grid">
        <Link to="/evaluacion" className="action-card action-primary">
          <ClipboardPlus size={22} />
          {settings.dailyMeasurement ? 'Registrar presiónpresión' : 'Nueva medición'}
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

      {settings.healthTips ? (
        <section className="home-tip-card">
          <CalendarDays size={18} />
          <p>Reducir el sodio ayuda a controlar tu presión arterial de forma natural.</p>
        </section>
      ) : null}
    </div>
  );
};