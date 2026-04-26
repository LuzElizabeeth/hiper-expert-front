import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, PillBottle, Activity, Headset, ShieldAlert } from 'lucide-react';
import {
  defaultNotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
} from '../services/expertApi';
import type { NotificationSettings } from '../types/expert.types';

type SettingRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
};

const SettingRow = ({ title, description, checked, onToggle }: SettingRowProps) => (
  <article className="setting-row">
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <button
      type="button"
      className={`food-switch settings-switch ${checked ? 'on' : ''}`}
      onClick={onToggle}
      aria-label={title}
    >
      <span />
    </button>
  </article>
);

export const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [savedMessage, setSavedMessage] = useState('');

  const toggle = (key: keyof NotificationSettings) => {
    setSavedMessage('');
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const setAll = (active: boolean) => {
    setSavedMessage('');
    setSettings({
      criticalAlerts: active,
      aiTrends: active,
      medicationReminders: active,
      adherenceReminders: active,
      dailyMeasurement: active,
      healthTips: active,
    });
  };

  const resetDefaults = () => {
    setSavedMessage('');
    setSettings(defaultNotificationSettings);
  };

  const handleSave = () => {
    saveNotificationSettings(settings);
    setSavedMessage('Configuración guardada');
  };

  return (
    <div className="screen settings-screen">
      <div className="page-topbar settings-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={20} />
        </button>
        <h1>Notificaciones</h1>
      </div>

      <section className="settings-hero-card">
        <p>PERSONALIZACIÓN</p>
        <h2>Configura tu tranquilidad</h2>
      </section>

      <div className="settings-tools">
        <button type="button" onClick={() => setAll(true)}>
          Activar todo
        </button>
        <button type="button" onClick={() => setAll(false)}>
          Desactivar todo
        </button>
        <button type="button" onClick={resetDefaults}>
          Restablecer
        </button>
      </div>

      <section className="settings-group">
        <h2>
          <ShieldAlert size={16} />
          Alertas de Salud
        </h2>
        <SettingRow
          title="Alertas críticas"
          description="Presión fuera de rango (Rojo/Amarillo)"
          checked={settings.criticalAlerts}
          onToggle={() => toggle('criticalAlerts')}
        />
        <SettingRow
          title="Tendencias de IA"
          description="Avisos preventivos sobre patrones detectados"
          checked={settings.aiTrends}
          onToggle={() => toggle('aiTrends')}
        />
      </section>

      <section className="settings-group">
        <h2>
          <PillBottle size={16} />
          Recordatorios de medicación
        </h2>
        <SettingRow
          title="Toma de Medicamentos"
          description="Alertas para los horarios programados"
          checked={settings.medicationReminders}
          onToggle={() => toggle('medicationReminders')}
        />
        <SettingRow
          title="Falta de Adherencia"
          description="Avisos si se olvida una toma"
          checked={settings.adherenceReminders}
          onToggle={() => toggle('adherenceReminders')}
        />
      </section>

      <section className="settings-group">
        <h2>
          <Activity size={16} />
          Recordatorios de Actividad
        </h2>
        <SettingRow
          title="Medición diaria"
          description="Recordatorio para tomarse la presion"
          checked={settings.dailyMeasurement}
          onToggle={() => toggle('dailyMeasurement')}
        />
        <SettingRow
          title="Consejos de Salud"
          description="Tips semanales y recomendaciones"
          checked={settings.healthTips}
          onToggle={() => toggle('healthTips')}
        />
      </section>

      <section className="settings-help-card">
        <div>
          <h3>¿Necesitas ayuda?</h3>
          <p>Configura alarmas personalizadas con el apoyo de tu médico de cabecera.</p>
        </div>
        <Headset size={20} />
      </section>

      <button className="primary-button settings-save-btn" type="button" onClick={handleSave}>
        <Bell size={18} />
        Guardar configuracion
      </button>

      {savedMessage ? <p className="saved-message">{savedMessage}</p> : null}
    </div>
  );
};
