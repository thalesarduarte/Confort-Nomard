import type { City, PillarKey, ProfilePatch, ScoreBreakdown } from '@/services/types';

const labels: Record<PillarKey,string> = { climate:'Clima', food:'Comida', neighborhood:'Bairros', culture:'Cultura' };
const foodTags: Record<string,string[]> = {
  rice_beans:['rice_beans'], pasta:['pasta'], bread:['bread'], sushi:['sushi'], tacos:['tacos'], curry:['curry'],
  pizza:['pizza','pasta'], arabic:['arabic'], chinese:['chinese'], vegan:['vegan'],
};

export function scoreCity(city: City, profile: ProfilePatch|null): ScoreBreakdown {
  const climate = city.climate.length ? Math.round(city.climate.reduce((total, month) => {
    const preferred=profile?.thermalPreference??'mild';
    const comfortable=preferred==='warm'?month.averageC>=21:preferred==='cool'?month.averageC<=17:preferred==='mild'?month.averageC>=13&&month.averageC<=25:true;
    const sensitivity=preferred==='flexible'?88:comfortable?100:48;
    return total+sensitivity;
  },0)/city.climate.length) : 0;
  const wanted=profile?.comfortFoods??[];
  const found=city.foods.filter(food=>wanted.some(item=>(foodTags[item]??[item]).some(tag=>food.tags.includes(tag))));
  const food=wanted.length?Math.round(Math.min(100,35+found.length/Math.max(1,wanted.length)*65)):(city.foods.length?Math.round(city.foods.reduce((sum,item)=>sum+item.nostalgia,0)/city.foods.length):0);
  const budgetBrl=(profile?.budgetMonthlyUsd??2500)*5;
  const neighborhood=Math.max(0,Math.min(100,Math.round(110-city.monthlyBrl/budgetBrl*50)));
  const expat=city.neighborhoods.reduce((sum,item)=>sum+item.expat,0)/Math.max(1,city.neighborhoods.length);
  const culture=Math.max(0,Math.min(100,Math.round(55+expat*4+(profile?.openness??5)*2)));
  const values:Record<PillarKey,number>={climate,food,neighborhood,culture};
  const weights:Record<PillarKey,number>={climate:1,food:1,neighborhood:1,culture:1,...profile?.weights};
  const pillars=(Object.keys(labels) as PillarKey[]).map(id=>({
    id,label:labels[id],score:values[id],weight:Math.max(.1,weights[id]),
    effect:values[id]>=75?'positive' as const:values[id]<50?'negative' as const:'neutral' as const,
    preference:id==='climate'?profile?.thermalPreference??'mild':id==='food'?`${found.length}/${wanted.length}`:id==='neighborhood'?String(profile?.budgetMonthlyUsd??2500):String(profile?.openness??5),
    explanation:id==='climate'?`Adequação térmica estimada para sua preferência; ${city.climate.length} meses no seed.`
      :id==='food'?(wanted.length?`${found.length} opção(ões) mock combinam com seus gostos selecionados.`:'Média de afinidade das opções mock de comida.')
        :id==='neighborhood'?`Custo mensal ilustrativo versus seu orçamento (conversão fixa de demonstração: R$ 5 por US$ 1).`
          :`Índice sintético de comunidade internacional, ajustado por abertura cultural ${profile?.openness??5}/10.`,
  }));
  const weightSum=pillars.reduce((sum,item)=>sum+item.weight,0);
  return {overall:Math.round(pillars.reduce((sum,item)=>sum+item.score*item.weight,0)/weightSum),pillars};
}

export function onlyKnownIds<T extends {id:string}>(items:T[],knownIds:ReadonlySet<string>):T[]{return items.filter(item=>knownIds.has(item.id));}
