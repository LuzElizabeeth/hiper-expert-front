import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ClipboardPlus,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Header } from '../components/Header';
import { HealthCard } from '../components/HealthCard';
import { getHistory } from '../services/expertApi';

export const Home = () => {
  const history = getHistory();
  const lastResult = history[0];

  return (
    <div className="screen">
      <Header title="Inicio" />

      <section className="hero-card">
        <div>
          <p className="eyebrow">Sistema experto</p>
          <h2>Detección temprana de riesgo cardiovascular</h2>
          <p>
            Registra síntomas y factores de riesgo para obtener una orientación preventiva.
          </p>
        </div>

        <HeartPulse size={54} />
      </section>

      <div className="status-pill">
        <ShieldCheck size={18} />
        <span>Este sistema no sustituye una consulta médica profesional.</span>
      </div>

      <HealthCard>
        <div className="section-title-row">
          <h2>Evaluación rápida</h2>
          <Activity size={22} />
        </div>

        <p className="muted">
          Contesta un formulario breve sobre síntomas relacionados con enfermedades cardiovasculares.
        </p>

        <Link to="/evaluacion" className="primary-button">
          <ClipboardPlus size={18} />
          Iniciar evaluación
        </Link>
      </HealthCard>

      <HealthCard>
        <div className="section-title-row">
          <h2>Último resultado</h2>
          <Stethoscope size={22} />
        </div>

        {lastResult ? (
          <div className="last-result">
            <span className={`risk-badge ${lastResult.riskLevel.toLowerCase()}`}>
              Riesgo {lastResult.riskLevel}
            </span>
            <h3>{lastResult.score} puntos</h3>
            <p>{lastResult.diagnosis}</p>
          </div>
        ) : (
          <p className="muted">Todavía no hay evaluaciones registradas.</p>
        )}
      </HealthCard>

      <HealthCard className="warning-card">
        <AlertTriangle size={24} />
        <div>
          <h3>Importante</h3>
          <p>
            Si existe dolor fuerte en el pecho, falta de aire, sudoración fría o desmayo,
            se debe buscar atención médica inmediata.
          </p>
        </div>
      </HealthCard>
    </div>
  );
};