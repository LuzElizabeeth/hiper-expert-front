import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth.api';

export function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register({
        full_name: fullName,
        email,
        password,
      });

      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo crear la cuenta. Verifica los datos.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">❤</div>

          <div className="auth-brand-text">
            <strong>CardioApp</strong>
            <span>Control cardiovascular</span>
          </div>
        </div>

        <div className="auth-header">
          <h1>Crear cuenta</h1>
          <p>Registra tus datos para comenzar.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Nombre completo</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Usuario de Prueba"
              required
            />
          </div>

          <div className="auth-field">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@test.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <button disabled={loading} className="auth-submit">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}