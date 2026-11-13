import type {PartnerOffer,RelocationEmployee} from '../types';
import {useAppStore} from '@/store/appStore';
import {wait} from './storage';

const partnerSeed:PartnerOffer[]=[
  {id:'seguro-chegada',category:'Seguro',title:'Cobertura para os primeiros dias',description:'Roteiro fictício de perguntas para comparar coberturas e franquias.',estimate:'Simulação local',terms:'Oferta fictícia, sem contratação ou redirecionamento.'},
  {id:'cambio-planejado',category:'Câmbio',title:'Reserva de chegada',description:'Checklist local para pensar em acesso ao dinheiro e pagamentos.',estimate:'Sem cotação',terms:'Taxas e valores não são reais; consulte provedores autorizados.'},
  {id:'moradia-temporaria',category:'Moradia',title:'Primeira hospedagem',description:'Perguntas de demonstração para comparar duração e regras do imóvel.',estimate:'Sem anúncio',terms:'Não há imóveis listados nem link comercial.'},
];
const employeeSeed:RelocationEmployee[]=[
  {id:'staff-ana',name:'Ana Souza (demo)',cityId:'lisboa',score:82,alert:'Validar orçamento de moradia',checklistDone:3,checklistTotal:8},
  {id:'staff-lucas',name:'Lucas Mendes (demo)',cityId:'berlim',score:74,alert:'Conferir clima e prazo de chegada',checklistDone:5,checklistTotal:8},
  {id:'staff-maya',name:'Maya Costa (demo)',cityId:'toronto',score:68,alert:'Revisar documentação em canal oficial',checklistDone:2,checklistTotal:8},
];
export const mockBusinessService={
  async offers():Promise<PartnerOffer[]>{await wait(300);return partnerSeed;},
  async employees():Promise<RelocationEmployee[]>{await wait(420);return employeeSeed;},
  async submitLead(company:string,email:string):Promise<void>{await wait(380);if(company.trim().length<2||!email.includes('@'))throw new Error('Confira nome da empresa e e-mail.');useAppStore.getState().addLead(company.trim(),email.trim());},
};
