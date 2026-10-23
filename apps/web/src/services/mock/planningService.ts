import type { ArrivalPlan, ArrivalTask, CityData } from '../types';

export function buildArrivalPlan(city: CityData, arrivalDate: string): ArrivalPlan {
  const arrival = new Date(`${arrivalDate}T12:00:00`);
  const todayDate = new Date();
  todayDate.setHours(12, 0, 0, 0);
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const dayMs = 86_400_000;
  const setupBudget = Math.round(city.monthlyCostBrl * .55);
  const templates: Array<Omit<ArrivalTask, 'id' | 'dueDate'> & { offset: number }> = [
    { phase: 'Com 90 dias ou mais', title: 'Mapear requisitos de entrada e residência', description: 'Consulte fontes oficiais do destino ou um profissional habilitado; os requisitos variam por nacionalidade e propósito.', offset: -100, estimatedCostBrl: 0, priority: 'alta' },
    { phase: 'Com 90 dias ou mais', title: 'Definir orçamento e reserva de emergência', description: `Use a estimativa ilustrativa de R$ ${city.monthlyCostBrl.toLocaleString('pt-BR')} por mês como ponto de partida.`, offset: -90, estimatedCostBrl: 0, priority: 'alta' },
    { phase: 'De 30 a 89 dias', title: 'Pesquisar moradia temporária e bairros', description: 'Compare duração, transporte, custos e condições do contrato.', offset: -60, estimatedCostBrl: Math.round(setupBudget * .25), priority: 'alta' },
    { phase: 'De 30 a 89 dias', title: 'Organizar documentos e cópias digitais', description: 'Confira traduções, validade e requisitos junto às fontes oficiais.', offset: -45, estimatedCostBrl: Math.round(setupBudget * .05), priority: 'alta' },
    { phase: 'De 7 a 29 dias', title: 'Confirmar transporte e primeira hospedagem', description: 'Guarde endereços e contatos essenciais para a chegada.', offset: -21, estimatedCostBrl: Math.round(setupBudget * .1), priority: 'média' },
    { phase: 'De 7 a 29 dias', title: 'Preparar pagamentos e conectividade', description: 'Planeje acesso a dinheiro, telefone e internet para os primeiros dias.', offset: -10, estimatedCostBrl: Math.round(setupBudget * .08), priority: 'média' },
    { phase: 'Semana da chegada', title: 'Separar itens essenciais e documentos', description: 'Mantenha documentos e comprovantes acessíveis durante o deslocamento.', offset: -3, estimatedCostBrl: 0, priority: 'média' },
    { phase: 'Primeira semana', title: 'Conhecer o entorno e serviços próximos', description: 'Identifique mercado, transporte, farmácia e serviços úteis no bairro.', offset: 3, estimatedCostBrl: Math.round(setupBudget * .12), priority: 'média' },
    { phase: 'Primeiro mês', title: 'Revisar moradia e custos reais', description: 'Compare os gastos observados com a estimativa e ajuste o plano.', offset: 21, estimatedCostBrl: 0, priority: 'baixa' },
    { phase: 'Primeiro mês', title: 'Criar uma rotina e rede de apoio', description: 'Explore atividades locais, grupos de interesse e canais de apoio confiáveis.', offset: 30, estimatedCostBrl: 0, priority: 'baixa' },
  ];
  const tasks = templates.map((task, index) => {
    const due = new Date(arrival.getTime() + task.offset * dayMs);
    const plannedDueDate = Number.isNaN(due.getTime()) ? arrivalDate : due.toISOString().slice(0, 10);
    const isUrgent = plannedDueDate < today;
    return { ...task, phase: isUrgent ? 'Prioridade imediata · prazo encurtado' : task.phase, id: `${city.summary.id}-${arrivalDate}-${index}`, dueDate: isUrgent ? today : plannedDueDate };
  });
  return { cityId: city.summary.id, arrivalDate, tasks, estimatedSetupCostBrl: tasks.reduce((total, task) => total + task.estimatedCostBrl, 0), monthlyCostBrl: city.monthlyCostBrl, generatedAt: new Date().toISOString() };
}
