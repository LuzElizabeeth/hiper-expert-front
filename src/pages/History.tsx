import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  ChartNoAxesCombined,
  ChevronRight,
  Filter,
  Heart,
  Settings,
} from 'lucide-react';
import { getPressureHistory, getUserProfile } from '../services/expertApi';
import type { MeasurementRange, PressureMeasurement } from '../types/expert.types';

const profileInitial = (name: string) => {
  const t = name.trim();
  if (!t) return 'N';
  return t[0].toUpperCase();
};

type ChartPoint = { sys: number; dia: number; t: number };

function avgReadings(readings: PressureMeasurement[]): { sys: number; dia: number } {
  if (readings.length === 0) return { sys: 0, dia: 0 };
  const s = readings.reduce((a, r) => a + r.systolic, 0);
  const d = readings.reduce((a, r) => a + r.diastolic, 0);
  return {
    sys: Math.round(s / readings.length),
    dia: Math.round(d / readings.length),
  };
}

/** Puntos para el gráfico según rango: semana = cada medición; mes = promedio por día; año = promedio por mes */
function buildChartSeries(readings: PressureMeasurement[], range: MeasurementRange): ChartPoint[] {
  const sorted = [...readings].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  if (sorted.length === 0) return [];

  if (range === 'semana') {
    return sorted.map((r) => ({
      sys: r.systolic,
      dia: r.diastolic,
      t: new Date(r.createdAt).getTime(),
    }));
  }

  if (range === 'mes') {
    const byDay = new Map<number, PressureMeasurement[]>();
    for (const r of sorted) {
      const d = new Date(r.createdAt);
      d.setHours(0, 0, 0, 0);
      const k = d.getTime();
      const arr = byDay.get(k) ?? [];
      arr.push(r);
      byDay.set(k, arr);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a - b)
      .map(([t, arr]) => {
        const { sys, dia } = avgReadings(arr);
        return { sys, dia, t };
      });
  }

  const byMonth = new Map<string, PressureMeasurement[]>();
  for (const r of sorted) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const arr = byMonth.get(key) ?? [];
    arr.push(r);
    byMonth.set(key, arr);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, arr]) => {
      const [y, m] = key.split('-').map(Number);
      const { sys, dia } = avgReadings(arr);
      return { sys, dia, t: new Date(y, m - 1, 1).getTime() };
    });
}

function averageLabel(range: MeasurementRange): string {
  if (range === 'semana') return 'SEMANAL';
  if (range === 'mes') return 'MENSUAL';
  return 'ANUAL';
}

function bpStatus(sys: number, dia: number): { label: string; variant: 'normal' | 'attention' | 'high' } {
  if (sys >= 180 || dia >= 120) return { label: 'CRÍTICO', variant: 'high' };
  if (sys >= 140 || dia >= 90) return { label: 'ALTO', variant: 'high' };
  if (sys >= 130 || dia >= 80) return { label: 'ATENCIÓN', variant: 'attention' };
  return { label: 'NORMAL', variant: 'normal' };
}

function rowBarClass(sys: number, dia: number): string {
  const st = bpStatus(sys, dia);
  if (st.variant === 'high') return 'measurement-bar--high';
  if (st.variant === 'attention') return 'measurement-bar--mid';
  return 'measurement-bar--ok';
}

function formatGroupHeading(date: Date): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const y = new Date(start);
  y.setDate(y.getDate() - 1);
  const d0 = new Date(date);
  d0.setHours(0, 0, 0, 0);

  const rest = date
    .toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    .toUpperCase();

  if (d0.getTime() === start.getTime()) return `HOY, ${rest}`;
  if (d0.getTime() === y.getTime()) return `AYER, ${rest}`;
  return `${date.toLocaleDateString('es-MX', { weekday: 'long' }).toUpperCase()}, ${rest}`;
}

