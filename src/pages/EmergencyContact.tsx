import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ShieldCheck, Trash2, UserRound, Users, User } from 'lucide-react';
import {
  deleteEmergencyContact,
  getEmergencyContact,
  readImageFileAsDataUrl,
  saveEmergencyContact,
} from '../services/expertApi';
import type { EmergencyRelation } from '../types/expert.types';

const relationOptions: Array<{ id: EmergencyRelation; label: string; icon: 'users' | 'user' }> = [
  { id: 'hijo', label: 'Hijo', icon: 'users' },
  { id: 'hija', label: 'Hija', icon: 'users' },
  { id: 'cuidador', label: 'Cuidador', icon: 'user' },
  { id: 'otro', label: 'Otro', icon: 'user' },
];

export const EmergencyContact = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const existing = getEmergencyContact();
  const isEditing = Boolean(existing);

  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [relation, setRelation] = useState<EmergencyRelation>(existing?.relation ?? 'hijo');
  const [phone, setPhone] = useState(existing?.phone ?? '+1 (555) 000-0000');
  const [healthAlerts, setHealthAlerts] = useState(existing?.healthAlerts ?? true);
  const [shareData, setShareData] = useState(existing?.shareData ?? true);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(existing?.photoDataUrl ?? null);
  const [fileError, setFileError] = useState('');

  const relationText = useMemo(() => {
    if (relation === 'hijo') return 'Hijo';
    if (relation === 'hija') return 'Hija';
    if (relation === 'cuidador') return 'Cuidador';
    return 'Contacto de confianza';
  }, [relation]);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFileError('');
    try {
      const url = await readImageFileAsDataUrl(file);
      setPhotoDataUrl(url);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : 'No se pudo cargar la imagen.');
    }
  };

  const handleSave = () => {
    const cleanName = fullName.trim() || 'Contacto de emergencia';

    saveEmergencyContact({
      fullName: cleanName,
      relation,
      phone,
      healthAlerts,
      shareData,
      hasPhoto: Boolean(photoDataUrl),
      photoDataUrl,
    });

    navigate(isEditing ? '/confirmacion/contacto-actualizado' : '/confirmacion/contacto-guardado', {
      state: {
        fullName: cleanName,
        relation: relationText,
        phone,
      },
    });
  };

  const handleDelete = () => {
    const deletedName = fullName.trim() || 'Contacto de emergencia';
    deleteEmergencyContact();
    setFullName('');
    setRelation('hijo');
    setPhone('+1 (555) 000-0000');
    setHealthAlerts(true);
    setShareData(true);
    setPhotoDataUrl(null);

    navigate('/confirmacion/contacto-eliminado', {
      state: {
        fullName: deletedName,
      },
    });
  };

  const openFilePicker = () => fileRef.current?.click();

  return (
    <div className="screen emergency-screen">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="profile-file-input"
        onChange={handlePhotoChange}
      />

      <div className="page-topbar emergency-topbar">
        <button type="button" onClick={() => navigate(-1)} className="icon-button">
          <ArrowLeft size={20} />
        </button>
        <h1>{isEditing ? 'Editar contacto' : 'Añadir contacto'}</h1>
      </div>

      {isEditing ? (
        <section className="contact-summary-card">
          <div className="contact-avatar">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="" className="contact-avatar-img" />
            ) : (
              <UserRound size={34} />
            )}
            <button type="button" onClick={openFilePicker} aria-label="Cambiar foto del contacto">
              <Camera size={13} />
            </button>
          </div>
          <h2>{fullName || 'Nombre del contacto'}</h2>
          <p>
            {relationText} {fullName ? '• Contacto de confianza' : ''}
          </p>
          <div className="contact-photo-actions">
            <button type="button" className="secondary-link-btn" onClick={openFilePicker}>
              Elegir foto desde archivos
            </button>
            {photoDataUrl ? (
              <button type="button" className="secondary-link-btn muted" onClick={() => setPhotoDataUrl(null)}>
                Quitar foto
              </button>
            ) : null}
          </div>
          {fileError ? <p className="profile-file-error">{fileError}</p> : null}
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
          <button type="button" className="photo-card" onClick={openFilePicker}>
            <div className="photo-avatar">
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="" className="photo-avatar-img" />
              ) : (
                <Camera size={18} />
              )}
            </div>
            <div>
              <strong>{photoDataUrl ? 'Cambiar foto' : 'Añade una foto'}</strong>
              <p>Ayuda a identificar al contacto rápidamente durante emergencias.</p>
            </div>
          </button>
        ) : null}

        {!isEditing && fileError ? <p className="profile-file-error">{fileError}</p> : null}

        {!isEditing && photoDataUrl ? (
          <div className="contact-photo-actions new-contact-photo-actions">
            <button type="button" className="secondary-link-btn muted" onClick={() => setPhotoDataUrl(null)}>
              Quitar foto
            </button>
          </div>
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
      </section>
    </div>
  );
};
