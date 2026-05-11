import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChartNoAxesCombined, ChevronRight, Filter, Heart } from 'lucide-react';
import { getCurrentUser } from '../api/home.api';
import { getVitals, type VitalRecord } from '../api/vitals.api';

type MeasurementRange = 'semana' | 'mes' | 'anio';
type ChartPoint = { sys: number; dia: number; t: number };
type BpStatusVariant = 'normal' | 'attention' | 'high';

const RANGE_LABELS: Record<MeasurementRange, string> = { semana: 'SEMANAL', mes: 'MENSUAL', anio: 'ANUAL' };

const profileInitial = (name: string) => {
  const value = name.trim();
  return value ? value[0].toUpperCase() : 'N';
};

const recordDate = (item: VitalRecord) => item.recorded_at || item.created_at;

const formatHour = (date: string) =>
  new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const formatGroupHeading = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const cleanDate = new Date(date);
  cleanDate.setHours(0, 0, 0, 0);

  const rest = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }).toUpperCase();

  if (cleanDate.getTime() === today.getTime()) return `HOY, ${rest}`;
  if (cleanDate.getTime() === yesterday.getTime()) return `AYER, ${rest}`;

  return `${date.toLocaleDateString('es-MX', { weekday: 'long' }).toUpperCase()}, ${rest}`;
};

const avgReadings = (readings: VitalRecord[]) => {
  if (!readings.length) return { sys: 0, dia: 0 };

  const totals = readings.reduce(
    (acc, item) => ({ sys: acc.sys + item.systolic_bp, dia: acc.dia + item.diastolic_bp }),
    { sys: 0, dia: 0 }
  );

  return { sys: Math.round(totals.sys / readings.length), dia: Math.round(totals.dia / readings.length) };
};

const bpStatus = (sys: number, dia: number): { label: string; variant: BpStatusVariant } => {
  if (sys >= 180 || dia >= 110) return { label: 'CRÍTICO', variant: 'high' };
  if (sys >= 140 || dia >= 90) return { label: 'ALTO', variant: 'high' };
  if (sys >= 130 || dia >= 85) return { label: 'ATENCIÓN', variant: 'attention' };
  return { label: 'NORMAL', variant: 'normal' };
};

const rowBarClass = (sys: number, dia: number) => {
  const status = bpStatus(sys, dia);
  if (status.variant === 'high') return 'measurement-bar--high';
  if (status.variant === 'attention') return 'measurement-bar--mid';
  return 'measurement-bar--ok';
};

const rangeDays = (range: MeasurementRange) => {
  if (range === 'semana') return 7;
  if (range === 'mes') return 30;
  return 365;
};

const buildChartSeries = (readings: VitalRecord[], range: MeasurementRange): ChartPoint[] => {
  const sorted = [...readings].sort(
    (a, b) => new Date(recordDate(a)).getTime() - new Date(recordDate(b)).getTime()
  );

  if (!sorted.length) return [];

  if (range === 'semana') {
    return sorted.map((item) => ({
      sys: item.systolic_bp,
      dia: item.diastolic_bp,
      t: new Date(recordDate(item)).getTime(),
    }));
  }

  if (range === 'mes') {
    const byDay = new Map<number, VitalRecord[]>();

    sorted.forEach((item) => {
      const day = new Date(recordDate(item));
      day.setHours(0, 0, 0, 0);
      const key = day.getTime();
      byDay.set(key, [...(byDay.get(key) ?? []), item]);
    });

    return [...byDay.entries()].sort(([a], [b]) => a - b).map(([t, items]) => {
      const avg = avgReadings(items);
      return { sys: avg.sys, dia: avg.dia, t };
    });
  }

  const byMonth = new Map<string, VitalRecord[]>();

  sorted.forEach((item) => {
    const day = new Date(recordDate(item));
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(key, [...(byMonth.get(key) ?? []), item]);
  });

  return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => {
    const [year, month] = key.split('-').map(Number);
    const avg = avgReadings(items);
    return { sys: avg.sys, dia: avg.dia, t: new Date(year, month - 1, 1).getTime() };
  });
};

