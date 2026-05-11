import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { HealthCard } from '../components/HealthCard';
import {
  getPressureHistory,
  getUserProfile,
  readImageFileAsDataUrl,
  saveUserProfile,
} from '../services/expertApi';
import type { UserSex } from '../types/expert.types';

const sexOptions: Array<{ id: UserSex; label: string }> = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'femenino', label: 'Femenino' },
  { id: 'otro', label: 'Otro' },
  { id: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

const parseOptionalNumber = (raw: string): number | null => {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number.parseFloat(t.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const ConfigurationProfile = () => {
  const navigate = useNavigate();
  const initial = getUserProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [phone, setPhone] = useState(initial.phone);
  const [age, setAge] = useState(initial.age != null ? String(initial.age) : '');
  const [sex, setSex] = useState<UserSex>(initial.sex);
  const [weightKg, setWeightKg] = useState(
    initial.weightKg != null ? String(initial.weightKg) : ''
  );
  const [heightCm, setHeightCm] = useState(
    initial.heightCm != null ? String(initial.heightCm) : ''
  );
  const [hasHypertension, setHasHypertension] = useState(initial.hasHypertension);
  const [hasDiabetes, setHasDiabetes] = useState(initial.hasDiabetes);
  const [smoker, setSmoker] = useState(initial.smoker);
  const [notes, setNotes] = useState(initial.notes);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(initial.photoDataUrl);
  const [fileError, setFileError] = useState('');

  const history = getPressureHistory();
  const lastPressure = history[0];

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
    const ageNum = parseOptionalNumber(age);
    const normalizedAge = ageNum !== null ? Math.max(0, Math.floor(ageNum)) : null;
    const cleanName = displayName.trim() || 'Usuario';
    const conditions = [
      hasHypertension ? 'Hipertensión' : '',
      hasDiabetes ? 'Diabetes' : '',
      smoker ? 'Fumador/a' : '',
    ].filter(Boolean).join(' · ') || 'Sin condiciones marcadas';

    saveUserProfile({
      displayName: cleanName,
      phone: phone.trim(),
      age: normalizedAge,
      sex,
      weightKg: parseOptionalNumber(weightKg),
      heightCm: parseOptionalNumber(heightCm),
      hasHypertension,
      hasDiabetes,
      smoker,
      notes: notes.trim(),
      photoDataUrl,
    });

    navigate('/confirmacion/perfil-guardado', {
      state: {
        displayName: cleanName,
        phone: phone.trim() || 'Sin teléfono',
        age: normalizedAge ?? 'Edad no registrada',
        conditions,
      },
    });
  };

  const subtitleParts: string[] = [];
  if (age.trim()) subtitleParts.push(`${age.trim()} años`);
  if (hasHypertension) subtitleParts.push('Hipertensión');
  if (hasDiabetes) subtitleParts.push('Diabetes');
  if (subtitleParts.length === 0) subtitleParts.push('Paciente');

  return (
    <div className="screen profile-edit-screen">
      <div className="page-topbar profile-edit-topbar">
        <Link to="/configuracion" className="icon-button" aria-label="Volver a configuracion">
          <ArrowLeft size={22} />
        </Link>
        <h1>Mi perfil</h1>
      </div>

      <p className="profile-edit-intro">
        Foto e información personal se guardan en este dispositivo. Úselo para identificación y
        contexto clínico básico.
      </p>

      <div className="profile-edit-photo-block">
        <div className="profile-edit-avatar-wrap">
          {photoDataUrl ? (
            <img src={photoDataUrl} alt="" className="profile-edit-avatar-img" />
          ) : (
            <div className="profile-edit-avatar-placeholder">
              <UserRound size={48} strokeWidth={1.75} />
            </div>
          )}
          <button
            type="button"
            className="profile-edit-camera-btn"
            onClick={() => fileRef.current?.click()}
            aria-label="Elegir foto de perfil"
          >
            <Camera size={18} />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="profile-file-input"
          onChange={handlePhotoChange}
        />
        <div className="profile-edit-photo-actions">
          <button type="button" className="secondary-link-btn" onClick={() => fileRef.current?.click()}>
            Elegir foto desde archivos
          </button>
          {photoDataUrl ? (
            <button type="button" className="secondary-link-btn muted" onClick={() => setPhotoDataUrl(null)}>
              Quitar foto
            </button>
          ) : null}
        </div>
        {fileError ? <p className="profile-file-error">{fileError}</p> : null}
      </div>

      <section className="profile-card profile-edit-summary">
        <h2 className="profile-edit-name-preview">{displayName.trim() || 'Su nombre'}</h2>
        <p>{subtitleParts.join(' · ')}</p>
        {lastPressure ? (
          <div className="profile-stats">
            <div>
              <span>Última presión</span>
              <strong>
                {lastPressure.systolic}/{lastPressure.diastolic}
              </strong>
            </div>
            <div>
              <span>Pulso</span>
              <strong>{lastPressure.pulse} lpm</strong>
            </div>
          </div>
        ) : (
          <p className="profile-edit-hint">Registre una medición en Inicio para verla aquí.</p>
        )}
      </section>

      <section className="emergency-form-card profile-edit-form">
        <h2>Datos personales</h2>

        <label className="medication-label">
          NOMBRE COMPLETO
          <input
            className="emergency-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ej. María López"
            autoComplete="name"
          />
        </label>

        <label className="medication-label">
          TELÉFONO
          <input
            className="emergency-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34 600 000 000"
            autoComplete="tel"
          />
        </label>

        <div className="profile-edit-row">
          <label className="medication-label">
            EDAD (AÑOS)
            <input
              className="emergency-input"
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ej. 72"
            />
          </label>
          <label className="medication-label">
            SEXO
            <select
              className="emergency-input profile-edit-select"
              value={sex}
              onChange={(e) => setSex(e.target.value as UserSex)}
            >
              {sexOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="profile-edit-row">
          <label className="medication-label">
            PESO (KG)
            <input
              className="emergency-input"
              type="text"
              inputMode="decimal"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Opcional"
            />
          </label>
          <label className="medication-label">
            ESTATURA (CM)
            <input
              className="emergency-input"
              type="text"
              inputMode="decimal"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>

        <fieldset className="profile-edit-fieldset">
          <legend>Condiciones relevantes</legend>
          <label className="profile-check-row">
            <input
              type="checkbox"
              checked={hasHypertension}
              onChange={(e) => setHasHypertension(e.target.checked)}
            />
            Hipertensión arterial
          </label>
          <label className="profile-check-row">
            <input
              type="checkbox"
              checked={hasDiabetes}
              onChange={(e) => setHasDiabetes(e.target.checked)}
            />
            Diabetes
          </label>
          <label className="profile-check-row">
            <input type="checkbox" checked={smoker} onChange={(e) => setSmoker(e.target.checked)} />
            Fumador/a
          </label>
        </fieldset>

        <label className="medication-label">
          NOTAS (ALERGIAS, TRATAMIENTO, ETC.)
          <textarea
            className="emergency-input profile-edit-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Información que quiera tener a mano en la app..."
          />
        </label>

        <button className="primary-button emergency-save-btn" type="button" onClick={handleSave}>
          Guardar perfil
        </button>
      </section>

      <HealthCard className="success-card">
        <ShieldCheck size={24} />
        <div>
          <h3>Privacidad</h3>
          <p>
            Los datos y fotos se almacenan solo en este navegador. No se envían a ningún servidor en
            esta versión de demostración.
          </p>
        </div>
      </HealthCard>

      <button type="button" className="logout-button">
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  );
};
