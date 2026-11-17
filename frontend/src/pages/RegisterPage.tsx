import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.login, form.password, form.username);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
      const msg = Array.isArray(data?.message) ? data!.message.join(', ') : data?.message;
      setError(msg ?? 'Не удалось зарегистрироваться.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Регистрация</h1>
        <label>
          Логин
          <input
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Отображаемое имя
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Создаём…' : 'Зарегистрироваться'}
        </button>
        <p className="hint">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
