import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock, ClipboardCheck, PillBottle, Plus, Minus, Utensils } from 'lucide-react';

export const Medication = () => {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState(50);
  const [frequency, setFrequency] = useState<'diario' | 'interdiario'>('diario');
  const [interval, setInterval] = useState('Cada 12 horas');
  const [firstDoseTime, setFirstDoseTime] = useState('08:00 AM');
  const [takeWithFood, setTakeWithFood] = useState(true);

  const applySuggestedMedication = (name: string) => {
    setMedicineName(name);
  };

  const increaseDose = () => {
    setDose((current) => Math.min(current + 5, 300));
  };

  const decreaseDose = () => {
    setDose((current) => Math.max(current - 5, 5));
  };

  const toggleFirstDose = () => {
    setFirstDoseTime((current) => (current === '08:00 AM' ? '08:00 PM' : '08:00 AM'));
  };

  const saveMedication = () => {
    navigate('/');
  };

  return (
    <div className="screen medication-screen">
      <div className="page-topbar medication-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={20} />
        </button>
        <h1>Anadir Medicacion</h1>
      </div>

      <section className="medication-section">
        <h2>Detalles del Tratamiento</h2>
        <p>Complete los datos para recibir sus alertas a tiempo.</p>

        <label className="medication-label">
          NOMBRE DEL MEDICAMENTO
          <div className="medication-input-wrap">
            <input
              type="text"
              placeholder="Ej: Enalapril"
              value={medicineName}
              onChange={(event) => setMedicineName(event.target.value)}
            />
            <button type="button" className="calendar-mini-btn" aria-label="Seleccionar medicacion">
              <CalendarClock size={15} />
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
              <Minus size={20} />
            </button>
            <div className="dose-value">
              <strong>{dose}</strong>
              <small>MG</small>
            </div>
            <button type="button" onClick={increaseDose} className="dose-btn" aria-label="Aumentar dosis">
              <Plus size={20} />
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
            <CalendarClock size={17} />
            Configurar Horario
          </h3>

          <div className="first-dose-row">
            <div>
              <small>PRIMERA TOMA</small>
              <strong>{firstDoseTime}</strong>
            </div>
            <button type="button" onClick={toggleFirstDose}>
              EDITAR
            </button>
          </div>

          <div className="food-row">
            <p>
              <Utensils size={15} />
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
          <ClipboardCheck size={18} />
          GUARDAR MEDICACION
        </button>
      </section>

      <section className="medication-preview-card">
        <PillBottle size={16} />
        <p>
          {medicineName || 'Medicamento'} - {dose}mg - {frequency === 'diario' ? 'Diario' : 'Interdiario'} (
          {interval})
        </p>
      </section>
    </div>
  );
};
