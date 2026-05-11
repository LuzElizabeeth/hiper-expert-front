import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  ClipboardCheck,
  HeartPulse,
  Pill,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';

type ConfirmationState = {
  medicationName?: string;
  dose?: string | number;
  frequency?: string | number;
  nextDose?: string;
  withFood?: boolean;
  systolic?: string | number;
  diastolic?: string | number;
  pulse?: string | number;
  statusLabel?: string;
  recordedAt?: string;
  displayName?: string;
  phone?: string;
  age?: string | number | null;
  conditions?: string;
  fullName?: string;
  relation?: string;
  activeSettings?: string | number;
  totalSettings?: string | number;
  riskDisplay?: string;
  riskCategory?: string;
  calculationMessage?: string;
  alertTitle?: string;
  alertType?: string;
};

type SummaryItem = {
  icon: ReactNode;
  label?: string;
  title: string;
  detail?: string;
};

type ConfirmationConfig = {
  topTitle: string;
  title: string;
  message: string;
  summaryItems: SummaryItem[];
  progressLabel?: string;
  progressValue?: number;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  backTo?: string;
};

const asText = (value: unknown, fallback: string) => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Registrado ahora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Registrado ahora';
  return date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
};

const buildConfig = (kind: string, state: ConfirmationState): ConfirmationConfig => {
  const medicationName = asText(state.medicationName, 'Medicamento');
  const dose = asText(state.dose, '50mg');
  const nextDose = asText(state.nextDose, 'Próxima toma pendiente');
  const fullName = asText(state.fullName, 'Contacto de emergencia');
  const displayName = asText(state.displayName, 'Perfil del usuario');
  const pressure = `${asText(state.systolic, '--')}/${asText(state.diastolic, '--')} mmHg`;

  const configs: Record<string, ConfirmationConfig> = {
    'medicacion-guardada': {
      topTitle: 'Medicación guardada',
      title: '¡Medicación Guardada!',
      message: `${medicationName} ha sido añadido correctamente a tu plan diario.`,
      summaryItems: [
        { icon: <Pill size={24} />, title: medicationName, detail: `${dose} · ${asText(state.frequency, 'Cada 24 horas')}${state.withFood ? ' · Con comida' : ''}` },
        { icon: <CalendarDays size={24} />, label: 'PRÓXIMA TOMA', title: nextDose },
      ],
      progressLabel: 'Progreso del día',
      progressValue: 85,
      primaryLabel: 'VOLVER A MEDICACIÓN',
      primaryTo: '/medicacion',
      secondaryLabel: 'Añadir otra medicación',
      secondaryTo: '/medicacion/nueva',
      backTo: '/medicacion',
    },
    'medicacion-eliminada': {
      topTitle: 'Medicación eliminada',
      title: '¡Medicación Eliminada!',
      message: `${medicationName} fue retirada de tu plan de medicación.`,
      summaryItems: [
        { icon: <Trash2 size={24} />, title: medicationName, detail: 'Ya no aparecerá en tus recordatorios activos.' },
      ],
      primaryLabel: 'VOLVER A MEDICACIÓN',
      primaryTo: '/medicacion',
      secondaryLabel: 'Añadir nueva medicación',
      secondaryTo: '/medicacion/nueva',
      backTo: '/medicacion',
    },
    'presion-registrada': {
      topTitle: 'Presión registrada',
      title: '¡Presión Registrada!',
      message: 'Tu medición se guardó correctamente en el historial.',
      summaryItems: [
        { icon: <HeartPulse size={24} />, title: pressure, detail: `Pulso ${asText(state.pulse, '--')} LPM` },
        { icon: <ClipboardCheck size={24} />, label: 'ESTADO', title: asText(state.statusLabel, 'Registro guardado'), detail: formatDateTime(state.recordedAt) },
      ],
      progressLabel: 'Seguimiento semanal',
      progressValue: 70,
      primaryLabel: 'VOLVER AL INICIO',
      primaryTo: '/',
      secondaryLabel: 'Ver historial',
      secondaryTo: '/historial',
      backTo: '/',
    },
    'perfil-guardado': {
      topTitle: 'Perfil actualizado',
      title: '¡Perfil Actualizado!',
      message: 'Los datos de tu perfil se guardaron correctamente.',
      summaryItems: [
        { icon: <UserRound size={24} />, title: displayName, detail: `${asText(state.age, 'Edad no registrada')} años · ${asText(state.phone, 'Sin teléfono')}` },
        { icon: <ShieldCheck size={24} />, label: 'DATOS CLÍNICOS', title: asText(state.conditions, 'Información básica actualizada') },
      ],
      primaryLabel: 'VOLVER AL PERFIL',
      primaryTo: '/perfil',
      secondaryLabel: 'Seguir editando',
      secondaryTo: '/configuracion/perfil',
      backTo: '/configuracion/perfil',
    },
    'contacto-guardado': {
      topTitle: 'Contacto guardado',
      title: '¡Contacto Guardado!',
      message: 'Tu contacto de emergencia se añadió correctamente.',
      summaryItems: [
        { icon: <UserRound size={24} />, title: fullName, detail: `${asText(state.relation, 'Contacto de confianza')} · ${asText(state.phone, 'Sin teléfono')}` },
        { icon: <Bell size={24} />, label: 'ALERTAS', title: 'Avisos de salud activados' },
      ],
      primaryLabel: 'VOLVER A CONFIGURACIÓN',
      primaryTo: '/configuracion',
      secondaryLabel: 'Editar contacto',
      secondaryTo: '/contacto-emergencia',
      backTo: '/contacto-emergencia',
    },
    'contacto-actualizado': {
      topTitle: 'Contacto actualizado',
      title: '¡Contacto Actualizado!',
      message: 'La información del contacto de emergencia fue modificada correctamente.',
      summaryItems: [
        { icon: <UserRound size={24} />, title: fullName, detail: `${asText(state.relation, 'Contacto de confianza')} · ${asText(state.phone, 'Sin teléfono')}` },
      ],
      primaryLabel: 'VOLVER A CONFIGURACIÓN',
      primaryTo: '/configuracion',
      secondaryLabel: 'Seguir editando',
      secondaryTo: '/contacto-emergencia',
      backTo: '/contacto-emergencia',
    },
    'contacto-eliminado': {
      topTitle: 'Contacto eliminado',
      title: '¡Contacto Eliminado!',
      message: 'El contacto de emergencia fue eliminado correctamente.',
      summaryItems: [
        { icon: <Trash2 size={24} />, title: fullName, detail: 'Puedes agregar otro contacto cuando lo necesites.' },
      ],
      primaryLabel: 'VOLVER A CONFIGURACIÓN',
      primaryTo: '/configuracion',
      secondaryLabel: 'Añadir contacto',
      secondaryTo: '/contacto-emergencia',
      backTo: '/configuracion',
    },
    'notificaciones-guardadas': {
      topTitle: 'Notificaciones guardadas',
      title: '¡Ajustes Guardados!',
      message: 'Tus preferencias de alertas y recordatorios quedaron actualizadas.',
      summaryItems: [
        { icon: <Bell size={24} />, title: `${asText(state.activeSettings, '0')} de ${asText(state.totalSettings, '6')} opciones activas`, detail: 'Configuración de notificaciones actualizada.' },
      ],
      primaryLabel: 'VOLVER A CONFIGURACIÓN',
      primaryTo: '/configuracion',
      secondaryLabel: 'Seguir ajustando',
      secondaryTo: '/configuracion/notificaciones',
      backTo: '/configuracion/notificaciones',
    },
    'globorisk-guardado': {
      topTitle: 'Evaluación guardada',
      title: '¡Evaluación Guardada!',
      message: 'Tu perfil GLOBORISK se guardó correctamente.',
      summaryItems: [
        { icon: <HeartPulse size={24} />, title: asText(state.riskDisplay, 'Resultado actualizado'), detail: asText(state.riskCategory, 'Categoría pendiente') },
        { icon: <ShieldCheck size={24} />, label: 'ORIENTACIÓN', title: asText(state.calculationMessage, 'Consulta el resultado con un profesional de salud.') },
      ],
      primaryLabel: 'VOLVER A MI REGISTRO',
      primaryTo: '/perfil',
      secondaryLabel: 'Editar evaluación',
      secondaryTo: '/globorisk',
      backTo: '/globorisk',
    },
    'alerta-resuelta': {
      topTitle: 'Alerta resuelta',
      title: '¡Alerta Resuelta!',
      message: 'La alerta fue marcada como atendida correctamente.',
      summaryItems: [
        { icon: <Check size={24} />, title: asText(state.alertTitle, 'Alerta'), detail: asText(state.alertType, 'Estado actualizado') },
      ],
      primaryLabel: 'VOLVER A ALERTAS',
      primaryTo: '/alertas',
      secondaryLabel: 'Ir al inicio',
      secondaryTo: '/',
      backTo: '/alertas',
    },
    'alerta-descartada': {
      topTitle: 'Alerta descartada',
      title: '¡Alerta Descartada!',
      message: 'La alerta fue retirada de la lista activa.',
      summaryItems: [
        { icon: <Trash2 size={24} />, title: asText(state.alertTitle, 'Alerta'), detail: asText(state.alertType, 'Estado actualizado') },
      ],
      primaryLabel: 'VOLVER A ALERTAS',
      primaryTo: '/alertas',
      secondaryLabel: 'Ir al inicio',
      secondaryTo: '/',
      backTo: '/alertas',
    },
  };

  return configs[kind] ?? {
    topTitle: 'Confirmación',
    title: '¡Cambios Guardados!',
    message: 'La operación se completó correctamente.',
    summaryItems: [{ icon: <Check size={24} />, title: 'Operación completada', detail: 'Puedes continuar usando la aplicación.' }],
    primaryLabel: 'VOLVER AL INICIO',
    primaryTo: '/',
    secondaryLabel: 'Ver historial',
    secondaryTo: '/historial',
    backTo: '/',
  };
};