const createSmoothPath = (points: Array<{ x: number; y: number }>) => {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

    const previous = points[index - 1];
    const middleX = (previous.x + point.x) / 2;

    return `${path} C ${middleX.toFixed(1)} ${previous.y.toFixed(1)}, ${middleX.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, '');
};

export const History = () => {
  const [range, setRange] = useState<MeasurementRange>('semana');
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError('');

        const [userRes, vitalsRes] = await Promise.all([getCurrentUser(), getVitals(100)]);

        setUser(userRes.data);
        setHistory(vitalsRes.data ?? []);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'No se pudo cargar el historial.');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const displayName = user?.full_name ?? user?.name ?? 'Nombre';
  const avatarUrl = user?.photo_url ?? user?.avatar_url ?? user?.profile_photo_url ?? '';

  const filtered = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - rangeDays(range));
    start.setHours(0, 0, 0, 0);

    return history.filter((item) => new Date(recordDate(item)) >= start);
  }, [history, range]);

  const average = useMemo(() => avgReadings(filtered), [filtered]);
  const averageStatus = useMemo(() => bpStatus(average.sys, average.dia), [average.sys, average.dia]);
  const chartSeries = useMemo(() => buildChartSeries(filtered, range), [filtered, range]);

  const chartSvg = useMemo(() => {
    if (!chartSeries.length) return null;

    const width = 330;
    const height = 170;
    const pad = { top: 22, right: 8, bottom: 22, left: 8 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    const values = chartSeries.flatMap((point) => [point.sys, point.dia]);
    let minBp = Math.min(...values) - 10;
    let maxBp = Math.max(...values) + 10;

    if (maxBp - minBp < 24) {
      const middle = (maxBp + minBp) / 2;
      minBp = middle - 14;
      maxBp = middle + 14;
    }

    const toX = (index: number) =>
      pad.left + innerW * (chartSeries.length === 1 ? 0.5 : index / (chartSeries.length - 1));
    const toY = (value: number) => pad.top + innerH * (1 - (value - minBp) / (maxBp - minBp));

    const systolicPoints = chartSeries.map((point, index) => ({ x: toX(index), y: toY(point.sys) }));
    const diastolicPoints = chartSeries.map((point, index) => ({ x: toX(index), y: toY(point.dia) }));
    const systolicPath = createSmoothPath(systolicPoints);
    const diastolicPath = createSmoothPath(diastolicPoints);

    const areaPath =
      chartSeries.length === 1
        ? `M ${systolicPoints[0].x - 20} ${systolicPoints[0].y} L ${systolicPoints[0].x + 20} ${systolicPoints[0].y} L ${diastolicPoints[0].x + 20} ${diastolicPoints[0].y} L ${diastolicPoints[0].x - 20} ${diastolicPoints[0].y} Z`
        : `${systolicPath} L ${[...diastolicPoints]
            .reverse()
            .map((point) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
            .join(' L ')} Z`;

    return { width, height, areaPath, systolicPath, diastolicPath, systolicPoints, diastolicPoints };
  }, [chartSeries]);

  const groupedByDate = useMemo(() => {
    const groups = filtered.reduce<Record<string, VitalRecord[]>>((acc, entry) => {
      const date = new Date(recordDate(entry));
      date.setHours(0, 0, 0, 0);
      const key = date.getTime().toString();
      acc[key] = [...(acc[key] ?? []), entry];
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([timeKey, records]) => ({
        timeKey,
        heading: formatGroupHeading(new Date(Number(timeKey))),
        records: [...records].sort(
          (a, b) => new Date(recordDate(b)).getTime() - new Date(recordDate(a)).getTime()
        ),
      }));
  }, [filtered]);

  return (
    <div className="screen measures-history-screen history-screen-v3">
      <header className="history-topbar">
        <div className="history-user">
          <div className="home-avatar history-avatar" aria-hidden>
            {avatarUrl ? <img src={avatarUrl} alt="" /> : profileInitial(displayName)}
          </div>
          <strong>{displayName.trim() || 'Nombre'}</strong>
        </div>

        <Link to="/alertas" className="history-bell-btn" aria-label="Alertas">
          <Bell size={25} strokeWidth={2} />
        </Link>
      </header>

      <main className="history-content">
        <h1 className="history-title-main">Historial</h1>

        <section className="history-period-tabs" aria-label="Rango del historial">
          {(['semana', 'mes', 'anio'] as MeasurementRange[]).map((option) => (
            <button
              key={option}
              type="button"
              className={range === option ? 'active' : ''}
              onClick={() => setRange(option)}
            >
              {option === 'anio' ? 'Año' : option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </section>

        {error ? <section className="history-message-card history-message-card--error">{error}</section> : null}

        {loading ? (
          <section className="history-message-card">
            <ChartNoAxesCombined size={42} />
            <h2>Cargando historial...</h2>
            <p>Estamos obteniendo tus registros de presión.</p>
          </section>
        ) : (
          <>
            <section className="history-summary-figma-card">
              <div className="history-summary-top">
                <div>
                  <span>PROMEDIO {RANGE_LABELS[range]}</span>
                  <p>{filtered.length ? `${average.sys}/${average.dia}` : '--/--'} <small>mmHg</small></p>
                </div>

                {filtered.length ? (
                  <span className={`history-status-badge history-status-badge--${averageStatus.variant}`}>
                    <i className="history-status-dot" aria-hidden />
                    {averageStatus.label}
                  </span>
                ) : (
                  <span className="history-status-badge history-status-badge--empty">
                    <i className="history-status-dot" aria-hidden />
                    SIN DATOS
                  </span>
                )}
              </div>

              <div className="history-chart-figma">
                {chartSvg ? (
                  <svg
                    viewBox={`0 0 ${chartSvg.width} ${chartSvg.height}`}
                    role="img"
                    aria-label={`Tendencia de presión ${range}`}
                    className="history-chart-svg"
                  >
                    <defs>
                      <linearGradient id="historyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(185, 234, 210, 0.66)" />
                        <stop offset="100%" stopColor="rgba(185, 234, 210, 0.18)" />
                      </linearGradient>
                    </defs>

                    <path d={chartSvg.areaPath} className="history-area-fill" fill="url(#historyAreaGradient)" />
                    <path d={chartSvg.systolicPath} className="history-line history-line--sys" />
                    <path d={chartSvg.diastolicPath} className="history-line history-line--dia" />

                    {chartSvg.systolicPoints.map((point, index) => (
                      <circle key={`sys-${index}`} cx={point.x} cy={point.y} r="4.5" className="history-point history-point--sys" />
                    ))}

                    {chartSvg.diastolicPoints.map((point, index) => (
                      <circle key={`dia-${index}`} cx={point.x} cy={point.y} r="4" className="history-point history-point--dia" />
                    ))}
                  </svg>
                ) : (
                  <div className="history-chart-empty">
                    <ChartNoAxesCombined size={34} />
                    <span>Registra mediciones para crear tu tendencia.</span>
                  </div>
                )}
              </div>
            </section>

            <div className="history-register-header history-register-header--figma">
              <h2>Registros Recientes</h2>
              <button type="button" className="history-filter-btn">
                <Filter size={15} />
                FILTRAR
              </button>
            </div>

            {groupedByDate.length ? (
              <section className="measurements-list measurements-list--figma">
                {groupedByDate.map((group) => (
                  <div key={group.timeKey} className="history-date-group">
                    <h3 className="history-date-heading">{group.heading}</h3>

                    {group.records.map((item) => (
                      <Link key={item.id} to={`/resultado?id=${item.id}`} className="measurement-item measurement-item--figma">
                        <div className="measurement-item-left">
                          <span className={`measurement-bar ${rowBarClass(item.systolic_bp, item.diastolic_bp)}`} />

                          <div>
                            <strong>{item.systolic_bp}/{item.diastolic_bp} <small>mmHg</small></strong>
                            <span>{formatHour(recordDate(item))}</span>
                          </div>
                        </div>

                        <div className="measurement-item-mid">
                          <Heart size={18} className="measurement-pulse-icon" fill="currentColor" />
                          <strong>{item.heart_rate_bpm}</strong>
                          <small>LPM</small>
                        </div>

                        <ChevronRight className="measurement-chevron" size={22} aria-hidden />
                      </Link>
                    ))}
                  </div>
                ))}
              </section>
            ) : (
              <section className="history-empty-records">
                <h2>No hay registros en este periodo</h2>
                <p>Guarda una medición para verla aquí.</p>
                <Link to="/evaluacion" className="primary-button">Registrar presión</Link>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};
