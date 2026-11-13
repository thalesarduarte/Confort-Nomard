import { DEFAULT_PROFILE, type ArrivalPlanOptions, type ArrivalTask, type City, type FirstMonthWeek, type ProfilePatch } from '@/services/types';

const addDays=(value:Date,days:number)=>new Date(value.getTime()+days*86_400_000);
const dateText=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export function simulateFirstMonth(city:City,profile:ProfilePatch|null):FirstMonthWeek[]{
  const pacing=profile?.pace??'balanced';
  const values=[
    ['Chegada e rotina essencial','Acomodação, mercado e reconhecer o entorno.',.34,'Dê espaço para descanso e orientação local.'],
    ['Serviços e deslocamentos','Testar rotas, conectividade e serviços próximos.',.24,'Registre despesas reais para comparar com o seed.'],
    ['Rede de apoio','Explorar comunidades, atividades e lugares familiares.',.22,'Pequenos encontros podem ajudar na adaptação.'],
    ['Ajuste da rotina','Rever orçamento, moradia e hábitos do primeiro mês.',.20,'Adapte a rotina ao ritmo que funciona para você.'],
  ] as const;
  return values.map(([title,focus,fraction,adjustment],index)=>({week:index+1,title,focus,estimatedCostBrl:Math.round(city.monthlyBrl*fraction*(pacing==='quiet'?.94:pacing==='lively'?1.12:1)),adjustment}));
}

export function buildArrivalPlan(city:City,arrivalDate:string,options:ArrivalPlanOptions={nationality:'',purpose:'relocation',completedCategories:[]}):ArrivalTask[]{
  const arrival=new Date(`${arrivalDate}T12:00:00`);
  const now=new Date();now.setHours(12,0,0,0);
  const today=dateText(now);
  const purposeText={relocation:'mudar residência',remote:'trabalhar remotamente',study:'estudar',tourism:'viajar'}[options.purpose];
  const nationality=options.nationality.trim()||'sua nacionalidade';
  const templates=[
    {category:'documents' as const,taskKey:'entry' as const,offset:-100,phase:'early',title:`Confirmar requisitos para ${purposeText}`,description:`Verifique as regras vigentes para ${nationality} em ${city.country} e para o objetivo de ${purposeText}, em fontes oficiais.`,estimateBrl:0,priority:'alta' as const,officialCheck:true},
    {category:'budget' as const,taskKey:'budget' as const,offset:-80,phase:'early',title:'Definir orçamento e reserva de chegada',description:`Compare a estimativa ilustrativa de ${city.name} com cotações atuais e seus recursos.`,estimateBrl:0,priority:'alta' as const,officialCheck:false},
    {category:'housing' as const,taskKey:'housing' as const,offset:-60,phase:'mid',title:'Pesquisar moradia temporária e bairros',description:`Compare transporte, custos, duração e condições de moradia em ${city.name}.`,estimateBrl:Math.round(city.monthlyBrl*.16),priority:'alta' as const,officialCheck:false},
    {category:'documents' as const,taskKey:'documents' as const,offset:-45,phase:'mid',title:'Organizar documentos e cópias digitais',description:`Confira validade, tradução e exigências oficiais para ${nationality} em ${city.country}.`,estimateBrl:Math.round(city.monthlyBrl*.03),priority:'alta' as const,officialCheck:true},
    {category:'health' as const,taskKey:'health' as const,offset:-30,phase:'mid',title:'Conferir cobertura de saúde e seguro',description:`Verifique com fontes oficiais e prestadores reconhecidos o que se aplica ao seu tipo de estadia.`,estimateBrl:Math.round(city.monthlyBrl*.04),priority:'alta' as const,officialCheck:true},
    {category:'transport' as const,taskKey:'transport' as const,offset:-21,phase:'near',title:'Confirmar transporte e primeira hospedagem',description:`Deixe os endereços e contatos essenciais de ${city.name} acessíveis.`,estimateBrl:Math.round(city.monthlyBrl*.08),priority:'média' as const,officialCheck:false},
    {category:'connectivity' as const,taskKey:'connectivity' as const,offset:-10,phase:'near',title:'Preparar pagamentos e conectividade',description:'Planeje meios de pagamento e acesso à internet para os primeiros dias.',estimateBrl:Math.round(city.monthlyBrl*.05),priority:'média' as const,officialCheck:false},
    {category:'essentials' as const,taskKey:'essentials' as const,offset:-3,phase:'arrival',title:'Separar itens essenciais e documentos',description:'Mantenha documentos e comprovantes à mão durante o deslocamento.',estimateBrl:0,priority:'média' as const,officialCheck:false},
    {category:'local_services' as const,taskKey:'local' as const,offset:4,phase:'firstWeek',title:'Conhecer serviços próximos',description:`Localize mercado, transporte e serviços que fazem parte da sua rotina em ${city.name}.`,estimateBrl:Math.round(city.monthlyBrl*.07),priority:'média' as const,officialCheck:false},
    {category:'routine' as const,taskKey:'routineCosts' as const,offset:20,phase:'firstMonth',title:'Revisar moradia e custos reais',description:'Compare os gastos observados com a estimativa e ajuste o planejamento.',estimateBrl:0,priority:'baixa' as const,officialCheck:false},
    {category:'routine' as const,taskKey:'routineNetwork' as const,offset:28,phase:'firstMonth',title:'Criar uma rotina e rede de apoio',description:'Explore atividades locais, grupos de interesse e canais de apoio confiáveis.',estimateBrl:0,priority:'baixa' as const,officialCheck:false},
  ];
  return templates.map((task,index)=>{
    const due=addDays(arrival,task.offset);const intended=dateText(due);const urgent=intended<today;
    return {id:`${city.id}-${arrivalDate}-${index}`,category:task.category,taskKey:task.taskKey,phase:urgent?'immediate':task.phase,title:task.title,description:task.description,dueDate:urgent?today:intended,estimateBrl:task.estimateBrl,priority:urgent?'alta':task.priority,officialCheck:task.officialCheck,completed:options.completedCategories.includes(task.category)};
  });
}

