import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ClipboardPlus, HeartPulse } from 'lucide-react';
import { getLastResult } from '../services/expertApi';
import { HealthCard } from '../components/HealthCard';

export const Result = () => {
  const result = getLastResult();

  if (!result) {
    return (
      <div className="screen center-screen">
        <HeartPulse size={58} />
        <h1>Sin resultado</h1>
        <p className="muted">Primero registra una evaluación para generar una orientación inicial.</p>

        <Link to="/evaluacion" className="primary-button">
          Iniciar evaluación
        </Link>
      </div>
    );
  }

  return (
    <div className="screen">
      <section className={`result-hero ${result.riskLevel.toLowerCase()}`}>
        <div className="result-icon">
          {result.riskLevel === 'Crítico' || result.riskLevel === 'Alto' ? (
            <AlertCircle size={46} />
          ) : (
            <CheckCircle2 size={46} />
          )}
        </div>

        <p>Orientación generada</p>
        <h1>Riesgo {result.riskLevel}</h1>
        <strong>{result.score} puntos</strong>
      </section>

      <HealthCard>
        <h2>Interpretación del sistema</h2>
        <p>{result.diagnosis}</p>
      </HealthCard>

      <HealthCard>
        <h2>Recomendaciones básicas</h2>

        <div className="recommendations">
          {result.recommendations.map((item) => (
            <div key={item} className="recommendation-item">
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </HealthCard>

      <HealthCard className="warning-card">
        <AlertCircle size={24} />
        <div>
          <h3>Limitaciones</h3>
          <p>
            Este resultado se basa en reglas simples tipo if-then. No representa un diagnóstico
            médico definitivo.
          </p>
        </div>
      </HealthCard>

      <Link to="/evaluacion" className="primary-button">
        <ClipboardPlus size={18} />
        Nueva evaluación
      </Link>
    </div>
  );
};