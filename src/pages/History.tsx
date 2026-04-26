import { useMemo, useState } from 'react';
import { Bell, ChartNoAxesCombined, Filter, Heart, UserRound } from 'lucide-react';
import { getPressureHistory } from '../services/expertApi';
import type { MeasurementRange } from '../types/expert.types';

export const History = () => {
  const [range, setRange] = useState<MeasurementRange>('semana');
  const history = getPressureHistory();

  const filtered = useMemo(() => {
    const now = new Date();
    const days = range === 'semana' ? 7 : range === 'mes' ? 30 : 365;
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    return history.filter((item) => new Date(item.createdAt) >= start);
  }, [history, range]);

  const average = useMemo(() => {
    if (filtered.length === 0) {
      return { systolic: 0, diastolic: 0 };
    }

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

  const chartPoints = useMemo(() => {
    const source = filtered.slice(0, 7).reverse();

    if (source.length === 0) {
      return {
        systolic: '0,70 280,70',
        diastolic: '0,85 280,85',
      };
    }

    const build = (key: 'systolic' | 'diastolic', baseY: number, scale: number) =>
      source
        .map((item, index) => {
          const x = (index / Math.max(source.length - 1, 1)) * 280;
          const y = baseY - (item[key] - 60) * scale;
          return `${x},${Math.max(18, Math.min(95, y)).toFixed(2)}`;
        })
        .join(' ');

    return {
      systolic: build('systolic', 90, 0.7),
      diastolic: build('diastolic', 92, 1.2),
    };
  }, [filtered]);

  const groupedByDate = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
      const key = date.toUpperCase();
      acc[key] = acc[key] ? [...acc[key], entry] : [entry];
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="screen measures-history-screen">
      <header className="home-topbar">
        <div className="home-user">
          <div className="home-avatar">
            <UserRound size={18} />
          </div>
          <strong>Nombre</strong>
        </div>
        <button className="icon-button" type="button" aria-label="Notificaciones">
          <Bell size={18} />
        </button>
      </header>

      <div className="page-title">
        <h1>Historial</h1>
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
          Ano
        </button>
      </section>

      {filtered.length === 0 ? (
        <section className="empty-state">
          <ChartNoAxesCombined size={48} />
          <h2>No hay registros</h2>
          <p>Cuando guardes una medicion aparecera aqui.</p>
        </section>
      ) : (
        <>
          <section className="pressure-average-card">
            <div className="average-header">
              <span>PROMEDIO {range.toUpperCase()}</span>
              <span className="normal-badge">NORMAL</span>
            </div>
            <p>
              {average.systolic}/{average.diastolic} mmHg
            </p>

            <div className="history-chart">
              <svg viewBox="0 0 280 100" role="img" aria-label="Tendencia de presion">
                <polyline points={chartPoints.systolic} className="line-systolic" />
                <polyline points={chartPoints.diastolic} className="line-diastolic" />
              </svg>
            </div>
          </section>

          <div className="history-register-header">
            <h3>Registros Recientes</h3>
            <button type="button">
              <Filter size={14} />
              FILTRAR
            </button>
          </div>

          <section className="measurements-list">
            {Object.entries(groupedByDate).map(([dateLabel, records]) => (
              <div key={dateLabel}>
                <h4>{dateLabel}</h4>

                {records.map((item, index) => (
                  <article key={`${item.createdAt}-${index}`} className="measurement-item">
                    <div className="measurement-item-left">
                      <span className="measurement-bar" />
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

                    <div className="measurement-item-right">
                      <Heart size={14} />
                      <strong>{item.pulse}</strong>
                      <small>LPM</small>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};