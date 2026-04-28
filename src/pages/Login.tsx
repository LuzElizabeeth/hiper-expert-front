import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ email, password });

      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'No se pudo iniciar sesión. Verifica tus datos.'
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
            <span>Control Cardiovascular</span>
          </div>
        </div>

        <div className="auth-header">
          <h1>Iniciar sesión</h1>
          <p>Accede a tu cuenta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

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
              placeholder="********"
              required
            />
          </div>

          <button disabled={loading} className="auth-submit">
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
}