export const ActionConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type = 'general' } = useParams();
  const state = (location.state ?? {}) as ConfirmationState;
  const config = buildConfig(type, state);
  const handleBack = () => {
    if (config.backTo) navigate(config.backTo);
    else navigate(-1);
  };

  return (
    <div className="screen confirmation-screen">
      <div className="page-topbar confirmation-topbar">
        <button type="button" className="icon-button" onClick={handleBack} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <h1>{config.topTitle}</h1>
      </div>

      <section className="confirmation-hero" aria-live="polite">
        <div className="confirmation-check-ring"><span><Check size={54} strokeWidth={4} /></span></div>
        <h2>{config.title}</h2>
        <p>{config.message}</p>
      </section>

      <section className="confirmation-summary-card">
        {config.summaryItems.map((item, index) => (
          <article key={`${item.title}-${index}`} className="confirmation-summary-item">
            <span className="confirmation-summary-icon">{item.icon}</span>
            <div>
              {item.label ? <small>{item.label}</small> : null}
              <strong>{item.title}</strong>
              {item.detail ? <p>{item.detail}</p> : null}
            </div>
          </article>
        ))}
      </section>

      {typeof config.progressValue === 'number' ? (
        <section className="confirmation-progress-block">
          <div><strong>{config.progressLabel}</strong><span>{config.progressValue}%</span></div>
          <progress max="100" value={config.progressValue}>{config.progressValue}%</progress>
        </section>
      ) : null}

      <div className="confirmation-actions">
        <Link to={config.primaryTo} className="primary-button confirmation-primary">{config.primaryLabel}</Link>
        {config.secondaryTo && config.secondaryLabel ? (
          <Link to={config.secondaryTo} className="confirmation-secondary">{config.secondaryLabel}</Link>
        ) : null}
      </div>
    </div>
  );
};
