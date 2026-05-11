import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Heart, Save, Undo2 } from 'lucide-react';
import { createVitalRecord } from '../api/vitals.api';

type ActiveField = 'sistolica' | 'diastolica' | 'pulso';

const classifyPressure = (systolic: number, diastolic: number) => {
  if (systolic >= 140 || diastolic >= 90) {
    return {
      tone: 'high',
      label: 'Valores elevados. Guarde la medición y revise sus alertas de seguimiento.',
      statusLabel: 'Presión elevada',
    };
  }

  if (systolic >= 130 || diastolic >= 85) {
    return {
      tone: 'warning',
      label: 'Estos valores están ligeramente elevados para su perfil.',
      statusLabel: 'Presión ligeramente elevada',
    };
  }

  return {
    tone: 'normal',
    label: 'Estos valores se encuentran en el rango normal para su perfil.',
    statusLabel: 'Rango normal',
  };
};

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
    if (activeField === 'sistolica') return setSistolica(nextValue);
    if (activeField === 'diastolica') return setDiastolica(nextValue);
    return setPulso(nextValue);
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

  const pressureStatus = classifyPressure(sysNum, diaNum);

  const handleSaveMeasurement = async () => {
    if (!canSave) return;

    setSaving(true);
    setError('');

    try {
      const recordedAt = new Date().toISOString();
      const response = await createVitalRecord({
        systolic_bp: sysNum,
        diastolic_bp: diaNum,
        heart_rate_bpm: pulseNum,
        symptoms: [],
        recorded_at: recordedAt,
      });

      navigate('/confirmacion/presion-registrada', {
        state: {
          systolic: sysNum,
          diastolic: diaNum,
          pulse: pulseNum,
          statusLabel:
            response.data?.bp_category_label ?? pressureStatus.statusLabel,
          recordedAt,
        },
      });
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
      <div className="pressure-register-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="icon-button pressure-back-btn"
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>

        <h1>Registrar Presión</h1>

        <span className="pressure-topbar-spacer" aria-hidden="true" />
      </div>

      <section className="pressure-input-area">
        <div className="pressure-values-main">
          <button
            type="button"
            className={`pressure-value-card ${
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
            className={`pressure-value-card ${
              activeField === 'diastolica' ? 'active' : ''
            }`}
            onClick={() => handleFieldSelection('diastolica')}
          >
            <span>DIASTÓLICA</span>
            <strong>{diastolica}</strong>
            <small>mmHg</small>
          </button>
        </div>

        <button
          type="button"
          className={`pressure-pulse-pill ${activeField === 'pulso' ? 'active' : ''}`}
          onClick={() => handleFieldSelection('pulso')}
        >
          <span>
            <Heart size={22} fill="currentColor" />
            Pulso
          </span>
          <strong>{pulso}</strong>
          <small>LPM</small>
        </button>
      </section>

      {error ? (
        <section className="pressure-feedback pressure-feedback--error">
          <p>{error}</p>
        </section>
      ) : (
        <section className={`pressure-feedback pressure-feedback--${pressureStatus.tone}`}>
          <CheckCircle2 size={21} />
          <p>{pressureStatus.label}</p>
        </section>
      )}

      <section className="pressure-keypad" aria-label="Teclado numérico">
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
          aria-label="Borrar"
        >
          <Undo2 size={24} />
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
          aria-label="Siguiente campo"
        >
          ↵
        </button>
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
