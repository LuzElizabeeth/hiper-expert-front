import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  CircleHelp,
  ClipboardPlus,
  Clock3,
  Heart,
  History,
  PillBottle,
  Stethoscope,
} from 'lucide-react';

import { HomeHealthTips } from '../components/HomeHealthTips';
import {
  getActiveAlerts,
  getCurrentUser,
  getDueMedications,
  getLatestVitals,
  getWeeklyTrends,
} from '../api/home.api';
import { formatTimeDisplayEs } from '../utils/timeDisplay';

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

const formatDashboardDate = (d: Date): string =>
  d
    .toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .replace(/^(.)/, (c) => c.toUpperCase());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const safeNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const pressureFillHeight = (vital: any) => {
  if (!vital) return '0%';

  const sys = safeNumber(vital.systolic_bp);
  const dia = safeNumber(vital.diastolic_bp);
  const sysRatio = (sys - 90) / 90;
  const diaRatio = (dia - 60) / 60;
  const ratio = clamp(Math.max(sysRatio, diaRatio), 0, 1);

  return `${Math.round(24 + ratio * 42)}%`;
};

const pressureTone = (vital: any) => {
  if (!vital) return 'empty';

  const label = String(vital.bp_category_label ?? vital.bp_category ?? '').toLowerCase();
  const sys = safeNumber(vital.systolic_bp);
  const dia = safeNumber(vital.diastolic_bp);

  if (label.includes('crítica') || label.includes('critica') || label.includes('alta') || sys >= 140 || dia >= 90) {
    return 'high';
  }

  if (label.includes('elevada') || label.includes('media') || sys >= 130 || dia >= 85) {
    return 'elevated';
  }

  return 'normal';
};