export const History = () => {
  const location = useLocation();
  const [range, setRange] = useState<MeasurementRange>('semana');
  const userProfile = getUserProfile();

  const history = useMemo(() => getPressureHistory(), [location.pathname]);

  const filtered = useMemo(() => {
    const now = new Date();
    const days = range === 'semana' ? 7 : range === 'mes' ? 30 : 365;
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    return history.filter((item) => new Date(item.createdAt) >= start);
  }, [history, range]);

  const average = useMemo(() => {
    if (filtered.length === 0) return { systolic: 0, diastolic: 0 };
    const totals = filtered.reduce(
      (acc, item) => {
        acc.systolic += item.systolic;
        acc.diastolic += item.diastolic;
        return acc;
      },
      { systolic: 0, diastolic: 0 }
    );
    return {
      systolic: Math.round(totals.systolic / filtered.length),
      diastolic: Math.round(totals.diastolic / filtered.length),
    };
  }, [filtered]);

  const avgStatus = useMemo(
    () => bpStatus(average.systolic, average.diastolic),
    [average.systolic, average.diastolic]
  );

  const chartSeries = useMemo(() => buildChartSeries(filtered, range), [filtered, range]);

  const chartSvg = useMemo(() => {
    if (chartSeries.length === 0) return null;

    const W = 320;
    const H = 168;
    const pad = { t: 16, r: 14, b: 28, l: 14 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;

    const allVals = chartSeries.flatMap((p) => [p.sys, p.dia]);
    let minBp = Math.min(...allVals) - 8;
    let maxBp = Math.max(...allVals) + 8;
    if (maxBp - minBp < 20) {
      const mid = (maxBp + minBp) / 2;
      minBp = mid - 12;
      maxBp = mid + 12;
    }

    const n = chartSeries.length;
    const toX = (i: number) => pad.l + innerW * (n === 1 ? 0.5 : i / (n - 1));
    const toY = (v: number) => pad.t + innerH * (1 - (v - minBp) / (maxBp - minBp));

    const sysPts = chartSeries.map((p, i) => ({ x: toX(i), y: toY(p.sys), ...p }));
    const diaPts = chartSeries.map((p, i) => ({ x: toX(i), y: toY(p.dia) }));

    const lineSys = sysPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const lineDia = diaPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    let areaD: string;
    if (n === 1) {
      const x = sysPts[0].x;
      const w = 8;
      areaD = `M ${(x - w).toFixed(1)} ${sysPts[0].y.toFixed(1)} L ${(x + w).toFixed(1)} ${sysPts[0].y.toFixed(1)} L ${(x + w).toFixed(1)} ${diaPts[0].y.toFixed(1)} L ${(x - w).toFixed(1)} ${diaPts[0].y.toFixed(1)} Z`;
    } else {
      areaD =
        `M ${sysPts[0].x.toFixed(1)} ${sysPts[0].y.toFixed(1)}` +
        sysPts
          .slice(1)
          .map((p) => ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join('') +
        diaPts
          .slice()
          .reverse()
          .map((p) => ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join('') +
        ' Z';
    }

    return {
      W,
      H,
      areaD,
      lineSys,
      lineDia,
      sysPts,
      diaPts,
      minBp,
      maxBp,
      pad,
      innerH,
      toY,
    };
  }, [chartSeries]);

  const groupedByDate = useMemo(() => {
    const groups = filtered.reduce<Record<string, PressureMeasurement[]>>((acc, entry) => {
      const d = new Date(entry.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = d.getTime().toString();
      acc[key] = acc[key] ? [...acc[key], entry] : [entry];
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([timeKey, records]) => ({
        timeKey,
        heading: formatGroupHeading(new Date(Number(timeKey))),
        records: [...records].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }));
  }, [filtered]);

  return (
    <div className="screen measures-history-screen history-screen-v2">
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
          <strong>{userProfile.displayName.trim() || 'Nombre'}</strong>
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

      <div className="page-title">
        <h1>Historial</h1>
        <p className="history-subtitle">
          Datos de <Link to="/evaluacion">registrar presión</Link>. Cambie semana, mes o año para ver el
          gráfico y el promedio.
        </p>
      </div>

      <section className="history-range-tabs">
        <button
          type="button"
          className={range === 'semana' ? 'active' : ''}
          onClick={() => setRange('semana')}
        >
          Semana
        </button>
        <button type="button" className={range === 'mes' ? 'active' : ''} onClick={() => setRange('mes')}>
          Mes
        </button>
        <button type="button" className={range === 'anio' ? 'active' : ''} onClick={() => setRange('anio')}>
          Año
        </button>
      </section>

      {filtered.length === 0 ? (
        <section className="empty-state">
          <ChartNoAxesCombined size={48} />
          <h2>No hay registros en este periodo</h2>
          <p>
            Registre su presión cada día desde{' '}
            <Link to="/evaluacion">Añadir medición</Link> o la pestaña Presión.
          </p>
        </section>
      ) : (
        <>
          <section className="pressure-average-card history-summary-card">
            <div className="average-header">
              <span>PROMEDIO {averageLabel(range)}</span>
              <span className={`history-status-badge history-status-badge--${avgStatus.variant}`}>
                <i className="history-status-dot" aria-hidden />
                {avgStatus.label}
              </span>
            </div>
            <p className="history-average-reading">
              {average.systolic}/{average.diastolic} mmHg
            </p>

            {chartSvg ? (
              <div className="history-chart history-chart-area">
                <svg
                  viewBox={`0 0 ${chartSvg.W} ${chartSvg.H}`}
                  role="img"
                  aria-label={`Tendencia de presión ${range}`}
                  className="history-chart-svg"
                >
                  <defs>
                    <linearGradient id="historyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(46, 125, 93, 0.35)" />
                      <stop offset="100%" stopColor="rgba(156, 210, 238, 0.12)" />
                    </linearGradient>
                  </defs>
                  <path d={chartSvg.areaD} fill="url(#historyAreaGrad)" className="history-area-fill" />
                  <polyline
                    points={chartSvg.lineSys}
                    fill="none"
                    className="history-line history-line--sys"
                  />
                  <polyline
                    points={chartSvg.lineDia}
                    fill="none"
                    className="history-line history-line--dia"
                  />
                  {chartSvg.sysPts.map((p, i) => (
                    <circle
                      key={`sys-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={4}
                      className="history-point history-point--sys"
                    />
                  ))}
                  {chartSvg.diaPts.map((p, i) => (
                    <circle
                      key={`dia-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={3.5}
                      className="history-point history-point--dia"
                    />
                  ))}
                </svg>
                <div className="history-chart-legend-inline">
                  <span>
                    <i className="legend-dot legend-sys" />
                    Sistólica
                  </span>
                  <span>
                    <i className="legend-dot legend-dia-soft" />
                    Diastólica
                  </span>
                </div>
              </div>
            ) : null}
          </section>

          <div className="history-register-header">
            <h3>Registros recientes</h3>
            <button type="button" className="history-filter-btn">
              <Filter size={14} />
              FILTRAR
            </button>
          </div>

          <section className="measurements-list">
            {groupedByDate.map((group) => (
              <div key={group.timeKey}>
                <h4 className="history-date-heading">{group.heading}</h4>
                {group.records.map((item, index) => (
                  <Link
                    key={`${item.createdAt}-${index}`}
                    to="/evaluacion"
                    className="measurement-item measurement-item--link"
                  >
                    <div className="measurement-item-left">
                      <span className={`measurement-bar ${rowBarClass(item.systolic, item.diastolic)}`} />
                      <div>
                        <strong>
                          {item.systolic}/{item.diastolic} mmHg
                        </strong>
                        <small>
                          {new Date(item.createdAt).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>
                    </div>
                    <div className="measurement-item-mid">
                      <Heart size={14} className="measurement-pulse-icon" />
                      <strong>{item.pulse}</strong>
                      <small>LPM</small>
                    </div>
                    <ChevronRight className="measurement-chevron" size={20} aria-hidden />
                  </Link>
                ))}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};
