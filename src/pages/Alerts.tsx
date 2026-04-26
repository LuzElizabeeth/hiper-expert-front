import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, PillBottle, ShieldAlert } from 'lucide-react';
import { getMedications, getPressureHistory } from '../services/expertApi';
import { formatTimeDisplayEs, medicationReminderHHmmSlots } from '../utils/timeDisplay';

export const Alerts = () => {
  const location = useLocation();
  const medications = useMemo(() => getMedications(), [location.pathname]);
  const lastPressure = useMemo(() => getPressureHistory()[0] ?? null, [location.pathname]);

  const pressureAlert =
    lastPressure && (lastPressure.systolic >= 140 || lastPressure.diastolic >= 90)
      ? {
          title: 'Presión elevada en última medición',
          detail: `Último registro: ${lastPressure.systolic}/${lastPressure.diastolic} mmHg. Consulte a su médico si persiste.`,
          time: new Date(lastPressure.createdAt).toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        }
      : null;

  return (
    <div className="screen alerts-screen">
      <div className="page-topbar alerts-topbar">
        <Link to="/" className="icon-button" aria-label="Volver al inicio">
          <ArrowLeft size={22} />
        </Link>
        <h1>Alertas</h1>
      </div>

      <p className="alerts-intro">
        Recordatorios según la medicación guardada y avisos de salud. Para activar u omitir tipos de
        aviso, use{' '}
        <Link to="/configuracion/notificaciones">notificaciones</Link> en configuración.
      </p>

      <h2 className="alerts-section-title">Recordatorios de medicación</h2>
      {medications.length === 0 ? (
        <section className="alerts-empty-meds">
          <PillBottle size={40} strokeWidth={1.75} />
          <p>
            Aún no hay medicación guardada.{' '}
            <Link to="/medicacion">Añada medicación</Link> para ver aquí la hora y el nombre de cada
            recordatorio.
          </p>
        </section>
      ) : (
        <section className="alerts-list alerts-med-list">
          {medications.map((med) => {
            const slots =
              med.frequency === 'interdiario'
                ? [med.firstDoseHHmm]
                : medicationReminderHHmmSlots(med.firstDoseHHmm, med.intervalLabel);
            return (
              <article key={med.id} className="alert-item alert-item--med">
                <span className="alert-item-icon">
                  <PillBottle size={28} strokeWidth={2} />
                </span>
                <div>
                  <h2>{med.name}</h2>
                  <p className="alert-med-meta">
                    {med.doseMg} mg · {med.frequency === 'diario' ? 'Diario' : 'Interdiario'} ·{' '}
                    {med.intervalLabel}
                    {med.takeWithFood ? ' · Con comida' : ''}
                  </p>
                  {med.frequency === 'interdiario' ? (
                    <p className="alert-med-hint">
                      Tratamiento interdiario: mismo horario en días alternos según indicación médica.
                    </p>
                  ) : null}
                  <ul className="alert-reminder-times">
                    {slots.map((hhmm) => (
                      <li key={`${med.id}-${hhmm}`}>
                        <strong>{formatTimeDisplayEs(hhmm)}</strong>
                        <span> — recordatorio de toma</span>
                      </li>
                    ))}
                  </ul>
                  <time className="alert-med-added">
                    Guardado el{' '}
                    {new Date(med.createdAt).toLocaleString('es-MX', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {pressureAlert ? (
        <>
          <h2 className="alerts-section-title">Salud</h2>
          <section className="alerts-list">
            <article className="alert-item">
              <span className="alert-item-icon">
                <ShieldAlert size={28} strokeWidth={2} />
              </span>
              <div>
                <h2>{pressureAlert.title}</h2>
                <p>{pressureAlert.detail}</p>
                <time>{pressureAlert.time}</time>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {!pressureAlert && medications.length > 0 ? (
        <p className="alerts-footnote">
          <Bell size={16} strokeWidth={2} aria-hidden />
          La última presión registrada está en rango habitual o aún no hay mediciones guardadas.
        </p>
      ) : null}
    </div>
  );
};
