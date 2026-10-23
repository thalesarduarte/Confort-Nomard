import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/useUserStore";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Spinner } from "@/components/ui/Spinner";
import { aiService, ChatMessage, OnboardingAiResponse } from "@/services/ai.service";
import styles from "./OnboardingPage.module.css";

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

// Total steps: 1-5 (form), 5.5 -> step 6 (priority), 6 -> step 7 (AI chat), 7 -> step 8 (optional account)
const TOTAL_STEPS = 8;

export const OnboardingPage: React.FC = () => {
  useTranslation(); // keep for future i18n use
  const navigate = useNavigate();
  const { setProfile, setTempProfile } = useUserStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    thermalSensitivity: "TOLERANT" as any,
    comfortFoods: [] as string[],
    budgetMonthlyUsd: 2000,
    travelPurpose: "DIGITAL_NOMAD" as any,
    languages: ["EN"],
    culturalOpenness: 7,
    priorityRanking: [] as string[],
  });

  // Step 7 (AI chat) state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [lastResponse, setLastResponse] = useState<OnboardingAiResponse | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const step7Initialized = useRef(false);

  // Step 8 (optional account) state
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleFood = (id: string) => {
    const current = formData.comfortFoods;
    if (current.includes(id)) {
      updateForm({ comfortFoods: current.filter((f) => f !== id) });
    } else {
      updateForm({ comfortFoods: [...current, id] });
    }
  };

  const togglePriority = (id: string) => {
    const ranking = formData.priorityRanking;
    if (ranking.includes(id)) {
      updateForm({ priorityRanking: ranking.filter((r) => r !== id) });
    } else if (ranking.length < 4) {
      updateForm({ priorityRanking: [...ranking, id] });
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  // Finish flow anonymously
  const handleFinish = () => {
    setTempProfile(formData as any);
    navigate("/search");
  };

  // Create account at the end
  const handleCreateAccount = async () => {
    if (!accountEmail || !accountPassword) return;
    setAccountError(null);
    setAccountLoading(true);
    try {
      await authService.register({
        name: accountName || formData.name,
        email: accountEmail,
        password: accountPassword,
      });
      // Save preferences to backend
      await authService.updateProfile(formData as any);
      setProfile(formData as any);
      navigate("/search");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Erro ao criar conta. Tente novamente.";
      setAccountError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setAccountLoading(false);
    }
  };

  // AI Chat logic
  const profileSoFar = {
    thermalSensitivity: formData.thermalSensitivity,
    comfortFoods: formData.comfortFoods,
    budgetMonthlyUsd: formData.budgetMonthlyUsd,
    travelPurpose: formData.travelPurpose,
    culturalOpenness: formData.culturalOpenness,
    priorityRanking: formData.priorityRanking,
  };

  const sendAiMessage = async (history: ChatMessage[]) => {
    setAiLoading(true);
    try {
      const response = await aiService.continueOnboarding(history, profileSoFar, "pt-BR");
      setLastResponse(response);
      const assistantMsg: ChatMessage = { role: "assistant", content: response.message };
      setChatHistory((prev) => [...prev, assistantMsg]);

      if (response.done) {
        setAiDone(true);
        // Merge extracted comfortFoods
        const extractedFoods = (response.extractedPreferences.comfortFoods ?? [])
          .map((f: string) => f.toLowerCase())
          .filter((f: string) => FOOD_OPTIONS.some((opt) => opt.id === f));
        const merged = Array.from(new Set([...formData.comfortFoods, ...extractedFoods]));

        // Merge priorityRanking if AI extracted one
        const extractedRanking = response.extractedPreferences.priorityRanking ?? [];
        const finalRanking = formData.priorityRanking.length > 0 ? formData.priorityRanking : extractedRanking;

        updateForm({ comfortFoods: merged, priorityRanking: finalRanking });

        // Save freeform tags and AI notes
        setTempProfile({
          freeformTags: response.extractedPreferences.freeformTags,
          aiNotes: response.extractedPreferences.notes,
          workStyle: response.extractedPreferences.workStyle as any,
          pacePreference: response.extractedPreferences.pacePreference as any,
        } as any);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Ops! Nao consegui processar sua resposta. Tente novamente ou pule esta etapa." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-start step 7 (AI chat)
  useEffect(() => {
    if (step === 7 && !step7Initialized.current) {
      step7Initialized.current = true;
      sendAiMessage([]);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Pre-fill account name/email from form
  useEffect(() => {
    if (step === 8) {
      if (formData.name) setAccountName(formData.name);
      if (formData.email) setAccountEmail(formData.email);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || aiLoading || aiDone) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput("");
    await sendAiMessage(newHistory);
  };

  return (
    <PageWrapper className={styles.wrapper}>
      <div className={styles.progressContainer}>
        <ProgressBar value={progress} className={styles.progressBar} />
      </div>

      <div className={styles.container}>
        {/* Step 1 â€” Intro */}
        {step === 1 && (
          <div className={`${styles.step} animate-slide-up`}>
            <div className={styles.heroArt}>ðŸŒ</div>
            <h1 className={styles.title}>Ola! Vamos criar seu perfil de nomade</h1>
            <p className={styles.subtitle}>Personalize suas recomendacoes baseadas no que realmente importa para voce.</p>
            <div className={styles.formGroup}>
              <Input label="Seu Nome" placeholder="Como gosta de ser chamado?" value={formData.name} onChange={(e) => updateForm({ name: e.target.value })} />
              <Input label="E-mail (opcional)" placeholder="Para salvar seu perfil" type="email" value={formData.email} onChange={(e) => updateForm({ email: e.target.value })} />
            </div>
          </div>
        )}

        {/* Step 2 â€” Clima */}
        {step === 2 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>Como voce se relaciona com o clima?</h1>
            <div className={styles.grid2x2}>
              {[
                { id: "HEAT_LOVER", icon: "ðŸŒž", label: "Amo calor" },
                { id: "TOLERANT", icon: "ðŸŒ¤", label: "Me adapto bem" },
                { id: "SENSITIVE", icon: "ðŸŒ¡", label: "Sou sensivel a extremos" },
                { id: "COLD_LOVER", icon: "â„ï¸", label: "Prefiro frio" },
              ].map((opt) => (
                <Card key={opt.id} className={`${styles.selectCard} ${formData.thermalSensitivity === opt.id ? styles.selected : ""}`} onClick={() => updateForm({ thermalSensitivity: opt.id as any })} glow>
                  <span className={styles.cardIcon}>{opt.icon}</span>
                  <span className={styles.cardLabel}>{opt.label}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 â€” Comida */}
        {step === 3 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>Quais pratos voce nao consegue viver sem?</h1>
            <div className={styles.foodGrid}>
              {FOOD_OPTIONS.map((food) => (
                <Card key={food.id} className={`${styles.foodCard} ${formData.comfortFoods.includes(food.id) ? styles.selected : ""}`} onClick={() => toggleFood(food.id)} glass>
                  <span className={styles.foodEmoji}>{food.emoji}</span>
                  <span className={styles.foodLabel}>{food.label}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 â€” Budget */}
        {step === 4 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>Qual e o seu orcamento mensal estimado?</h1>
            <div className={styles.budgetDisplay}>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>{formData.budgetMonthlyUsd}</span>
              <span className={styles.period}>/mes (USD)</span>
            </div>
            <input type="range" min="500" max="10000" step="100" value={formData.budgetMonthlyUsd} onChange={(e) => updateForm({ budgetMonthlyUsd: parseInt(e.target.value) })} className={styles.slider} />
            <h3 className={styles.sectionTitle}>Motivo da viagem</h3>
            <div className={styles.purposeGrid}>
              {[
                { id: "DIGITAL_NOMAD", icon: "ðŸ’»", label: "Nomade Digital" },
                { id: "EXPAT", icon: "ðŸ“¦", label: "Expatriado" },
                { id: "STUDENT", icon: "ðŸŽ“", label: "Estudante" },
                { id: "TOURIST", icon: "ðŸ“¸", label: "Turista" },
              ].map((opt) => (
                <div key={opt.id} className={`${styles.purposeChip} ${formData.travelPurpose === opt.id ? styles.selectedChip : ""}`} onClick={() => updateForm({ travelPurpose: opt.id as any })}>
                  {opt.icon} {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 â€” Cultura */}
        {step === 5 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>Idiomas & Cultura</h1>
            <h3 className={styles.sectionTitle}>Nivel de abertura cultural (1-10)</h3>
            <p className={styles.hintText}>O quanto voce esta disposto a se adaptar a costumes muito diferentes dos seus?</p>
            <div className={styles.sliderWrapper}>
              <input type="range" min="1" max="10" value={formData.culturalOpenness} onChange={(e) => updateForm({ culturalOpenness: parseInt(e.target.value) })} className={styles.slider} />
              <div className={styles.sliderLabels}>
                <span>Preciso de conforto e familiaridade</span>
                <span className={styles.sliderValue}>{formData.culturalOpenness}</span>
                <span>Amo choque cultural!</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 6 â€” Prioridade entre pilares */}
        {step === 6 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>ðŸŽ¯ Qual e a sua prioridade?</h1>
            <p className={styles.subtitle}>Quando ha um trade-off, o que pesa mais para voce? Clique em ordem de importancia (1 = mais importante).</p>
            <div className={styles.priorityGrid}>
              {PRIORITY_PILLARS.map((pillar) => {
                const pos = formData.priorityRanking.indexOf(pillar.id);
                return (
                  <Card key={pillar.id} className={`${styles.priorityCard} ${pos >= 0 ? styles.selected : ""}`} onClick={() => togglePriority(pillar.id)} glow>
                    <span className={styles.priorityEmoji}>{pillar.emoji}</span>
                    <span className={styles.cardLabel}>{pillar.label}</span>
                    {pos >= 0 && <span className={styles.priorityBadge}>{pos + 1}</span>}
                  </Card>
                );
              })}
            </div>
            {formData.priorityRanking.length > 0 && (
              <p className={styles.hintText}>
                Ordem: {formData.priorityRanking.map((id) => PRIORITY_PILLARS.find((p) => p.id === id)?.label).join(" > ")}
              </p>
            )}
          </div>
        )}

        {/* Step 7 â€” AI Chat */}
        {step === 7 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>âœ¨ Refinamento com IA</h1>
            <p className={styles.subtitle}>Deixe nosso assistente te fazer algumas perguntas rapidas para personalizar ainda mais suas recomendacoes.</p>
            <div className={styles.chatArea}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`${styles.bubble} ${msg.role === "assistant" ? styles.bubbleAssistant : styles.bubbleUser}`}>
                  {msg.content}
                </div>
              ))}
              {aiLoading && (
                <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                  <Spinner size="sm" />
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
            {!aiDone && !aiLoading && lastResponse && lastResponse.quickReplies.length > 0 && (
              <div className={styles.quickReplies}>
                {lastResponse.quickReplies.map((reply, idx) => (
                  <button key={idx} className={styles.quickReply} onClick={() => handleSendMessage(reply)}>
                    {reply}
                  </button>
                ))}
              </div>
            )}
            {!aiDone && (
              <div className={styles.chatInputRow}>
                <input
                  className={styles.chatInput}
                  placeholder="Digite sua resposta..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(chatInput)}
                  disabled={aiLoading}
                />
                <Button variant="primary" size="sm" onClick={() => handleSendMessage(chatInput)} disabled={aiLoading || !chatInput.trim()}>
                  Enviar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 8 â€” Optional account creation */}
        {step === 8 && (
          <div className={`${styles.step} animate-slide-up`}>
            <div className={styles.heroArt}>ðŸ’¾</div>
            <h1 className={styles.title}>Quer salvar seu perfil?</h1>
            <p className={styles.subtitle}>Crie uma conta gratuita para acessar suas preferencias em qualquer dispositivo. Voce pode pular agora e criar depois.</p>
            <div className={styles.formGroup}>
              <Input label="Nome" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Seu nome" />
              <Input label="E-mail" type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="seu@email.com" />
              <Input label="Senha" type="password" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} placeholder="Minimo 6 caracteres" />
            </div>
            {accountError && <p className={styles.errorMsg}>{accountError}</p>}
            <div className={styles.accountActions}>
              <Button variant="primary" size="lg" onClick={handleCreateAccount} disabled={accountLoading || !accountEmail || !accountPassword}>
                {accountLoading ? "Criando conta..." : "Criar conta e explorar"}
              </Button>
              <Button variant="ghost" size="lg" onClick={handleFinish}>
                Agora nao, continuar sem conta
              </Button>
            </div>
          </div>
        )}

        {/* Footer navigation */}
        <div className={styles.footer}>
          {step > 1 && step < 7 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Voltar
            </Button>
          ) : step === 7 ? (
            <Button variant="ghost" onClick={() => setStep(8)}>
              Pular esta etapa
            </Button>
          ) : step === 8 ? (
            <div />
          ) : (
            <div />
          )}

          {step < 6 && (
            <Button variant="primary" size="lg" onClick={() => setStep((s) => s + 1)}>
              Proximo
            </Button>
          )}
          {step === 6 && (
            <Button variant="primary" size="lg" onClick={() => setStep(7)} disabled={formData.priorityRanking.length === 0}>
              {formData.priorityRanking.length === 0 ? "Selecione ao menos 1" : "Proximo"}
            </Button>
          )}
          {step === 7 && aiDone && (
            <Button variant="primary" size="lg" onClick={() => setStep(8)}>
              Continuar
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
