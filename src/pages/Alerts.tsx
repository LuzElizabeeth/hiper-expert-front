import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Check,
  PillBottle,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  type Alert,
  dismissAlert,
  getAlerts,
  resolveAlert,
} from '../api/alerts.api';
import { getDueMedications } from '../api/home.api';

const severityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

const alertTypeLabels = {
  medical: 'Salud',
  medication: 'Medicamento',
};

const dueStatusLabels = {
  completed: 'Toma anterior registrada',
  due: 'Pendiente ahora',
  missed: 'Toma vencida',
  upcoming: 'Próxima toma cercana',
  scheduled: 'Programada',
};

export const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dueMedications, setDueMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function loadAlerts() {
    try {
      setLoading(true);
      setError('');

      const [alertsRes, dueMedsRes] = await Promise.all([
        getAlerts('active', 50),
        getDueMedications(),
      ]);

      setAlerts(alertsRes.data ?? []);
      setDueMedications(dueMedsRes.data ?? []);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudieron cargar las alertas.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  async function handleResolve(id: number) {
    try {
      setActionLoadingId(id);
      await resolveAlert(id);
      setAlerts((current) => current.filter((alert) => alert.id !== id));
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo resolver la alerta.'
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDismiss(id: number) {
    try {
      setActionLoadingId(id);
      await dismissAlert(id);
      setAlerts((current) => current.filter((alert) => alert.id !== id));
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo descartar la alerta.'
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  const medicationAlerts = alerts.filter(
    (alert) => alert.alert_type === 'medication'
  );

  const medicalAlerts = alerts.filter(
    (alert) => alert.alert_type === 'medical'
  );

  return (
    <div className="screen alerts-screen">
      <div className="page-topbar alerts-topbar">
        <Link to="/" className="icon-button" aria-label="Volver al inicio">
          <ArrowLeft size={22} />
        </Link>

        <h1>Alertas</h1>
      </div>

      <p className="alerts-intro">
        Aquí se muestran recordatorios de medicación y avisos de salud generados
        por tus registros. Para activar u omitir tipos de aviso, usa{' '}
        <Link to="/configuracion/notificaciones">notificaciones</Link> en
        configuración.
      </p>

      {error ? <section className="home-muted-info">{error}</section> : null}

      {loading ? (
        <section className="alerts-empty-meds">
          <Bell size={40} strokeWidth={1.75} />
          <p>Cargando alertas...</p>
        </section>
      ) : null}

      {!loading ? (
        <>
          <h2 className="alerts-section-title">Recordatorios de medicación</h2>

          {dueMedications.length === 0 && medicationAlerts.length === 0 ? (
            <section className="alerts-empty-meds">
              <PillBottle size={40} strokeWidth={1.75} />
              <p>
                No hay recordatorios de medicación activos.{' '}
                <Link to="/medicacion">Añade medicación</Link> para ver aquí tus
                próximas tomas.
              </p>
            </section>
          ) : (
            <section className="alerts-list alerts-med-list">
              {dueMedications.map((item) => (
                <article
                  key={`due-med-${item.medication.id}`}
                  className="alert-item alert-item--med"
                >
                  <span className="alert-item-icon">
                    <PillBottle size={28} strokeWidth={2} />
                  </span>

                  <div>
                    <h2>{item.medication.name}</h2>

                    <p className="alert-med-meta">
                      {item.medication.dose_mg} mg · Cada{' '}
                      {item.medication.frequency_hours} horas
                      {item.medication.with_food ? ' · Con comida' : ''}
                    </p>

                    <p className="alert-med-hint">
                      {dueStatusLabels[
                        item.status as keyof typeof dueStatusLabels
                      ] ?? item.message}
                    </p>

                    {item.with_food_reminder ? (
                      <p className="alert-med-hint">
                        {item.with_food_reminder}
                      </p>
                    ) : null}

                    {item.previous_scheduled_time ? (
                      <time className="alert-med-added">
                        Toma previa:{' '}
                        {new Date(
                          item.previous_scheduled_time
                        ).toLocaleString('es-MX', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </time>
                    ) : null}

                    {item.next_scheduled_time ? (
                      <time className="alert-med-added">
                        Próxima toma:{' '}
                        {new Date(item.next_scheduled_time).toLocaleString(
                          'es-MX',
                          {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          }
                        )}
                      </time>
                    ) : null}
                  </div>
                </article>
              ))}

              {medicationAlerts.map((alert) => (
                <article key={alert.id} className="alert-item alert-item--med">
                  <span className="alert-item-icon">
                    <PillBottle size={28} strokeWidth={2} />
                  </span>

                  <div>
                    <h2>{alert.title}</h2>
                    <p>{alert.message}</p>

                    <p className="alert-med-meta">
                      Tipo: {alertTypeLabels[alert.alert_type]} · Severidad:{' '}
                      {severityLabels[alert.severity]}
                    </p>

                    <time className="alert-med-added">
                      {new Date(alert.created_at).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>

                    <div className="alert-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={actionLoadingId === alert.id}
                        onClick={() => handleResolve(alert.id)}
                      >
                        <Check size={16} />
                        Resolver
                      </button>

                      <button
                        type="button"
                        className="icon-button"
                        disabled={actionLoadingId === alert.id}
                        onClick={() => handleDismiss(alert.id)}
                        aria-label="Descartar alerta"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          <h2 className="alerts-section-title">Salud</h2>

          {medicalAlerts.length === 0 ? (
            <p className="alerts-footnote">
              <Bell size={16} strokeWidth={2} aria-hidden />
              No hay alertas médicas activas en este momento.
            </p>
          ) : (
            <section className="alerts-list">
              {medicalAlerts.map((alert) => (
                <article key={alert.id} className="alert-item">
                  <span className="alert-item-icon">
                    <ShieldAlert size={28} strokeWidth={2} />
                  </span>

                  <div>
                    <h2>{alert.title}</h2>
                    <p>{alert.message}</p>

                    <p className="alert-med-meta">
                      Severidad: {severityLabels[alert.severity]}
                    </p>

                    <time>
                      {new Date(alert.created_at).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>

                    <div className="alert-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={actionLoadingId === alert.id}
                        onClick={() => handleResolve(alert.id)}
                      >
                        <Check size={16} />
                        Resolver
                      </button>

                      <button
                        type="button"
                        className="icon-button"
                        disabled={actionLoadingId === alert.id}
                        onClick={() => handleDismiss(alert.id)}
                        aria-label="Descartar alerta"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      ) : null}
    </div>
  );
};