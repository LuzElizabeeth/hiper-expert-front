import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Save, Undo2, CheckCircle2 } from 'lucide-react';
import { createVitalRecord } from '../api/vitals.api';

type ActiveField = 'sistolica' | 'diastolica' | 'pulso';

export const Evaluation = () => {
  const navigate = useNavigate();

  const [activeField, setActiveField] = useState<ActiveField>('sistolica');
  const [sistolica, setSistolica] = useState('120');
  const [diastolica, setDiastolica] = useState('80');
  const [pulso, setPulso] = useState('72');

  const [replaceOnNextTap, setReplaceOnNextTap] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeValue = useMemo(() => {
    if (activeField === 'sistolica') return sistolica;
    if (activeField === 'diastolica') return diastolica;
    return pulso;
  }, [activeField, sistolica, diastolica, pulso]);

  const updateActiveField = (nextValue: string) => {
    if (activeField === 'sistolica') {
      setSistolica(nextValue);
      return;
    }

    if (activeField === 'diastolica') {
      setDiastolica(nextValue);
      return;
    }

    setPulso(nextValue);
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

  const handleFieldSelection = (field: ActiveField) => {
    setActiveField(field);
    setReplaceOnNextTap(true);
  };

  const handleNextField = () => {
    setActiveField((current) => {
      if (current === 'sistolica') return 'diastolica';
      if (current === 'diastolica') return 'pulso';
      return 'sistolica';
    });

    setReplaceOnNextTap(true);
  };

  const sysNum = Number(sistolica);
  const diaNum = Number(diastolica);
  const pulseNum = Number(pulso);

  const canSave =
    Number.isInteger(sysNum) &&
    Number.isInteger(diaNum) &&
    Number.isInteger(pulseNum) &&
    sysNum >= 70 &&
    sysNum <= 260 &&
    diaNum >= 40 &&
    diaNum <= 160 &&
    pulseNum >= 30 &&
    pulseNum <= 220 &&
    !saving;

  const handleSaveMeasurement = async () => {
    if (!canSave) return;

    setSaving(true);
    setError('');

    try {
      await createVitalRecord({
        systolic_bp: sysNum,
        diastolic_bp: diaNum,
        heart_rate_bpm: pulseNum,
        symptoms: [],
        recorded_at: new Date().toISOString(),
      });

      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo guardar la medición. Intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen pressure-register-screen">
      <div className="page-topbar pressure-register-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="icon-button"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>

        <h1>Registrar presión</h1>

        <span className="pressure-topbar-spacer" aria-hidden="true" />
      </div>

      <section className="pressure-panel">
        <div className="pressure-values pressure-values--three">
  <button
    type="button"
    className={`pressure-value ${
      activeField === 'sistolica' ? 'active' : ''
    }`}
    onClick={() => handleFieldSelection('sistolica')}
  >
    <span>SISTÓLICA</span>
    <strong>{sistolica}</strong>
    <small>mmHg</small>
  </button>

  <button
    type="button"
    className={`pressure-value ${
      activeField === 'diastolica' ? 'active' : ''
    }`}
    onClick={() => handleFieldSelection('diastolica')}
  >
    <span>DIASTÓLICA</span>
    <strong>{diastolica}</strong>
    <small>mmHg</small>
  </button>

  <button
    type="button"
    className={`pressure-value pulse-value ${
      activeField === 'pulso' ? 'active' : ''
    }`}
    onClick={() => handleFieldSelection('pulso')}
  >
    <span>
      <Heart size={14} /> PULSO
    </span>
    <strong>{pulso}</strong>
    <small>LPM</small>
  </button>
</div>

        
      </section>

      {error ? (
        <section className="home-muted-info">{error}</section>
      ) : (
        <section className="pressure-ok-box">
          <CheckCircle2 size={18} />
          <p>
            Estos valores se guardarán para monitorear el control de la
            hipertensión.
          </p>
        </section>
      )}

      <section className="keypad-card">
        <div className="keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="keypad-key"
              onClick={() => handleDigit(digit)}
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            className="keypad-key keypad-key-muted"
            onClick={handleDelete}
          >
            <Undo2 size={18} />
          </button>

          <button
            type="button"
            className="keypad-key"
            onClick={() => handleDigit('0')}
          >
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

      <button
        className="primary-button pressure-save-button"
        type="button"
        onClick={handleSaveMeasurement}
        disabled={!canSave}
      >
        <Save size={18} />
        {saving ? 'GUARDANDO...' : 'GUARDAR MEDICIÓN'}
      </button>
    </div>
  );
};