import type { Contribution } from '../../types';

export const communitySeed: Contribution[] = [
  {id:'seed-lisboa-1',kind:'dica',cityId:'lisboa',title:'Cheque horários antes de ir',body:'Alguns serviços de bairro podem ter horários diferentes em feriados. Confirme diretamente antes de planejar o deslocamento.',status:'aprovado',author:'Lia, colaboradora de demonstração',authorId:'seed',votes:16,createdAt:'2026-09-12'},
  {id:'seed-berlim-1',kind:'comida',cityId:'berlim',title:'Procure mercados de ingredientes',body:'Mercados internacionais podem ajudar a reencontrar ingredientes conhecidos. A disponibilidade muda por bairro e época.',status:'aprovado',author:'Rafa, colaborador de demonstração',authorId:'seed',votes:12,createdAt:'2026-09-19'},
  {id:'seed-toronto-1',kind:'bairro',cityId:'toronto',title:'Compare deslocamento com custo',body:'Ao avaliar um bairro, some aluguel e transporte ao tempo diário de deslocamento. Os valores deste protótipo são fictícios.',status:'aprovado',author:'Maya, colaboradora de demonstração',authorId:'seed',votes:9,createdAt:'2026-10-01'},
  {id:'seed-cdmx-1',kind:'dica',cityId:'cdmx',title:'Pergunte como funciona a gorjeta',body:'A prática pode variar conforme o tipo de serviço. Perguntar com cordialidade ajuda a evitar suposições.',status:'aprovado',author:'André, colaborador de demonstração',authorId:'seed',votes:7,createdAt:'2026-10-04'},
  {id:'seed-admin-queue-1',kind:'dica',cityId:'lisboa',title:'Revisar a data desta dica sobre horários',body:'Horários de serviços locais podem mudar em feriados e conforme a época do ano. Consulte a página oficial do estabelecimento antes de sair.',status:'pendente',author:'Nina, colaboradora de demonstração',authorId:'seed-demo',votes:0,createdAt:'2026-11-12'},
];
