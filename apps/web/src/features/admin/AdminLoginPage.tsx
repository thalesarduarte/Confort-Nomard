import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/design/components';
import { services } from '@/services';
import { useAppStore } from '@/store/appStore';
import './admin-login.css';

type RedirectState = { from?: { pathname?: string } };

export function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const adminSession = useAppStore((state) => state.adminSession);
  const [email, setEmail] = useState('admin@comfortnomad.demo');
  const [password, setPassword] = useState('NomadAdmin2026!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const redirectState = location.state as RedirectState | null;
  const nextPath = redirectState?.from?.pathname ?? '/admin';

  if (adminSession) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await services.adminAuth.login(email, password);
      navigate(nextPath, { replace: true });
    } catch {
      setError(t('admin.loginError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main id="main-content" className="container page-content admin-login-page">
      <div className="admin-login-art" aria-hidden="true">
        <div className="admin-login-orbit orbit-one" /><div className="admin-login-orbit orbit-two" />
        <span className="admin-login-sparkle">✳</span>
        <div className="admin-login-art-copy"><span>COMFORT NOMAD</span><strong>Contexto para cada chegada.</strong></div>
      </div>
      <Card className="admin-login-card">
        <p className="eyebrow">{t('admin.loginEyebrow')}</p>
        <h1>{t('admin.loginTitle')}</h1>
        <p className="admin-login-description">{t('admin.loginDescription')}</p>
        <form className="admin-login-form" onSubmit={(event) => void submit(event)}>
          <label className="field">{t('admin.emailLabel')}
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">{t('admin.passwordLabel')}
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <Button variant="primary" type="submit" disabled={busy}>{busy ? t('admin.loginLoading') : t('admin.loginAction')}<span aria-hidden="true">→</span></Button>
        </form>
        <div className="admin-login-demo" role="note">
          <strong>{t('admin.demoCredentials')}</strong>
          <span><span>{t('admin.emailLabel')}</span><code>admin@comfortnomad.demo</code></span>
          <span><span>{t('admin.passwordLabel')}</span><code>NomadAdmin2026!</code></span>
        </div>
        <p className="admin-login-safety">{t('admin.loginSafety')}</p>
        <Link className="admin-login-back" to="/">{t('admin.backToApp')}</Link>
      </Card>
    </main>
  );
}
