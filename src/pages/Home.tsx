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
  AlertTriangle,
    Activity,
  TrendingUp,
} from 'lucide-react';

import { HomeHealthTips } from '../components/HomeHealthTips';
import {
  getActiveAlerts,
  getCurrentUser,
  getDueMedications,
  getLatestVitals,
  getWeeklyTrends,
} from '../api/home.api';

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


const safeNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const pressureBarHeight = (value: unknown, min = 50, max = 190) => {
  const n = safeNumber(value);
  if (!n) return 20;

  const percent = ((n - min) / (max - min)) * 100;
  return `${Math.min(100, Math.max(18, percent))}%`;
};

const changeLabel = (value: unknown) => {
  const n = safeNumber(value);
  if (n > 0) return `+${n.toFixed(1)}`;
  if (n < 0) return n.toFixed(1);
  return '0.0';
};

const changeClass = (value: unknown) => {
  const n = safeNumber(value);
  if (n > 0) return 'trend-change trend-change--up';
  if (n < 0) return 'trend-change trend-change--down';
  return 'trend-change';
};


export const Home = () => {
  const [now, setNow] = useState(() => new Date());

  const [user, setUser] = useState<any>(null);
  const [latestVital, setLatestVital] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [dueMedications, setDueMedications] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();

    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [userRes, vitalsRes, trendsRes, medsRes, alertsRes] =
          await Promise.all([
            getCurrentUser(),
            getLatestVitals(),
            getWeeklyTrends(),
            getDueMedications(),
            getActiveAlerts(),
          ]);

        setUser(userRes.data);
        setLatestVital(vitalsRes.data?.[0] ?? null);
        setTrends(trendsRes.data ?? null);
        setDueMedications(medsRes.data ?? []);
        setAlerts(alertsRes.data ?? []);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const displayName = user?.full_name ?? 'Paciente';
  const lastRecordDate = latestVital?.recorded_at
    ? new Date(latestVital.recorded_at)
    : null;

  const formattedLastRecord = lastRecordDate
    ? lastRecordDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Sin mediciones';

  const currentSummary = trends?.current_summary;
  const dangerousTrend = trends?.dangerous_trends?.[0];

  const previousSummary = trends?.previous_summary;
const changes = trends?.changes;

const weeklyMetrics = [
  {
    label: 'Sistólica',
    unit: 'mmHg',
    current: currentSummary?.average_systolic_bp,
    previous: previousSummary?.average_systolic_bp,
    change: changes?.average_systolic_bp_change,
  },
  {
    label: 'Diastólica',
    unit: 'mmHg',
    current: currentSummary?.average_diastolic_bp,
    previous: previousSummary?.average_diastolic_bp,
    change: changes?.average_diastolic_bp_change,
  },
  {
    label: 'Pulso',
    unit: 'lpm',
    current: currentSummary?.average_heart_rate_bpm,
    previous: previousSummary?.average_heart_rate_bpm,
    change: changes?.average_heart_rate_bpm_change,
  },
];

const pressureRangeLabel =
  currentSummary?.min_systolic_bp && currentSummary?.max_systolic_bp
    ? `${currentSummary.min_systolic_bp}-${currentSummary.max_systolic_bp} mmHg`
    : '--';

const diastolicRangeLabel =
  currentSummary?.min_diastolic_bp && currentSummary?.max_diastolic_bp
    ? `${currentSummary.min_diastolic_bp}-${currentSummary.max_diastolic_bp} mmHg`
    : '--';

const heartRangeLabel =
  currentSummary?.min_heart_rate_bpm && currentSummary?.max_heart_rate_bpm
    ? `${currentSummary.min_heart_rate_bpm}-${currentSummary.max_heart_rate_bpm} lpm`
    : '--';

const totalRecords = currentSummary?.total_records ?? 0;

  if (loading) {
    return (
      <div className="screen home-dashboard">
        <section className="home-pressure-card">
          <h3>Cargando información...</h3>
          <p className="home-card-subtitle">
            Estamos obteniendo tus datos de salud.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="screen home-dashboard">
      <header className="home-topbar">
        <div className="home-user">
          <div className="home-avatar" aria-hidden>
            {profileInitial(displayName)}
          </div>

          <div className="home-user-text">
            <span>Paciente</span>
            <strong>{displayName}</strong>
          </div>
        </div>

        <div className="home-topbar-actions">
          <Link
            to="/alertas"
            className="icon-button topbar-action-btn"
            aria-label="Alertas"
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

      {alerts.length > 0 ? (
        <section className="home-ai-card">
          <div className="home-card-header-icon">
            <AlertTriangle size={28} strokeWidth={2} />
          </div>

          <div>
            <h3>{alerts[0].title}</h3>
            <p>{alerts[0].message}</p>
          </div>
        </section>
      ) : null}

      <section className="home-pressure-card">
        <div className="home-pressure-card-header">
          <div>
            <h3>
              {latestVital
                ? latestVital.bp_category_label
                : 'Sin mediciones registradas'}
            </h3>
            <p className="home-card-subtitle">
              {latestVital
                ? `Última medición ${formattedLastRecord}`
                : 'Registra tu primera medición'}
            </p>
          </div>
          <Heart size={44} />
        </div>

        <div className="pressure-gauge">
          <div className="pressure-inner">
            <h2>
              {latestVital
                ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp}`
                : '--/--'}
            </h2>
            <span>mmHg</span>
          </div>
        </div>

        <p className="heart-rate">
          <Heart size={16} />
          <strong>{latestVital?.heart_rate_bpm ?? '--'}</strong> lpm
        </p>

        <div className="home-status-box">
          {latestVital
            ? latestVital.initial_assessment
            : 'Aún no hay datos suficientes para una evaluación inicial.'}
        </div>
      </section>

      {dangerousTrend ? (
        <section className="home-ai-card">
          <div className="home-card-header-icon">
            <Stethoscope size={28} strokeWidth={2} />
          </div>

          <div>
            <h3>{dangerousTrend.title}</h3>
            <p>{dangerousTrend.message}</p>
          </div>
        </section>
      ) : null}

      <section className="home-med-card">
        <h3>
          <span className="home-card-header-icon">
            <PillBottle size={28} strokeWidth={2} />
          </span>
          Medicamentos de hoy
        </h3>

        {dueMedications.length > 0 ? (
          dueMedications.slice(0, 2).map((item) => (
            <div
              key={item.medication.id}
              className={`med-item ${
                item.status === 'completed' ? 'med-item-done' : ''
              }`}
            >
              <span
                className={
                  item.status === 'completed'
                    ? 'med-check'
                    : 'med-check med-check-empty'
                }
              >
                {item.status === 'completed' ? <Check size={14} /> : null}
              </span>

              <div>
                <strong>{item.medication.name}</strong>
                <p>
                  {item.medication.first_dose_time} • {item.medication.dose_mg}
                  mg
                </p>
              </div>

              {item.status === 'completed' ? (
                <span className="med-status">Tomado</span>
              ) : null}
            </div>
          ))
        ) : (
          <p className="home-card-subtitle">
            No hay medicamentos pendientes registrados.
          </p>
        )}

        <Link to="/medicacion" className="primary-button home-mark-button">
          <Check size={18} />
          Ver medicamentos
        </Link>
      </section>

    <section className="home-trend-card home-trend-card--enhanced">
  <div className="home-trend-head">
    <div>
      <h3>Tendencia semanal</h3>
      <p className="home-card-subtitle">
        Comparación contra el periodo anterior
      </p>
    </div>

    <span className="home-card-header-icon">
      <TrendingUp size={22} />
    </span>
  </div>

  <div className="weekly-trend-bars">
    {weeklyMetrics.map((metric) => (
      <article key={metric.label} className="weekly-trend-item">
        <div className="weekly-trend-bars-wrap">
          <span
            className="weekly-bar weekly-bar--previous"
            style={{
              height: pressureBarHeight(metric.previous),
            }}
            title="Periodo anterior"
          />

          <span
            className="weekly-bar weekly-bar--current"
            style={{
              height: pressureBarHeight(metric.current),
            }}
            title="Periodo actual"
          />
        </div>

        <div className="weekly-trend-info">
          <strong>{metric.label}</strong>

          <span>
            {metric.current != null
              ? `${Number(metric.current).toFixed(1)} ${metric.unit}`
              : `-- ${metric.unit}`}
          </span>

          <small className={changeClass(metric.change)}>
            {changeLabel(metric.change)} vs anterior
          </small>
        </div>
      </article>
    ))}
  </div>

  <div className="home-chart-legend home-chart-legend--enhanced">
    <span>
      <i className="legend-dot legend-dia" />
      Semana anterior
    </span>

    <span>
      <i className="legend-dot legend-sys" />
      Semana actual
    </span>
  </div>
</section>

<section className="home-insight-card">
  <div className="home-insight-head">
    <span className="home-card-header-icon">
      <Activity size={22} />
    </span>

    <div>
      <h3>Resumen de variación</h3>
      <p>Un vistazo rápido a los cambios recientes</p>
    </div>
  </div>

  <div className="home-insight-grid">
    <div className="insight-stat">
      <span>Registros</span>
      <strong>{totalRecords}</strong>
      <small>esta semana</small>
    </div>

    <div className="insight-stat">
      <span>Rango sistólico</span>
      <strong>{pressureRangeLabel}</strong>
      <small>mínimo - máximo</small>
    </div>

    <div className="insight-stat">
      <span>Rango diastólico</span>
      <strong>{diastolicRangeLabel}</strong>
      <small>mínimo - máximo</small>
    </div>

    <div className="insight-stat">
      <span>Rango pulso</span>
      <strong>{heartRangeLabel}</strong>
      <small>mínimo - máximo</small>
    </div>
  </div>
</section>

      <section className="home-actions-grid">
        <Link to="/evaluacion" className="action-card action-primary">
          <ClipboardPlus size={22} />
          Registrar presión
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

      <section className="home-emergency-card">
        <div>
          <p>Contacto de emergencia</p>
          <h3>No configurado</h3>
          <small>Agrega un contacto desde configuración</small>
        </div>

        <div className="home-emergency-actions">
          <a href="tel:" className="home-call-btn">
            <PhoneCall size={15} />
            Llamar
          </a>

          <Link to="/contacto-emergencia" className="home-edit-contact-link">
            Editar
          </Link>
        </div>
      </section>

      <HomeHealthTips />
    </div>
  );
};