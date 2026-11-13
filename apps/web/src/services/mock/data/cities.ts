import type { City, ClimateMonth, CultureTip, FoodPlace, Neighborhood, Provenance } from '../../types';

type CitySeed = { id:string; name:string; country:string; code:string; language:string; currency:string; timezone:string; cost:number; temp:number; swing:number; south?:boolean; foods:string[]; hoods:string[]; documents:string };
const seeds: CitySeed[] = [
  {id:'lisboa',name:'Lisboa',country:'Portugal',code:'PT',language:'Português',currency:'EUR',timezone:'Europe/Lisbon',cost:4300,temp:18,swing:7,foods:['Casa Raiz','Mercado do Tejo','Padaria do Bairro','Feira das Flores','Mesa de Casa','Café da Esquina'],hoods:['Alfama','Arroios','Campo de Ourique','Parque das Nações'],documents:'Informações gerais: confirme requisitos de residência e trabalho nos canais oficiais de Portugal.'},
  {id:'porto',name:'Porto',country:'Portugal',code:'PT',language:'Português',currency:'EUR',timezone:'Europe/Lisbon',cost:3700,temp:16,swing:6,foods:['Cantinho Brasileiro','Mercado da Ribeira','Pão de Casa','Feira do Bolhão','Mesa do Norte','Café Cedofeita'],hoods:['Cedofeita','Bonfim','Foz','Campanhã'],documents:'Informações gerais: confira vistos e residência nos canais oficiais de Portugal.'},
  {id:'berlim',name:'Berlim',country:'Alemanha',code:'DE',language:'Alemão',currency:'EUR',timezone:'Europe/Berlin',cost:5200,temp:10,swing:12,foods:['Sabor do Brasil','Mercado Kreuzberg','Pão & Prosa','Feira Neukölln','Mesa do Mundo','Café Prenzlauer'],hoods:['Kreuzberg','Neukölln','Prenzlauer Berg','Charlottenburg'],documents:'Informações gerais: confirme autorizações de residência e trabalho nos canais oficiais alemães.'},
  {id:'barcelona',name:'Barcelona',country:'Espanha',code:'ES',language:'Catalão / Espanhol',currency:'EUR',timezone:'Europe/Madrid',cost:4800,temp:18,swing:8,foods:['Sabor de Casa','Mercat de Gràcia','Pão da Vila','Feira de Sant Antoni','Mesa Latina','Café Poblenou'],hoods:['Gràcia','Eixample','Poblenou','Sants'],documents:'Informações gerais: verifique requisitos de residência e trabalho junto às autoridades espanholas.'},
  {id:'amsterdam',name:'Amsterdã',country:'Países Baixos',code:'NL',language:'Neerlandês',currency:'EUR',timezone:'Europe/Amsterdam',cost:6200,temp:11,swing:8,foods:['Cozinha Saudade','Mercado De Pijp','Pão da Manhã','Feira Noord','Mesa do Canal','Café Jordaan'],hoods:['De Pijp','Oost','Jordaan','Noord'],documents:'Informações gerais: consulte fontes oficiais neerlandesas sobre residência e trabalho.'},
  {id:'dublin',name:'Dublin',country:'Irlanda',code:'IE',language:'Inglês / Irlandês',currency:'EUR',timezone:'Europe/Dublin',cost:6500,temp:11,swing:5,foods:['Sabor Brasileiro','Mercado do Centro','Padaria Familiar','Feira de Rathmines','Mesa Verde','Café Docklands'],hoods:['Rathmines','Drumcondra','Smithfield','Docklands'],documents:'Informações gerais: verifique autorização de residência e trabalho em fontes oficiais irlandesas.'},
  {id:'toronto',name:'Toronto',country:'Canadá',code:'CA',language:'Inglês / Francês',currency:'CAD',timezone:'America/Toronto',cost:7100,temp:9,swing:15,foods:['Brasil na Mesa','Mercado Kensington','Pão Quentinho','Feira St. Lawrence','Mesa Multicultural','Café Annex'],hoods:['The Annex','Kensington','Leslieville','North York'],documents:'Informações gerais: confirme permissões e condições junto às autoridades canadenses.'},
  {id:'cdmx',name:'Cidade do México',country:'México',code:'MX',language:'Espanhol',currency:'MXN',timezone:'America/Mexico_City',cost:3900,temp:17,swing:5,foods:['Cozinha de Casa','Mercado Roma','Padaria Pan de Casa','Feira Coyoacán','Mesa do Brasil','Café Condesa'],hoods:['Roma Norte','Coyoacán','Del Valle','Condesa'],documents:'Informações gerais: confira regras migratórias mexicanas em fontes governamentais.'},
  {id:'buenos-aires',name:'Buenos Aires',country:'Argentina',code:'AR',language:'Espanhol',currency:'ARS',timezone:'America/Argentina/Buenos_Aires',cost:3400,temp:18,swing:9,south:true,foods:['Saudade Brasileira','Mercado de Palermo','Pão da Manhã','Feira de San Telmo','Mesa Porteña','Café do Bairro'],hoods:['Palermo','Recoleta','San Telmo','Villa Crespo'],documents:'Informações gerais: confira residência e trabalho junto às autoridades argentinas.'},
  {id:'medellin',name:'Medellín',country:'Colômbia',code:'CO',language:'Espanhol',currency:'COP',timezone:'America/Bogota',cost:3100,temp:22,swing:2,foods:['Sabor Familiar','Mercado Laureles','Pão de Casa','Feira Envigado','Mesa Andina','Café El Poblado'],hoods:['Laureles','El Poblado','Belén','Envigado'],documents:'Informações gerais: consulte as regras de permanência e trabalho em fontes oficiais colombianas.'},
  {id:'toquio',name:'Tóquio',country:'Japão',code:'JP',language:'Japonês',currency:'JPY',timezone:'Asia/Tokyo',cost:5900,temp:16,swing:12,foods:['Brasil & Japão','Mercado de Shimokitazawa','Pão da Vila','Feira de Setagaya','Mesa de Casa','Café Asakusa'],hoods:['Setagaya','Kichijoji','Asakusa','Shinagawa'],documents:'Informações gerais: confirme visto e autorização de trabalho com fontes oficiais japonesas.'},
  {id:'bangkok',name:'Bangkok',country:'Tailândia',code:'TH',language:'Tailandês',currency:'THB',timezone:'Asia/Bangkok',cost:3000,temp:29,swing:2,foods:['Cozinha de Casa','Mercado Ari','Padaria do Bairro','Feira Chatuchak','Mesa Tailandesa','Café Sathorn'],hoods:['Ari','Sathorn','Bang Na','Old Town'],documents:'Informações gerais: confirme condições de visto e trabalho nos canais oficiais tailandeses.'},
  {id:'dubai',name:'Dubai',country:'Emirados Árabes',code:'AE',language:'Árabe / Inglês',currency:'AED',timezone:'Asia/Dubai',cost:7200,temp:28,swing:8,foods:['Sabor Brasileiro','Mercado Al Barsha','Pão & Café','Feira de Deira','Mesa do Golfo','Café Jumeirah'],hoods:['Deira','Jumeirah','Al Barsha','Dubai Marina'],documents:'Informações gerais: consulte fontes oficiais dos Emirados sobre visto e trabalho.'},
  {id:'nova-york',name:'Nova York',country:'Estados Unidos',code:'US',language:'Inglês',currency:'USD',timezone:'America/New_York',cost:8800,temp:13,swing:13,foods:['Cantinho do Brasil','Mercado Queens','Pão da Manhã','Feira Union Square','Mesa do Mundo','Café Brooklyn'],hoods:['Astoria','Brooklyn Heights','Harlem','Queens'],documents:'Informações gerais: confira requisitos migratórios em fontes governamentais dos EUA.'},
  {id:'florianopolis',name:'Florianópolis',country:'Brasil',code:'BR',language:'Português',currency:'BRL',timezone:'America/Sao_Paulo',cost:3600,temp:22,swing:6,south:true,foods:['Mesa da Ilha','Mercado da Lagoa','Pão de Casa','Feira do Centro','Cozinha Açoriana','Café Campeche'],hoods:['Centro','Lagoa da Conceição','Campeche','Coqueiros'],documents:'Para mudanças dentro do Brasil, confira documentos e serviços diretamente com cada órgão local.'},
];

