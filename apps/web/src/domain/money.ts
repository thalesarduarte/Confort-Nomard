import type {Currency} from '@/services/types';

export const demoBrlPerUnit:Record<Currency,number>={BRL:1,USD:5,EUR:5.5};
export function formatMoneyFromBrl(valueBrl:number,currency:Currency='BRL',locale='pt-BR'):string{
  const value=valueBrl/demoBrlPerUnit[currency];
  return new Intl.NumberFormat(locale,{style:'currency',currency,maximumFractionDigits:0}).format(value);
}
