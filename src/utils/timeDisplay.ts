/** Formato legible en español a partir de "HH:mm" (24 h) */
export function formatTimeDisplayEs(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function addHoursToHHmm(hhmm: string, hours: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  let total = h * 60 + m + hours * 60;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function intervalLabelToHours(label: string): number {
  if (label.includes('8')) return 8;
  if (label.includes('12')) return 12;
  return 24;
}

/** Horas del día en las que suena el recordatorio (mismo día). */
export function medicationReminderHHmmSlots(firstDoseHHmm: string, intervalLabel: string): string[] {
  const step = intervalLabelToHours(intervalLabel);
  if (step >= 24) {
    return [firstDoseHHmm];
  }
  const perDay = Math.min(24 / step, 8);
  const slots: string[] = [];
  for (let i = 0; i < perDay; i += 1) {
    slots.push(addHoursToHHmm(firstDoseHHmm, i * step));
  }
  return [...new Set(slots)].sort();
}
