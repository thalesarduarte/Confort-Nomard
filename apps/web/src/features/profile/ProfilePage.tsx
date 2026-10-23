import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { UserPreferenceProfile } from "@/types";
import styles from "./ProfilePage.module.css";

const FOOD_OPTIONS = [
  { id: "rice_beans", label: "Arroz & Feijao", emoji: "ðŸš" },
  { id: "pasta", label: "Massas", emoji: "ðŸ" },
  { id: "bread", label: "Pao Fresco", emoji: "ðŸž" },
  { id: "sushi", label: "Sushi", emoji: "ðŸ£" },
  { id: "tacos", label: "Tacos", emoji: "ðŸŒ®" },
  { id: "curry", label: "Curry", emoji: "ðŸ›" },
  { id: "pizza", label: "Pizza", emoji: "ðŸ•" },
  { id: "arabic", label: "Culinaria Arabe", emoji: "ðŸ¥™" },
  { id: "chinese", label: "Comida Chinesa", emoji: "ðŸ¥¡" },
  { id: "vegan", label: "Vegano", emoji: "ðŸ¥—" },
];

const PRIORITY_PILLARS = [
  { id: "climate", label: "Clima", emoji: "ðŸŒ¡" },
  { id: "budget", label: "Custo de Vida", emoji: "ðŸ’°" },
  { id: "food", label: "Comida", emoji: "ðŸ½" },
  { id: "culture", label: "Cultura", emoji: "ðŸŒ" },
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, tempProfile, isLoggedIn } = useUserStore();

  const currentProfile = profile ?? tempProfile ?? {};

  const [name, setName] = useState(user?.name ?? "");
  const [prefs, setPrefs] = useState<Partial<UserPreferenceProfile>>({
    thermalSensitivity: currentProfile.thermalSensitivity ?? "TOLERANT",
    comfortFoods: currentProfile.comfortFoods ?? [],
    budgetMonthlyUsd: currentProfile.budgetMonthlyUsd ?? 2000,
    travelPurpose: currentProfile.travelPurpose ?? "DIGITAL_NOMAD",
    culturalOpenness: currentProfile.culturalOpenness ?? 7,
    priorityRanking: currentProfile.priorityRanking ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleFood = (id: string) => {
    const foods = prefs.comfortFoods ?? [];
    setPrefs((p) => ({
      ...p,
      comfortFoods: foods.includes(id) ? foods.filter((f) => f !== id) : [...foods, id],
    }));
  };

  const togglePriority = (id: string) => {
    const ranking = prefs.priorityRanking ?? [];
    if (ranking.includes(id)) {
      setPrefs((p) => ({ ...p, priorityRanking: ranking.filter((r) => r !== id) }));
    } else if (ranking.length < 4) {
      setPrefs((p) => ({ ...p, priorityRanking: [...ranking, id] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (isLoggedIn) {
        if (name !== user?.name) await authService.updateUser({ name });
        await authService.updateProfile(prefs as UserPreferenceProfile);
      } else {
        useUserStore.getState().setTempProfile(prefs);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Excluir sua conta de demonstração deste dispositivo?')) return;
    await authService.deleteAccount();
    navigate('/');
  };

  return (
    <PageWrapper className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Meu Perfil</h1>
          {isLoggedIn && (
            <div style={{display:'flex',gap:8}}>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
              <Button variant="ghost" size="sm" onClick={handleDeleteAccount}>Excluir conta</Button>
            </div>
          )}
        </div>

        {!isLoggedIn && tempProfile && (
          <Card className={styles.anonBanner}>
            <p>
              ðŸ” Voce esta usando o app sem conta â€” suas preferencias ficam salvas so neste dispositivo.{" "}
              <a href="/onboarding" className={styles.link}>
                Criar conta
              </a>{" "}
              para sincronizar entre dispositivos.
            </p>
          </Card>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados pessoais</h2>
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como gosta de ser chamado?"
          />
          {isLoggedIn && (
            <Input
              label="E-mail"
              value={user?.email ?? ""}
              disabled
              placeholder=""
            />
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Clima</h2>
          <div className={styles.grid2}>
            {[
              { id: "HEAT_LOVER", icon: "ðŸŒž", label: "Amo calor" },
              { id: "TOLERANT", icon: "ðŸŒ¤", label: "Me adapto bem" },
              { id: "SENSITIVE", icon: "ðŸŒ¡", label: "Sou sensivel a extremos" },
              { id: "COLD_LOVER", icon: "â„ï¸", label: "Prefiro frio" },
            ].map((opt) => (
              <Card
                key={opt.id}
                className={`${styles.selectCard} ${prefs.thermalSensitivity === opt.id ? styles.selected : ""}`}
                onClick={() => setPrefs((p) => ({ ...p, thermalSensitivity: opt.id as any }))}
                glow
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Comfort Foods</h2>
          <div className={styles.foodGrid}>
            {FOOD_OPTIONS.map((f) => (
              <Card
                key={f.id}
                className={`${styles.foodCard} ${(prefs.comfortFoods ?? []).includes(f.id) ? styles.selected : ""}`}
                onClick={() => toggleFood(f.id)}
                glass
              >
                <span>{f.emoji}</span>
                <span>{f.label}</span>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Orcamento mensal</h2>
          <div className={styles.budgetRow}>
            <span className={styles.budgetValue}>${prefs.budgetMonthlyUsd ?? 2000}/mes</span>
          </div>
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={prefs.budgetMonthlyUsd ?? 2000}
            onChange={(e) => setPrefs((p) => ({ ...p, budgetMonthlyUsd: parseInt(e.target.value) }))}
            className={styles.slider}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Abertura cultural</h2>
          <p className={styles.hint}>Escala de 1 (preciso de familiaridade) a 10 (adoro choque cultural)</p>
          <div className={styles.sliderRow}>
            <input
              type="range"
              min="1"
              max="10"
              value={prefs.culturalOpenness ?? 7}
              onChange={(e) => setPrefs((p) => ({ ...p, culturalOpenness: parseInt(e.target.value) }))}
              className={styles.slider}
            />
            <span className={styles.sliderVal}>{prefs.culturalOpenness ?? 7}</span>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Prioridade entre os pilares</h2>
          <p className={styles.hint}>Clique em ordem de importancia (1 = mais importante)</p>
          <div className={styles.priorityGrid}>
            {PRIORITY_PILLARS.map((p) => {
              const ranking = prefs.priorityRanking ?? [];
              const pos = ranking.indexOf(p.id);
              return (
                <Card
                  key={p.id}
                  className={`${styles.priorityCard} ${pos >= 0 ? styles.selected : ""}`}
                  onClick={() => togglePriority(p.id)}
                  glow
                >
                  <span className={styles.priorityEmoji}>{p.emoji}</span>
                  <span>{p.label}</span>
                  {pos >= 0 && <span className={styles.priorityBadge}>{pos + 1}</span>}
                </Card>
              );
            })}
          </div>
        </section>

        <div className={styles.actions}>
          {saved && <span className={styles.savedMsg}>âœ… Salvo com sucesso!</span>}
          <Button variant="primary" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar preferencias"}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};
