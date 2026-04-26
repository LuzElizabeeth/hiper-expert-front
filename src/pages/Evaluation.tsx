import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { cardiovascularSymptoms, evaluateCardiovascularRisk } from '../services/expertApi';
import { SymptomOption } from '../components/SymptomOption';
import type { EvaluationPayload } from '../types/expert.types';

export const Evaluation = () => {
  const navigate = useNavigate();

  const [age, setAge] = useState(55);
  const [gender, setGender] = useState('Masculino');
  const [hasHypertension, setHasHypertension] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: EvaluationPayload = {
      age,
      gender,
      hasHypertension,
      hasDiabetes,
      smoker,
      selectedSymptoms,
    };

    setLoading(true);
    await evaluateCardiovascularRisk(payload);
    setLoading(false);

    navigate('/resultado');
  };

  return (
    <form className="screen" onSubmit={handleSubmit}>
      <div className="page-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={20} />
        </button>

        <h1>Evaluación cardiovascular</h1>
      </div>

      <section className="form-card">
        <h2>Datos generales</h2>

        <label>
          Edad
          <input
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(event) => setAge(Number(event.target.value))}
            required
          />
        </label>

        <label>
          Sexo
          <select value={gender} onChange={(event) => setGender(event.target.value)}>
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
        </label>
      </section>

      <section className="form-card">
        <h2>Factores de riesgo</h2>

        <label className="switch-row">
          <span>Hipertensión arterial</span>
          <input
            type="checkbox"
            checked={hasHypertension}
            onChange={(event) => setHasHypertension(event.target.checked)}
          />
        </label>

        <label className="switch-row">
          <span>Diabetes</span>
          <input
            type="checkbox"
            checked={hasDiabetes}
            onChange={(event) => setHasDiabetes(event.target.checked)}
          />
        </label>

        <label className="switch-row">
          <span>Tabaquismo</span>
          <input
            type="checkbox"
            checked={smoker}
            onChange={(event) => setSmoker(event.target.checked)}
          />
        </label>
      </section>

      <section className="form-card">
        <h2>Síntomas actuales</h2>
        <p className="muted">Selecciona todos los síntomas que presenta el paciente.</p>

        <div className="symptoms-list">
          {cardiovascularSymptoms.map((symptom) => (
            <SymptomOption
              key={symptom.id}
              symptom={symptom}
              selected={selectedSymptoms.includes(symptom.id)}
              onToggle={() => toggleSymptom(symptom.id)}
            />
          ))}
        </div>
      </section>

      <button className="primary-button submit-button" disabled={loading}>
        <Save size={18} />
        {loading ? 'Analizando síntomas...' : 'Generar prediagnóstico'}
      </button>
    </form>
  );
};