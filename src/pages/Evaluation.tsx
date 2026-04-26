import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Save, Undo2, CheckCircle2 } from 'lucide-react';
import { savePressureMeasurement } from '../services/expertApi';

export const Evaluation = () => {
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState<'sistolica' | 'DIASTÓLICA'>('sistolica');
  const [sistolica, setSistolica] = useState('120');
  const [DIASTÓLICA, setDIASTÓLICA] = useState('80');
  const [replaceOnNextTap, setReplaceOnNextTap] = useState(true);

  const pulse = 72;

  const activeValue = useMemo(
    () => (activeField === 'sistolica' ? SISTÓLICA: DIASTÓLICA),
    [activeField, sistolica, DIASTÓLICA]
  );

  const updateActiveField = (nextValue: string) => {
    if (activeField === 'sistolica') {
      setSistolica(nextValue);
      return;
    }
    setDIASTÓLICA(nextValue);
  };

  const handleDigit = (digit: string) => {
    if (replaceOnNextTap) {
      updateActiveField(digit);
      setReplaceOnNextTap(false);
      return;
    }

    const base = activeValue === '0' ? digit : `${activeValue}${digit}`;
    updateActiveField(base.slice(0, 3));
  };

  const handleDelete = () => {
    if (activeValue.length <= 1) {
      updateActiveField('0');
      setReplaceOnNextTap(true);
      return;
    }
    updateActiveField(activeValue.slice(0, -1));
    setReplaceOnNextTap(false);
  };

  const handleFieldSelection = (field: 'sistolica' | 'DIASTÓLICA') => {
    setActiveField(field);
    setReplaceOnNextTap(true);
  };

  const handleNextField = () => {
    setActiveField((current) => (current === 'sistolica' ? 'DIASTÓLICA' : 'sistolica'));
    setReplaceOnNextTap(true);
  };

  const handleSaveMeasurement = () => {
    savePressureMeasurement({
      systolic: Number(sistolica),
      diastolic: Number(DIASTÓLICA),
      pulse,
    });

    navigate('/');
  };

  return (
    <div className="screen pressure-register-screen">
      <div className="page-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={20} />
        </button>
        <h1>Registrar presiónpresión</h1>
      </div>

      <section className="pressure-panel">
        <div className="pressure-values">
          <button
            type="button"
            className={`pressure-value ${activeField === 'sistolica' ? 'active' : ''}`}
            onClick={() => handleFieldSelection('sistolica')}
          >
            <span>SISTOLICA</span>
            <strong>{sistolica}</strong>
            <small>mmHg</small>
          </button>

          <button
            type="button"
            className={`pressure-value ${activeField === 'DIASTÓLICA' ? 'active' : ''}`}
            onClick={() => handleFieldSelection('DIASTÓLICA')}
          >
            <span>DIASTÓLICA</span>
            <strong>{DIASTÓLICA}</strong>
            <small>mmHg</small>
          </button>
        </div>

        <div className="pulse-row">
          <p>
            <Heart size={16} /> Pulso
          </p>
          <strong>
            {pulse} <span>LPM</span>
          </strong>
        </div>
      </section>

      <section className="pressure-ok-box">
        <CheckCircle2 size={18} />
        <p>Estos valores se guardarán para monitorear el control de la hipertensión.</p>
      </section>

      <section className="keypad-card">
        <div className="keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button key={digit} type="button" className="keypad-key" onClick={() => handleDigit(digit)}>
              {digit}
            </button>
          ))}
          <button type="button" className="keypad-key keypad-key-muted" onClick={handleDelete}>
            <Undo2 size={18} />
          </button>
          <button type="button" className="keypad-key" onClick={() => handleDigit('0')}>
            0
          </button>
          <button
            type="button"
            className="keypad-key keypad-key-main"
            onClick={handleNextField}
          >
            ↵
          </button>
        </div>
      </section>

      <button className="primary-button pressure-save-button" type="button" onClick={handleSaveMeasurement}>
        <Save size={18} />
        GUARDAR MEDICION
      </button>
    </div>
  );
};