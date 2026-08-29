import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/store/useUserStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Spinner } from '@/components/ui/Spinner';
import { aiService, ChatMessage, OnboardingAiResponse } from '@/services/ai.service';
import styles from './OnboardingPage.module.css';

const FOOD_OPTIONS = [
  { id: 'rice_beans', label: 'Arroz & Feijão', emoji: '🍚' },
  { id: 'pasta', label: 'Massas', emoji: '🍝' },
  { id: 'bread', label: 'Pão Fresco', emoji: '🍞' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'curry', label: 'Curry', emoji: '🍛' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'arabic', label: 'Culinária Árabe', emoji: '🥙' },
  { id: 'chinese', label: 'Comida Chinesa', emoji: '🥡' },
  { id: 'vegan', label: 'Vegano', emoji: '🥗' },
];

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setProfile, setTempProfile } = useUserStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    thermalSensitivity: 'TOLERANT' as any,
    comfortFoods: [] as string[],
    budgetMonthlyUsd: 2000,
    travelPurpose: 'DIGITAL_NOMAD' as any,
    languages: ['EN'],
    culturalOpenness: 7,
  });

  // ─── Step 6 chat state ────────────────────────────────────────────────────────
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [lastResponse, setLastResponse] = useState<OnboardingAiResponse | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const step6Initialized = useRef(false);

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < 6) setStep(s => s + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    setProfile(formData as any);
    navigate('/search');
  };

  const toggleFood = (id: string) => {
    const current = formData.comfortFoods;
    if (current.includes(id)) {
      updateForm({ comfortFoods: current.filter(f => f !== id) });
    } else {
      updateForm({ comfortFoods: [...current, id] });
    }
  };

  const progress = (step / 6) * 100;

  // ─── AI Chat logic ────────────────────────────────────────────────────────────

  const profileSoFar = {
    thermalSensitivity: formData.thermalSensitivity,
    comfortFoods: formData.comfortFoods,
    budgetMonthlyUsd: formData.budgetMonthlyUsd,
    travelPurpose: formData.travelPurpose,
    culturalOpenness: formData.culturalOpenness,
  };

  const sendAiMessage = async (history: ChatMessage[]) => {
    setAiLoading(true);
    try {
      const response = await aiService.continueOnboarding(history, profileSoFar, 'pt-BR');
      setLastResponse(response);

      const assistantMsg: ChatMessage = { role: 'assistant', content: response.message };
      setChatHistory(prev => [...prev, assistantMsg]);

      if (response.done) {
        setAiDone(true);
        // Merge extracted comfortFoods (uppercase → match FOOD_OPTIONS ids which are lowercase)
        const extractedFoods = (response.extractedPreferences.comfortFoods ?? [])
          .map((f: string) => f.toLowerCase())
          .filter((f: string) => FOOD_OPTIONS.some(opt => opt.id === f));
        const merged = Array.from(new Set([...formData.comfortFoods, ...extractedFoods]));
        updateForm({ comfortFoods: merged });

        // Save freeform tags and notes in tempProfile
        setTempProfile({
          freeformTags: response.extractedPreferences.freeformTags,
          aiNotes: response.extractedPreferences.notes,
        } as any);
      }
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Ops! Não consegui processar sua resposta. Tente novamente ou pule esta etapa.',
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-start step 6
  useEffect(() => {
    if (step === 6 && !step6Initialized.current) {
      step6Initialized.current = true;
      sendAiMessage([]);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || aiLoading || aiDone) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');
    await sendAiMessage(newHistory);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageWrapper className={styles.wrapper}>
      <div className={styles.progressContainer}>
        <ProgressBar value={progress} className={styles.progressBar} />
      </div>

      <div className={styles.container}>
        {step === 1 && (
          <div className={`${styles.step} animate-slide-up`}>
            <div className={styles.heroArt}>🌍</div>
            <h1 className={styles.title}>{t('onboarding.step1Title', "Olá! Vamos criar seu perfil de nômade")}</h1>
            <p className={styles.subtitle}>Personalize suas recomendações baseadas no que realmente importa para você.</p>

            <div className={styles.formGroup}>
              <Input
                label="Seu Nome"
                placeholder="Como gosta de ser chamado?"
                value={formData.name}
                onChange={e => updateForm({ name: e.target.value })}
              />
              <Input
                label="E-mail (opcional)"
                placeholder="Para salvar seu perfil"
                type="email"
                value={formData.email}
                onChange={e => updateForm({ email: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>{t('onboarding.step2Title', 'Como você se relaciona com o clima?')}</h1>
            <div className={styles.grid2x2}>
              {[
                { id: 'HEAT_LOVER', icon: '🌞', label: 'Amo calor' },
                { id: 'TOLERANT', icon: '🌤', label: 'Me adapto bem' },
                { id: 'SENSITIVE', icon: '🌡', label: 'Sou sensível a extremos' },
                { id: 'COLD_LOVER', icon: '❄️', label: 'Prefiro frio' },
              ].map(opt => (
                <Card
                  key={opt.id}
                  className={`${styles.selectCard} ${formData.thermalSensitivity === opt.id ? styles.selected : ''}`}
                  onClick={() => updateForm({ thermalSensitivity: opt.id as any })}
                  glow
                >
                  <span className={styles.cardIcon}>{opt.icon}</span>
                  <span className={styles.cardLabel}>{opt.label}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>{t('onboarding.step3Title', 'Quais pratos você não consegue viver sem?')}</h1>
            <div className={styles.foodGrid}>
              {FOOD_OPTIONS.map(food => (
                <Card
                  key={food.id}
                  className={`${styles.foodCard} ${formData.comfortFoods.includes(food.id) ? styles.selected : ''}`}
                  onClick={() => toggleFood(food.id)}
                  glass
                >
                  <span className={styles.foodEmoji}>{food.emoji}</span>
                  <span className={styles.foodLabel}>{food.label}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>{t('onboarding.step4Title', 'Qual é o seu orçamento mensal estimado?')}</h1>

            <div className={styles.budgetDisplay}>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>{formData.budgetMonthlyUsd}</span>
              <span className={styles.period}>/mês (USD)</span>
            </div>

            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={formData.budgetMonthlyUsd}
              onChange={e => updateForm({ budgetMonthlyUsd: parseInt(e.target.value) })}
              className={styles.slider}
            />

            <h3 className={styles.sectionTitle}>Motivo da viagem</h3>
            <div className={styles.purposeGrid}>
              {[
                { id: 'DIGITAL_NOMAD', icon: '💻', label: 'Nômade Digital' },
                { id: 'EXPAT', icon: '📦', label: 'Expatriado' },
                { id: 'STUDENT', icon: '🎓', label: 'Estudante' },
                { id: 'TOURIST', icon: '📸', label: 'Turista' },
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`${styles.purposeChip} ${formData.travelPurpose === opt.id ? styles.selectedChip : ''}`}
                  onClick={() => updateForm({ travelPurpose: opt.id as any })}
                >
                  {opt.icon} {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>{t('onboarding.step5Title', 'Idiomas & Cultura')}</h1>

            <h3 className={styles.sectionTitle}>Nível de abertura cultural (1-10)</h3>
            <p className={styles.hintText}>O quanto você está disposto a se adaptar a costumes muito diferentes dos seus?</p>
            <div className={styles.sliderWrapper}>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.culturalOpenness}
                onChange={e => updateForm({ culturalOpenness: parseInt(e.target.value) })}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>Preciso de conforto e familiaridade</span>
                <span className={styles.sliderValue}>{formData.culturalOpenness}</span>
                <span>Amo choque cultural!</span>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className={`${styles.step} animate-slide-up`}>
            <h1 className={styles.title}>✨ Refinamento com IA</h1>
            <p className={styles.subtitle}>
              Deixe nosso assistente te fazer algumas perguntas rápidas para personalizar ainda mais suas recomendações.
            </p>

            <div className={styles.chatArea}>
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.bubble} ${msg.role === 'assistant' ? styles.bubbleAssistant : styles.bubbleUser}`}
                >
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

            {/* Quick replies */}
            {!aiDone && !aiLoading && lastResponse && lastResponse.quickReplies.length > 0 && (
              <div className={styles.quickReplies}>
                {lastResponse.quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    className={styles.quickReply}
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Free-text input */}
            {!aiDone && (
              <div className={styles.chatInputRow}>
                <input
                  className={styles.chatInput}
                  placeholder="Digite sua resposta..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage(chatInput)}
                  disabled={aiLoading}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSendMessage(chatInput)}
                  disabled={aiLoading || !chatInput.trim()}
                >
                  Enviar
                </Button>
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>
          {step > 1 && step < 6 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              {t('onboarding.back', 'Voltar')}
            </Button>
          ) : step === 6 ? (
            <Button variant="ghost" onClick={handleFinish}>
              Pular esta etapa
            </Button>
          ) : <div></div>}

          {step === 6 ? (
            aiDone ? (
              <Button variant="primary" size="lg" onClick={handleFinish}>
                {t('onboarding.finish', 'Explorar Destinos')}
              </Button>
            ) : null
          ) : (
            <Button variant="primary" size="lg" onClick={handleNext}>
              {step === 5 ? t('onboarding.next', 'Próximo') : t('onboarding.next', 'Próximo')}
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

