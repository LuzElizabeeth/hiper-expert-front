import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  PillBottle,
  Plus,
  Minus,
  Utensils,
  Trash2,
} from 'lucide-react';

import {
  createMedication,
  deleteMedication,
  getMedications,
} from '../api/medications.api';

import { formatTimeDisplayEs } from '../utils/timeDisplay';

export const Medication = () => {
  const navigate = useNavigate();

  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState(50);
  const [frequency, setFrequency] = useState<'diario' | 'interdiario'>(
    'diario'
  );
  const [interval, setInterval] = useState('Cada 24 horas');

  const [firstDoseHHmm, setFirstDoseHHmm] = useState('08:00');
  const [takeWithFood, setTakeWithFood] = useState(true);

  const [editingTime, setEditingTime] = useState(false);
  const [draftTime, setDraftTime] = useState('08:00');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [medications, setMedications] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  async function loadMedications() {
    try {
      setLoadingList(true);

      const result = await getMedications();
      setMedications(result.data ?? []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMedications();
  }, []);

  const applySuggestedMedication = (name: string) => {
    setMedicineName(name);
  };

  const increaseDose = () => {
    setDose((current) => Math.min(current + 5, 300));
  };

  const decreaseDose = () => {
    setDose((current) => Math.max(current - 5, 5));
  };

  const openTimeEditor = () => {
    setDraftTime(firstDoseHHmm);
    setEditingTime(true);
  };

  const saveTime = () => {
    setFirstDoseHHmm(draftTime);
    setEditingTime(false);
  };

  const cancelTimeEdit = () => {
    setEditingTime(false);
  };

  const frequencyHours =
    interval === 'Cada 8 horas'
      ? 8
      : interval === 'Cada 12 horas'
      ? 12
      : 24;

  const saveMedication = async () => {
    try {
      setSaving(true);
      setError('');

      await createMedication({
        name: medicineName.trim() || 'Medicamento',
        dose_mg: dose,
        frequency_hours:
          frequency === 'interdiario' ? 48 : frequencyHours,
        first_dose_time: firstDoseHHmm,
        with_food: takeWithFood,
      });

      setMedicineName('');
      setDose(50);
      setFrequency('diario');
      setInterval('Cada 24 horas');
      setFirstDoseHHmm('08:00');
      setTakeWithFood(true);

      loadMedications();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo guardar el medicamento.'
      );
    } finally {
      setSaving(false);
    }
  };

  const removeMedication = async (id: number) => {
    try {
      await deleteMedication(id);
      loadMedications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="screen medication-screen">
      <div className="page-topbar medication-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="icon-button"
        >
          <ArrowLeft size={22} />
        </button>

        <h1>Añadir medicación</h1>
      </div>

      <section className="medication-section">
        <h2>Detalles del Tratamiento</h2>
        <p>Completa los datos para recibir tus alertas a tiempo.</p>

        {error ? (
          <section className="home-muted-info">{error}</section>
        ) : null}

        <label className="medication-label">
          NOMBRE DEL MEDICAMENTO

          <div className="medication-input-wrap">
            <input
              type="text"
              placeholder="Ej: Losartán"
              value={medicineName}
              onChange={(event) =>
                setMedicineName(event.target.value)
              }
            />

            <button
              type="button"
              className="calendar-mini-btn"
            >
              <CalendarClock size={18} />
            </button>
          </div>
        </label>

        <div className="medication-suggestions">
          <button
            type="button"
            className={`suggestion-chip ${
              medicineName === 'Losartán' ? 'active' : ''
            }`}
            onClick={() =>
              applySuggestedMedication('Losartán')
            }
          >
            Losartán
          </button>

          <button
            type="button"
            className={`suggestion-chip ${
              medicineName === 'Amlodipino' ? 'active' : ''
            }`}
            onClick={() =>
              applySuggestedMedication('Amlodipino')
            }
          >
            Amlodipino
          </button>
        </div>

        <div className="dose-card">
          <span>DOSIS</span>

          <div className="dose-controls">
            <button
              type="button"
              onClick={decreaseDose}
              className="dose-btn"
            >
              <Minus size={22} />
            </button>

            <div className="dose-value">
              <strong>{dose}</strong>
              <small>MG</small>
            </div>

            <button
              type="button"
              onClick={increaseDose}
              className="dose-btn"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        <div className="frequency-section">
          <span>FRECUENCIA</span>

          <div className="frequency-options">
            <button
              type="button"
              className={`frequency-btn ${
                frequency === 'diario' ? 'active' : ''
              }`}
              onClick={() => setFrequency('diario')}
            >
              Diario
            </button>

            <button
              type="button"
              className={`frequency-btn ${
                frequency === 'interdiario'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setFrequency('interdiario')
              }
            >
              Interdiario
            </button>
          </div>
        </div>

        <label className="interval-select-wrap">
          <select
            value={interval}
            onChange={(event) =>
              setInterval(event.target.value)
            }
            disabled={frequency === 'interdiario'}
          >
            <option>Cada 8 horas</option>
            <option>Cada 12 horas</option>
            <option>Cada 24 horas</option>
          </select>
        </label>

        <section className="schedule-card">
          <h3>
            <CalendarClock size={20} />
            Configurar Horario
          </h3>

          <div className="first-dose-row">
            <div>
              <small>PRIMERA TOMA</small>

              <strong className="first-dose-display">
                {formatTimeDisplayEs(firstDoseHHmm)}
              </strong>
            </div>

            <button
              type="button"
              className="first-dose-edit-btn"
              onClick={openTimeEditor}
            >
              EDITAR
            </button>
          </div>

          {editingTime ? (
            <div className="time-editor-panel">
              <input
                type="time"
                className="time-input-elder"
                value={draftTime}
                onChange={(e) =>
                  setDraftTime(e.target.value)
                }
              />

              <div className="time-editor-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelTimeEdit}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={saveTime}
                >
                  Guardar hora
                </button>
              </div>
            </div>
          ) : null}

          <div className="food-row">
            <p>
              <Utensils size={18} />
              Tomar con comida
            </p>

            <button
              type="button"
              className={`food-switch ${
                takeWithFood ? 'on' : ''
              }`}
              onClick={() =>
                setTakeWithFood((current) => !current)
              }
            >
              <span />
            </button>
          </div>
        </section>

        <button
          type="button"
          className="primary-button medication-save-btn"
          onClick={saveMedication}
          disabled={saving}
        >
          <ClipboardCheck size={20} />
          {saving
            ? 'GUARDANDO...'
            : 'GUARDAR MEDICACIÓN'}
        </button>
      </section>

      <section className="medication-preview-card">
        <PillBottle size={20} />

        <p>
          {medicineName || 'Medicamento'} - {dose}mg -
          primera toma{' '}
          {formatTimeDisplayEs(firstDoseHHmm)}
        </p>
      </section>

      <section className="medication-section">
        <h2>Medicamentos activos</h2>

        {loadingList ? (
          <p>Cargando...</p>
        ) : medications.length === 0 ? (
          <p>No tienes medicamentos registrados.</p>
        ) : (
          medications.map((med) => (
            <article
              key={med.id}
              className="alert-item alert-item--med"
            >
              <span className="alert-item-icon">
                <PillBottle size={26} />
              </span>

              <div>
                <h3>{med.name}</h3>

                <p>
                  {med.dose_mg} mg · Cada{' '}
                  {med.frequency_hours} horas
                </p>

                <p>
                  Primera toma:{' '}
                  {formatTimeDisplayEs(
                    med.first_dose_time
                  )}
                </p>

                <small>
                  {med.with_food
                    ? 'Tomar con comida'
                    : 'Sin comida'}
                </small>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  removeMedication(med.id)
                }
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  );
};