const tipSeeds: Array<Omit<CultureTip,'id'>> = [
  {category:'convivência',title:'Cumprimentos',do:'Observe como as pessoas se cumprimentam e acompanhe o tom do contexto.',avoid:'Presumir que a formalidade é igual em todos os ambientes.',importance:'média'},
  {category:'rotina',title:'Pontualidade',do:'Confirme o horário e a margem esperada para cada compromisso.',avoid:'Tratar um costume social como regra universal.',importance:'alta'},
  {category:'mesa',title:'À mesa',do:'Pergunte sobre costumes locais quando estiver em dúvida.',avoid:'Assumir que gorjeta e divisão da conta funcionam como no Brasil.',importance:'média'},
  {category:'convivência',title:'Moradia',do:'Leia as regras do prédio sobre silêncio, lixo e áreas comuns.',avoid:'Deixar para descobrir as regras depois de um conflito.',importance:'alta'},
  {category:'idioma',title:'Frases úteis',do:'Aprenda saudações e expressões práticas do cotidiano.',avoid:'Esperar fluência imediata para começar a conversar.',importance:'média'},
  {category:'serviços',title:'Serviços locais',do:'Anote endereços e horários de serviços que você usa com frequência.',avoid:'Confiar em horários de exemplo sem confirmar localmente.',importance:'baixa'},
  {category:'burocracia',title:'Documentos',do:'Confira exigências em sites oficiais do país e da sua nacionalidade.',avoid:'Tomar este guia como aconselhamento jurídico ou migratório.',importance:'alta'},
  {category:'segurança',title:'Cuidados cotidianos',do:'Peça orientações atualizadas a fontes locais confiáveis.',avoid:'Generalizar segurança de uma cidade inteira a partir de uma experiência.',importance:'alta'},
];

