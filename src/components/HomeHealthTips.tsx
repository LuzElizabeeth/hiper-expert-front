import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { HYPERTENSION_HEALTH_TIPS } from '../data/hypertensionHealthTips';

const ROTATION_MS = 30_000;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const HomeHealthTips = () => {
  const tips = useMemo(() => shuffle(HYPERTENSION_HEALTH_TIPS), []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [tips.length]);

  return (
    <section className="home-tip-card home-hypertension-tips" aria-live="polite">
      <div className="home-hypertension-tips-head">
        <span className="home-card-header-icon home-hypertension-tips-icon" aria-hidden>
          <Sparkles size={34} strokeWidth={2} />
        </span>
        <h3 className="home-hypertension-tips-title">Consejos para la hipertensión</h3>
      </div>
      <p key={index} className="home-hypertension-tips-body">
        {tips[index]}
      </p>
    </section>
  );
};