export function mergeAnonymousProfile(temp:ProfilePatch|null,current:ProfilePatch|null):ProfilePatch|null{
  if(!temp&&!current)return null;
  return {...temp,...current,weights:{...DEFAULT_PROFILE.weights,...temp?.weights,...current?.weights},comfortFoods:current?.comfortFoods??temp?.comfortFoods,languages:current?.languages??temp?.languages,freeformTags:[...new Set([...(temp?.freeformTags??[]),...(current?.freeformTags??[])])]};
}

export function parseAssistantPreferences(text:string):ProfilePatch{
  const normalized=text.toLocaleLowerCase('pt-BR');
  const foods=[['rice_beans',/arroz|feijão|feijao/],['pasta',/massa|macarrão|macarrao/],['bread',/pão|pao/],['sushi',/sushi/],['tacos',/taco/],['curry',/curry/],['pizza',/pizza/],['arabic',/árabe|arabe/],['chinese',/chinesa|chinês|chines/],['vegan',/vegano|vegana/]] as const;
  const comfortFoods=foods.filter(([,pattern])=>pattern.test(normalized)).map(([id])=>id);
  const thermalPreference=/(calor|quente|sol)/.test(normalized)?'warm' as const:/(frio|gelad|neve)/.test(normalized)?'cool' as const:/(tanto faz|flexível|flexivel)/.test(normalized)?'flexible' as const:undefined;
  const pace=/(tranquil|calmo|sosseg)/.test(normalized)?'quiet' as const:/(moviment|agitado|noturna)/.test(normalized)?'lively' as const:undefined;
  const freeformTags=[...new Set(normalized.match(/comida|clima|amizade|família|familia|tranquilo|segurança|seguranca|transporte|social/g)??[])];
  return {...(comfortFoods.length?{comfortFoods}:{}),...(thermalPreference?{thermalPreference}:{}),...(pace?{pace}:{}),freeformTags};
}
