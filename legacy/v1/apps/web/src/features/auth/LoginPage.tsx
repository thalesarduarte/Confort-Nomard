import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper } from "@/components/layout/PageWrapper";
import styles from "./LoginPage.module.css";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate("/search");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "E-mail ou senha incorretos.";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>ðŸ§­</div>
        <h1 className={styles.title}>Entrar no Comfort Nomad</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !email || !password}
            className={styles.submitBtn}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className={styles.footer}>
          NÃ£o tem conta?{" "}
          <Link to="/onboarding" className={styles.link}>
            Criar agora
          </Link>
        </p>
      </div>
    </PageWrapper>
  );
};
