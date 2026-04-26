import { CheckCircle2 } from 'lucide-react';
import type { Symptom } from '../types/expert.types';

type SymptomOptionProps = {
  symptom: Symptom;
  selected: boolean;
  onToggle: () => void;
};

export const SymptomOption = ({ symptom, selected, onToggle }: SymptomOptionProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`symptom-option ${selected ? 'selected' : ''}`}
    >
      <div>
        <h3>{symptom.label}</h3>
        <p>{symptom.description}</p>
      </div>

      <CheckCircle2 size={22} />
    </button>
  );
};