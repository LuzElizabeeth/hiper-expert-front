import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock, ClipboardCheck, PillBottle, Plus, Minus, Utensils } from 'lucide-react';
import { saveMedicationEntry } from '../services/expertApi';
import { formatTimeDisplayEs } from '../utils/timeDisplay';

export const Medication = () => {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState(50);
  const [frequency, setFrequency] = useState<'diario' | 'interdiario'>('diario');
  const [interval, setInterval] = useState('Cada 12 horas');
  /** Hora primera toma en formato 24 h para el selector nativo */
  const [firstDoseHHmm, setFirstDoseHHmm] = useState('08:00');
  const [takeWithFood, setTakeWithFood] = useState(true);
  const [editingTime, setEditingTime] = useState(false);
  const [draftTime, setDraftTime] = useState('08:00');

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

  const saveMedication = () => {
    saveMedicationEntry({
      name: medicineName.trim() || 'Medicamento',
      doseMg: dose,
      frequency,
      intervalLabel: interval,
      firstDoseHHmm,
      takeWithFood,
    });
    navigate('/');
  };

  return (
    <div className="screen medication-screen">
      <div className="page-topbar medication-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={22} />
        </button>
        <h1>Añadir medicación</h1>
      </div>

      <section className="medication-section">
        <h2>Detalles del Tratamiento</h2>
        <p>Completa los datos para recibir tus alertas a tiempo.</p>

        <label className="medication-label">
          NOMBRE DEL MEDICAMENTO
          <div className="medication-input-wrap">
            <input
              type="text"
              placeholder="Ej: Enalapril"
              value={medicineName}
              onChange={(event) => setMedicineName(event.target.value)}
            />
            <button type="button" className="calendar-mini-btn" aria-label="Seleccionar medicación">
              <CalendarClock size={18} />
            </button>
          </div>
        </label>

        <div className="medication-suggestions">
          <button
            type="button"
            className={`suggestion-chip ${medicineName === 'Losartan' ? 'active' : ''}`}
            onClick={() => applySuggestedMedication('Losartan')}
          >
            Losartan
          </button>
          <button
            type="button"
            className={`suggestion-chip ${medicineName === 'Amlodipino' ? 'active' : ''}`}
            onClick={() => applySuggestedMedication('Amlodipino')}
          >
            Amlodipino
          </button>
        </div>

        <div className="dose-card">
          <span>DOSIS</span>
          <div className="dose-controls">
            <button type="button" onClick={decreaseDose} className="dose-btn" aria-label="Disminuir dosis">
              <Minus size={22} />
            </button>
            <div className="dose-value">
              <strong>{dose}</strong>
              <small>MG</small>
            </div>
            <button type="button" onClick={increaseDose} className="dose-btn" aria-label="Aumentar dosis">
              <Plus size={22} />
            </button>
          </div>
        </div>

        <div className="frequency-section">
          <span>FRECUENCIA</span>
          <div className="frequency-options">
            <button
              type="button"
              className={`frequency-btn ${frequency === 'diario' ? 'active' : ''}`}
              onClick={() => setFrequency('diario')}
            >
              Diario
            </button>
            <button
              type="button"
              className={`frequency-btn ${frequency === 'interdiario' ? 'active' : ''}`}
              onClick={() => setFrequency('interdiario')}
            >
              Interdiario
            </button>
          </div>
        </div>

        <label className="interval-select-wrap">
          <select value={interval} onChange={(event) => setInterval(event.target.value)}>
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
              <strong className="first-dose-display">{formatTimeDisplayEs(firstDoseHHmm)}</strong>
            </div>
            <button type="button" className="first-dose-edit-btn" onClick={openTimeEditor}>
              EDITAR
            </button>
          </div>

          {editingTime ? (
            <div className="time-editor-panel" role="dialog" aria-label="Elegir hora de la primera toma">
              <p className="time-editor-hint">Toque el reloj para elegir hora y minutos.</p>
              <input
                type="time"
                className="time-input-elder"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                aria-label="Hora de la primera toma"
              />
              <div className="time-editor-actions">
                <button type="button" className="secondary-button time-editor-cancel" onClick={cancelTimeEdit}>
                  Cancelar
                </button>
                <button type="button" className="primary-button time-editor-save" onClick={saveTime}>
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
              className={`food-switch ${takeWithFood ? 'on' : ''}`}
              onClick={() => setTakeWithFood((current) => !current)}
              aria-label="Tomar con comida"
            >
              <span />
            </button>
          </div>
        </section>

        <button type="button" className="primary-button medication-save-btn" onClick={saveMedication}>
          <ClipboardCheck size={20} />
          GUARDAR MEDICACIÓN
        </button>
      </section>

      <section className="medication-preview-card">
        <PillBottle size={20} />
        <p>
          {medicineName || 'Medicamento'} - {dose}mg - primera toma {formatTimeDisplayEs(firstDoseHHmm)} -{' '}
          {frequency === 'diario' ? 'Diario' : 'Interdiario'} ({interval})
        </p>
      </section>
    </div>
  );
};