const readableTime = (value?: string) => {
  if (!value) return 'Horario pendiente';

  if (/^\d{2}:\d{2}/.test(value)) {
    return formatTimeDisplayEs(value.slice(0, 5));
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const isMedicationTaken = (item: any) =>
  item?.status === 'completed' ||
  item?.status === 'taken' ||
  item?.is_taken === true ||
  item?.taken === true;

const extractDailyTrend = (trends: any) => {
  const candidates = [
    trends?.daily,
    trends?.days,
    trends?.records,
    trends?.daily_records,
    trends?.weekly_records,
    trends?.data?.daily,
    trends?.data?.records,
  ];

  return candidates.find((item) => Array.isArray(item)) ?? [];
};

const valueFrom = (item: any, keys: string[]) => {
  for (const key of keys) {
    if (item?.[key] != null) return safeNumber(item[key]);
  }

  return 0;
};

const buildWeekTrendData = (trends: any) => {
  const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const daily = extractDailyTrend(trends).slice(-7);

  if (!daily.length) {
    return labels.map((label) => ({
      label,
      systolic: 0,
      diastolic: 0,
      hasData: false,
    }));
  }

  return labels.map((label, index) => {
    const item = daily[index];
    const systolic = valueFrom(item, [
      'average_systolic_bp',
      'avg_systolic_bp',
      'systolic_bp',
      'systolic',
    ]);
    const diastolic = valueFrom(item, [
      'average_diastolic_bp',
      'avg_diastolic_bp',
      'diastolic_bp',
      'diastolic',
    ]);

    return {
      label,
      systolic,
      diastolic,
      hasData: Boolean(systolic || diastolic),
    };
  });
};

const barHeight = (value: number, type: 'systolic' | 'diastolic') => {
  if (!value) return '22px';

  const min = type === 'systolic' ? 90 : 55;
  const max = type === 'systolic' ? 180 : 120;
  const ratio = clamp((value - min) / (max - min), 0, 1);

  return `${Math.round(24 + ratio * 58)}px`;
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

  const displayName = user?.full_name ?? 'Nombre';
  const userPhotoUrl = user?.photo_url ?? user?.profile_photo_url ?? user?.avatar_url ?? '';
  const dashboardDate = formatDashboardDate(now);

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

  const lastRecordLabel = lastRecordDate
    ? `Última medición ${
        isSameDay(lastRecordDate, now)
          ? 'hoy'
          : lastRecordDate.toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
            })
      } ${formattedLastRecord}`
    : 'Registra tu primera medición';

  const pressureCategory = String(latestVital?.bp_category_label ?? '').trim();
  const pressureStatusText = latestVital
    ? pressureCategory.toLowerCase().includes('normal') ||
      pressureCategory.toLowerCase().includes('saludable')
      ? 'Tu presión está en rango saludable'
      : pressureCategory
      ? `Tu presión se clasifica como ${pressureCategory.toLowerCase()}`
      : 'Lectura registrada correctamente'
    : 'Aún no hay datos suficientes para evaluar tu presión.';

  const weekStatusText = !latestVital
    ? 'Registra tu primera medición esta semana'
    : alerts.length > 0
    ? 'Tienes alertas activas por revisar'
    : trends?.dangerous_trends?.length
    ? 'Revisar tendencia semanal'
    : 'Presión controlada esta semana';

  const tone = pressureTone(latestVital);
  const weeklyData = useMemo(() => buildWeekTrendData(trends), [trends]);
  const hasWeeklyTrend = weeklyData.some((day) => day.hasData);

  const visibleMedications = dueMedications.slice(0, 2);
  const dangerousTrend = trends?.dangerous_trends?.[0];
  const mainAlert = alerts[0];
  const aiTitle = dangerousTrend?.title ?? mainAlert?.title ?? 'Análisis de IA';
  const aiMessage =
    dangerousTrend?.message ??
    mainAlert?.message ??
    (latestVital
      ? 'Tus registros recientes no muestran alertas críticas. Mantén tus mediciones y medicamentos al día.'
      : 'Registra tu primera medición para activar recomendaciones personalizadas.');

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
            {userPhotoUrl ? (
              <img src={userPhotoUrl} alt="" />
            ) : (
              profileInitial(displayName)
            )}
          </div>

          <strong className="home-user-name">{displayName}</strong>
        </div>

        <Link
          to="/alertas"
          className="icon-button topbar-action-btn"
          aria-label="Alertas"
        >
          <Bell size={24} strokeWidth={2.2} />
        </Link>
      </header>

      <section className="home-greeting">
        <h1>{greetingForHour(now)}</h1>
        <time dateTime={now.toISOString()}>{dashboardDate}</time>
      </section>

      <div className={`home-week-pill ${!latestVital ? 'home-week-pill--empty' : ''}`}>
        <span className="home-week-dot" aria-hidden />
        <span>{weekStatusText}</span>
      </div>

      <section className="home-pressure-card">
        <p className="home-last-reading">{lastRecordLabel}</p>

        <div className={`pressure-gauge pressure-gauge--${tone}`}>
          <span
            className="pressure-fill"
            style={{ height: pressureFillHeight(latestVital) }}
            aria-hidden="true"
          />

          <div className="pressure-inner">
            <h2>
              {latestVital
                ? `${latestVital.systolic_bp}/${latestVital.diastolic_bp}`
                : '--/--'}
            </h2>
            <span>mmHg</span>
          </div>
        </div>

        <p className={`heart-rate ${!latestVital ? 'heart-rate--empty' : ''}`}>
          <Heart size={20} />
          <strong>{latestVital?.heart_rate_bpm ?? '--'}</strong> lpm
        </p>

        <div className={`home-status-box ${!latestVital ? 'home-status-box--empty' : ''}`}>
          {pressureStatusText}
        </div>
      </section>

      <section className="home-ai-card">
        <div className="home-card-header-icon">
          {mainAlert ? <AlertTriangle size={24} /> : <Stethoscope size={24} />}
        </div>

        <div>
          <h3>{aiTitle}</h3>
          <p>{aiMessage}</p>
        </div>
      </section>

      <section className="home-med-section">
        <h2 className="home-section-title">
          <PillBottle size={20} strokeWidth={2.4} />
          Medicamentos de hoy
        </h2>

        <div className="home-med-card">
          {visibleMedications.length > 0 ? (
            visibleMedications.map((item) => {
              const medication = item.medication ?? item;
              const taken = isMedicationTaken(item);
              const time = readableTime(item.next_due_at ?? medication.first_dose_time);

              return (
                <div
                  key={medication.id ?? medication.name}
                  className={`med-item ${taken ? 'med-item-done' : ''}`}
                >
                  <span className={taken ? 'med-check' : 'med-check med-check-empty'}>
                    {taken ? <Check size={15} /> : <Clock3 size={17} />}
                  </span>

                  <div>
                    <strong>{medication.name ?? 'Medicamento'}</strong>
                    <p>
                      {time} • {medication.dose_mg ?? '--'}mg
                    </p>
                  </div>

                  {taken ? <span className="med-status">Tomado</span> : null}
                </div>
              );
            })
          ) : (
            <p className="home-card-subtitle home-med-empty">
              No hay medicamentos programados para hoy.
            </p>
          )}

          <Link to={visibleMedications.length > 0 ? '/medicacion' : '/medicacion/nueva'} className="primary-button home-mark-button">
            <Check size={18} />
            {visibleMedications.length > 0 ? 'Marcar como tomado' : 'Añadir medicación'}
          </Link>
        </div>
      </section>

      <section className="home-trend-card home-trend-card--simple">
        <h2 className="home-section-title home-section-title--plain">
          Tendencia semanal
        </h2>

        <div className="home-trend-visual-card">
          <div className={`home-chart-simple ${!hasWeeklyTrend ? 'home-chart-simple--empty' : ''}`}>
            {weeklyData.map((day) => (
              <div key={day.label} className={`simple-day ${!day.hasData ? 'simple-day--empty' : ''}`}>
                <div className="simple-bars">
                  <span
                    className="simple-bar simple-bar--diastolic"
                    style={{ height: barHeight(day.diastolic, 'diastolic') }}
                    aria-hidden="true"
                  />
                  <span
                    className="simple-bar simple-bar--systolic"
                    style={{ height: barHeight(day.systolic, 'systolic') }}
                    aria-hidden="true"
                  />
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>

          <div className="home-chart-legend home-chart-legend--simple">
            <span>
              <i className="legend-dot legend-sys" />
              Sistólica
            </span>
            <span>
              <i className="legend-dot legend-dia" />
              Diastólica
            </span>
          </div>
        </div>
      </section>

      <section className="home-actions-grid home-actions-grid--figma">
        <Link to="/evaluacion" className="action-card action-primary">
          <ClipboardPlus size={24} />
          Registrar presión
        </Link>

        <Link to="/globorisk" className="action-card action-soft">
          <Stethoscope size={24} />
          Registrar síntomas
        </Link>

        <Link to="/historial" className="action-card action-soft">
          <History size={24} />
          Ver historial
        </Link>

        <Link to="/contacto-emergencia" className="action-card action-warning">
          <CircleHelp size={24} />
          Contactar cuidador
        </Link>
      </section>

      <HomeHealthTips />
    </div>
  );
};
