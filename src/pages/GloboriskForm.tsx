import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';
import { getRiskProfile, saveRiskProfile } from '../api/riskProfile.api';

export const GloboriskForm = () => {
  const navigate = useNavigate();

  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [isSmoker, setIsSmoker] = useState(false);
  const [systolicBp, setSystolicBp] = useState('120');
  const [age, setAge] = useState('40');
  const [totalCholesterol, setTotalCholesterol] = useState('180');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getRiskProfile();

        if (response.data) {
          setSex(response.data.sex);
          setHasDiabetes(response.data.has_diabetes);
          setIsSmoker(response.data.is_smoker);
          setSystolicBp(String(response.data.systolic_bp));
          setAge(String(response.data.age));
          setTotalCholesterol(String(response.data.total_cholesterol));
          setResult(response.data);
        }
      } catch (err) {
        console.error('Error cargando GLOBORISK:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const systolicNum = Number(systolicBp);
  const ageNum = Number(age);
  const cholesterolNum = Number(totalCholesterol);

  const canSave =
    Number.isInteger(systolicNum) &&
    Number.isInteger(ageNum) &&
    Number.isInteger(cholesterolNum) &&
    systolicNum >= 120 &&
    cholesterolNum >= 116 &&
    ageNum > 0 &&
    !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSave) return;

    try {
      setSaving(true);
      setError('');

      const response = await saveRiskProfile({
        sex,
        has_diabetes: hasDiabetes,
        is_smoker: isSmoker,
        systolic_bp: systolicNum,
        age: ageNum,
        total_cholesterol: cholesterolNum,
      });

      setResult(response.data);
      navigate('/confirmacion/globorisk-guardado', {
        state: {
          riskDisplay: response.data?.risk_display ?? 'Resultado actualizado',
          riskCategory: response.data?.risk_category_label ?? 'Categoría pendiente',
          calculationMessage: response.data?.calculation_message ?? 'Consulta el resultado con un profesional de salud.',
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo guardar el perfil GLOBORISK.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="screen profile-edit-screen">
        <section className="form-card">
          <h2>Cargando formulario...</h2>
          <p className="muted">Estamos obteniendo tu perfil de riesgo.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="screen profile-edit-screen">
      <div className="page-topbar profile-edit-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="icon-button"
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>

        <h1>Formulario GLOBORISK</h1>
      </div>

      <p className="profile-edit-intro">
        Completa tus datos para estimar el riesgo cardiovascular a 10 años.
      </p>

      <section className="warning-card">
        <HeartPulse size={22} />

        <div>
          <h3>Importante</h3>
          <p>
            Este cálculo es una herramienta de orientación y no sustituye una
            consulta médica profesional.
          </p>
        </div>
      </section>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          SEXO
          <select value={sex} onChange={(e) => setSex(e.target.value as any)}>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
          </select>
        </label>

        <label>
          EDAD EN AÑOS
          <input
            type="number"
            min={1}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ej: 52"
          />
        </label>

        <label>
          PRESIÓN SISTÓLICA MMHG
          <input
            type="number"
            min={120}
            value={systolicBp}
            onChange={(e) => setSystolicBp(e.target.value)}
            placeholder="Ej: 145"
          />
        </label>

        <label>
          COLESTEROL TOTAL MG/DL
          <input
            type="number"
            min={116}
            value={totalCholesterol}
            onChange={(e) => setTotalCholesterol(e.target.value)}
            placeholder="Ej: 200"
          />
        </label>

        <div className="frequency-section">
          <span>¿TIENE DIABETES?</span>

          <div className="frequency-options">
            <button
              type="button"
              className={`frequency-btn ${hasDiabetes ? 'active' : ''}`}
              onClick={() => setHasDiabetes(true)}
            >
              Sí
            </button>

            <button
              type="button"
              className={`frequency-btn ${!hasDiabetes ? 'active' : ''}`}
              onClick={() => setHasDiabetes(false)}
            >
              No
            </button>
          </div>
        </div>

        <div className="frequency-section">
          <span>¿ES FUMADOR?</span>

          <div className="frequency-options">
            <button
              type="button"
              className={`frequency-btn ${isSmoker ? 'active' : ''}`}
              onClick={() => setIsSmoker(true)}
            >
              Sí
            </button>

            <button
              type="button"
              className={`frequency-btn ${!isSmoker ? 'active' : ''}`}
              onClick={() => setIsSmoker(false)}
            >
              No
            </button>
          </div>
        </div>

        {error ? <p className="home-muted-info">{error}</p> : null}

        <button
          type="submit"
          className="primary-button"
          disabled={!canSave}
        >
          <Calculator size={18} />
          {saving ? 'CALCULANDO...' : 'GUARDAR Y CALCULAR RIESGO'}
        </button>
      </form>

      {result ? (
        <section className="success-card">
          <ShieldCheck size={24} />

          <div>
            <h3>Resultado GLOBORISK</h3>

            <p>
              {result.is_applicable
                ? `${result.risk_display} · ${result.risk_category_label}`
                : result.calculation_message}
            </p>

            {result.is_applicable ? (
              <p>{result.calculation_message}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="health-card">
        <h2>Datos usados para el cálculo</h2>

        <div className="info-row">
          <CheckCircle2 size={19} />
          <div>
            <span>Edad</span>
            <strong>{age || '--'} años</strong>
          </div>
        </div>

        <div className="info-row">
          <CheckCircle2 size={19} />
          <div>
            <span>Presión sistólica</span>
            <strong>{systolicBp || '--'} mmHg</strong>
          </div>
        </div>

        <div className="info-row">
          <CheckCircle2 size={19} />
          <div>
            <span>Colesterol total</span>
            <strong>{totalCholesterol || '--'} mg/dl</strong>
          </div>
        </div>
      </section>

      <Link to="/perfil" className="secondary-button">
        Volver a mi registro
      </Link>
    </div>
  );
};