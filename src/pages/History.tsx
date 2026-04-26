import { CalendarDays, History as HistoryIcon } from 'lucide-react';
import { getHistory } from '../services/expertApi';

export const History = () => {
  const history = getHistory();

  return (
    <div className="screen">
      <div className="page-title">
        <h1>Historial</h1>
        <p>Registros recientes de evaluaciones cardiovasculares.</p>
      </div>

      {history.length === 0 ? (
        <section className="empty-state">
          <HistoryIcon size={48} />
          <h2>No hay registros</h2>
          <p>Cuando realices una evaluación aparecerá aquí.</p>
        </section>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <article key={`${item.createdAt}-${index}`} className="history-card">
              <div>
                <span className={`risk-badge ${item.riskLevel.toLowerCase()}`}>
                  Riesgo {item.riskLevel}
                </span>
                <h2>{item.score} puntos</h2>
                <p>{item.diagnosis}</p>
              </div>

              <div className="history-date">
                <CalendarDays size={17} />
                {new Date(item.createdAt).toLocaleString('es-MX', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};