const synthetic: Provenance = { source:'Seed local Comfort Nomad v2', updatedAt:'2026-10-23', confidence:'baixa', note:'Dado sintético para demonstração; não verificado por fontes oficiais nem pesquisa de campo.' };
const seasons = ['Verão','Verão','Outono','Outono','Outono','Inverno','Inverno','Inverno','Primavera','Primavera','Primavera','Verão'];
const round = (n:number) => Math.round(n*10)/10;

function buildClimate(seed:CitySeed): ClimateMonth[] {
  return Array.from({length:12},(_,index)=>{
    const month=index+1;
    const seasonal = Math.sin(((index - (seed.south?0:6))/12)*Math.PI*2)*seed.swing;
    const averageC=round(seed.temp+seasonal);
    const rainMm=Math.round(45+Math.abs(Math.sin((index+1+seed.cost/5000)*Math.PI/6))*95+(seed.temp>25?35:0));
    return {month,averageC,rainMm,humidity:Math.round(54+Math.abs(Math.sin(index*Math.PI/6))*30),sunHours:round(Math.max(3,8+Math.sin((index-2)*Math.PI/6)*2.5)),feeling:`${seasons[(index+(seed.south?5:0))%12]} ilustrativo · ${averageC} °C em média`};
  });
}

function buildFoods(seed:CitySeed): FoodPlace[] {
  const descriptors=[['brasileira','mercearia', ['rice_beans','bread']],['local','mercado',['vegetables','fresh']],['padaria','padaria',['bread']],['regional','feira',['fresh','local']],['italiana','restaurante',['pasta','pizza']],['brasileira','restaurante',['rice_beans','vegan']]] as const;
  return seed.foods.map((name,index)=>{
    const [cuisine,kind,tags]=descriptors[index];
    return {id:`${seed.id}-food-${index}`,name,kind,cuisine,neighborhoodId:`${seed.id}-hood-${index%4}`,priceBrl:18+index*9+Math.round(seed.cost/500),nostalgia:Math.max(45,93-index*7),tags:[...tags]};
  });
}

function buildNeighborhoods(seed:CitySeed): Neighborhood[] {
  return seed.hoods.map((name,index)=>{
    const variation=[.78,.94,1.08,1.22][index];
    return {id:`${seed.id}-hood-${index}`,name,rentLocal:Math.round(seed.cost*variation/(seed.currency==='USD'?5:6)),currency:seed.currency,rentBrl:Math.round(seed.cost*.48*variation),monthlyBrl:Math.round(seed.cost*variation),safety:round(6+((index*7+seed.cost/100)%30)/10),transit:Math.round(5+((index*3+seed.temp)%5)),social:Math.round(5+((index+seed.cost/700)%5)),expat:Math.round(3+((index*2+seed.cost/1000)%7)),x:18+index*21,y:index%2===0?32:68};
  });
}

export const citySeed: City[] = seeds.map((seed)=>({
  id:seed.id,name:seed.name,country:seed.country,countryCode:seed.code,tagline:`Um novo ritmo para chamar de seu, em ${seed.name}.`,
  language:seed.language,currency:seed.currency,timezone:seed.timezone,monthlyBrl:seed.cost,
  climate:buildClimate(seed),foods:buildFoods(seed),neighborhoods:buildNeighborhoods(seed),
  culture:tipSeeds.map((tip,index)=>({...tip,id:`${seed.id}-tip-${index}`})),documentsNote:seed.documents,
  provenance:{cost:synthetic,climate:synthetic,safety:{...synthetic,note:'Índice comunitário sintético; não representa criminalidade real nem substitui fontes locais atualizadas.'}},
}));

export const foodOptions = [
  {id:'rice_beans',label:'Arroz e feijão'},{id:'pasta',label:'Massas'},{id:'bread',label:'Pão fresco'},{id:'sushi',label:'Sushi'},
  {id:'tacos',label:'Tacos'},{id:'curry',label:'Curry'},{id:'pizza',label:'Pizza'},{id:'arabic',label:'Comida árabe'},
  {id:'chinese',label:'Comida chinesa'},{id:'vegan',label:'Opções veganas'},
];
