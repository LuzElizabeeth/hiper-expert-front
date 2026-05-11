import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock3, Pill, PillBottle, Plus, Trash2 } from 'lucide-react';

import { deleteMedication, getMedications } from '../api/medications.api';
import { formatTimeDisplayEs } from '../utils/timeDisplay';

const medicationName = (med: any) => med?.medication?.name ?? med?.name ?? 'Medicamento';
const medicationDose = (med: any) => med?.medication?.dose_mg ?? med?.dose_mg ?? '--';
const medicationTime = (med: any) => {
  const value = med?.next_due_at ?? med?.first_dose_time ?? med?.medication?.first_dose_time;
  if (!value) return 'Horario pendiente';
  if (/^\d{2}:\d{2}/.test(value)) return formatTimeDisplayEs(value.slice(0, 5));
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const isTaken = (med: any) => med?.status === 'taken' || med?.status === 'completed' || med?.is_taken === true || med?.taken === true;

export const MedicationsToday = () => {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const result = await getMedications();
        setMedications(result.data ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error?.message || 'No se pudieron cargar los medicamentos.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const takenCount = useMemo(() => medications.filter(isTaken).length, [medications]);
  const progress = medications.length ? Math.round((takenCount / medications.length) * 100) : 0;

  const removeMedication = async (med: any) => {
    try {
      await deleteMedication(med.id);
      navigate('/confirmacion/medicacion-eliminada', { state: { medicationName: medicationName(med), dose: `${medicationDose(med)}mg` } });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'No se pudo eliminar el medicamento.');
    }
  };

  return (
    <div className="screen medication-screen medication-today-screen">
      <div className="page-topbar medication-topbar medication-today-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button" aria-label="Volver"><ArrowLeft size={22} /></button>
        <h1>Medicación de hoy</h1>
        <Link to="/medicacion/nueva" className="icon-button medication-add-circle" aria-label="Añadir medicación"><Plus size={22} /></Link>
      </div>

      <section className="medication-today-hero">
        <span className="medication-hero-icon"><PillBottle size={30} /></span>
        <div>
          <p>Plan diario</p>
          <h2>{medications.length ? `${medications.length} medicamento${medications.length === 1 ? '' : 's'} activo${medications.length === 1 ? '' : 's'}` : 'Sin medicamentos registrados'}</h2>
        </div>
      </section>

      {error ? <section className="home-muted-info">{error}</section> : null}

      <section className="medication-today-card">
        <div className="medication-card-head">
          <div>
            <h2>Medicamentos de hoy</h2>
            <p>{medications.length ? 'Revisa tus tomas programadas para mantener tu tratamiento al día.' : 'Agrega tu primer medicamento para crear recordatorios.'}</p>
          </div>
          {medications.length ? <span className="medication-progress-badge">{progress}%</span> : null}
        </div>

        {loading ? (
          <p className="medication-empty-text">Cargando medicamentos...</p>
        ) : medications.length === 0 ? (
          <div className="medication-empty-state">
            <span><Pill size={30} /></span>
            <h3>No hay medicación activa</h3>
            <p>Cuando agregues un medicamento aparecerá aquí con su hora, dosis y estado.</p>
            <Link to="/medicacion/nueva" className="primary-button medication-empty-btn"><Plus size={18} />Añadir medicación</Link>
          </div>
        ) : (
          <div className="medication-today-list">
            {medications.map((med) => {
              const taken = isTaken(med);
              return (
                <article key={med.id ?? medicationName(med)} className={`medication-today-item ${taken ? 'taken' : ''}`}>
                  <span className="medication-state-icon">{taken ? <Check size={18} /> : <Clock3 size={19} />}</span>
                  <div className="medication-today-main">
                    <strong>{medicationName(med)}</strong>
                    <p>{medicationTime(med)} • {medicationDose(med)}mg</p>
                  </div>
                  {taken ? <span className="medication-taken-label">Tomado</span> : <span className="medication-pending-label">Pendiente</span>}
                  <button type="button" className="medication-trash-btn" onClick={() => removeMedication(med)} aria-label={`Eliminar ${medicationName(med)}`}><Trash2 size={17} /></button>
                </article>
              );
            })}
          </div>
        )}

        {medications.length ? (
          <div className="medication-today-actions">
            <button type="button" className="primary-button medication-mark-btn" disabled title="Pendiente de conexión con endpoint de toma"><Check size={18} />Marcar como tomado</button>
            <Link to="/medicacion/nueva" className="medication-secondary-action">Añadir otra medicación</Link>
          </div>
        ) : null}
      </section>
    </div>
  );
};
