import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ShieldCheck, Trash2, UserRound, Users, User } from 'lucide-react';
import { deleteEmergencyContact, getEmergencyContact, saveEmergencyContact } from '../services/expertApi';
import type { EmergencyRelation } from '../types/expert.types';

const relationOptions: Array<{ id: EmergencyRelation; label: string; icon: 'users' | 'user' }> = [
  { id: 'hijo', label: 'Hijo', icon: 'users' },
  { id: 'hija', label: 'Hija', icon: 'users' },
  { id: 'cuidador', label: 'Cuidador', icon: 'user' },
  { id: 'otro', label: 'Otro', icon: 'user' },
];

export const EmergencyContact = () => {
  const navigate = useNavigate();
  const existing = getEmergencyContact();
  const isEditing = Boolean(existing);

  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [relation, setRelation] = useState<EmergencyRelation>(existing?.relation ?? 'hijo');
  const [phone, setPhone] = useState(existing?.phone ?? '+1 (555) 000-0000');
  const [healthAlerts, setHealthAlerts] = useState(existing?.healthAlerts ?? true);
  const [shareData, setShareData] = useState(existing?.shareData ?? true);
  const [hasPhoto, setHasPhoto] = useState(existing?.hasPhoto ?? false);
  const [savedMessage, setSavedMessage] = useState('');

  const relationText = useMemo(() => {
    if (relation === 'hijo') return 'Hijo';
    if (relation === 'hija') return 'Hija';
    if (relation === 'cuidador') return 'Cuidador';
    return 'Contacto de confianza';
  }, [relation]);

  const handleSave = () => {
    saveEmergencyContact({
      fullName,
      relation,
      phone,
      healthAlerts,
      shareData,
      hasPhoto,
    });
    setSavedMessage(isEditing ? 'Cambios guardados' : 'Contacto guardado');
  };

  const handleDelete = () => {
    deleteEmergencyContact();
    setFullName('');
    setRelation('hijo');
    setPhone('+1 (555) 000-0000');
    setHealthAlerts(true);
    setShareData(true);
    setHasPhoto(false);
    setSavedMessage('Contacto eliminado');
  };

  return (
    <div className="screen emergency-screen">
      <div className="page-topbar emergency-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={20} />
        </button>
        <h1>{isEditing ? 'Editar contacto' : 'Añadir contacto'}</h1>
      </div>

      {isEditing ? (
        <section className="contact-summary-card">
          <div className="contact-avatar">
            <UserRound size={34} />
            <button type="button" onClick={() => setHasPhoto((current) => !current)}>
              <Camera size={13} />
            </button>
          </div>
          <h2>{fullName || 'Nombre del contacto'}</h2>
          <p>
            {relationText} {fullName ? '• Contacto de confianza' : ''}
          </p>
        </section>
      ) : null}

      <section className="emergency-form-card">
        <h2>{isEditing ? 'Editar contacto de emergencia' : 'Contacto de emergencia'}</h2>
        <p>Añade a alguien a quien se pueda contactar en caso de alertas o emergencias sanitarias.</p>

        <label className="medication-label">
          NOMBRE COMPLETO
          <input
            className="emergency-input"
            type="text"
            placeholder="Ej. Ana Pérez"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>

        <div className="frequency-section emergency-relation">
          <span>RELACIÓN</span>
          <div className="relation-grid">
            {relationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`relation-card ${relation === option.id ? 'active' : ''}`}
                onClick={() => setRelation(option.id)}
              >
                {option.icon === 'users' ? <Users size={16} /> : <User size={16} />}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="medication-label">
          NÚMERO DE TELÉFONO
          <input
            className="emergency-input"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        {!isEditing ? (
          <button type="button" className="photo-card" onClick={() => setHasPhoto((current) => !current)}>
            <div className="photo-avatar">{hasPhoto ? <UserRound size={22} /> : <Camera size={18} />}</div>
            <div>
              <strong>Añade una foto</strong>
              <p>Ayuda a identificar contactos rápidamente durante emergencias.</p>
            </div>
          </button>
        ) : null}

        <section className="alerts-card">
          <div className="alerts-header">
            <div>
              <h3>{isEditing ? 'Alertas de salud' : 'Alertas de salud'}</h3>
              <p>
                {isEditing
                  ? 'Notificar automáticamente a este contacto si tus lecturas de presión arterial están fuera de los niveles seguros.'
                  : 'Notificar automáticamente a este contacto si sus lecturas de presión arterial están fuera de los niveles seguros.'}
              </p>
            </div>
            <button
              type="button"
              className={`food-switch ${healthAlerts ? 'on' : ''}`}
              onClick={() => setHealthAlerts((current) => !current)}
              aria-label="Activar alertas de salud"
            >
              <span />
            </button>
          </div>

          <button
            type="button"
            className={`hipaa-card ${shareData ? 'active' : ''}`}
            onClick={() => setShareData((current) => !current)}
          >
            <ShieldCheck size={16} />
            Compartir datos conforme a la HIPPA
          </button>
        </section>

        <button className="primary-button emergency-save-btn" type="button" onClick={handleSave}>
          {isEditing ? 'Guardar Cambios' : 'Guardar Contacto'}
        </button>

        {isEditing ? (
          <button type="button" className="delete-contact-btn" onClick={handleDelete}>
            <Trash2 size={14} />
            Eliminar Contacto
          </button>
        ) : null}

        {savedMessage ? <p className="saved-message">{savedMessage}</p> : null}
      </section>
    </div>
  );
};
