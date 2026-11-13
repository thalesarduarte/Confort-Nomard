import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {services} from '@/services';
import type {City} from '@/services/types';
import {Card,Skeleton} from '@/design/components';
import {formatMoneyFromBrl} from '@/domain/money';
import {useAppStore} from '@/store/appStore';

export function SearchPage(){
  const {t,i18n}=useTranslation();const currency=useAppStore(state=>state.currency);
  const [cities,setCities]=useState<City[]>([]);const [query,setQuery]=useState('');const [maxBudget,setMaxBudget]=useState(0);const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>{let alive=true;setStatus('loading');const timer=setTimeout(()=>{const request=query.trim()?services.cities.search(query):services.cities.list();void request.then(async summaries=>{const full=await Promise.all(summaries.map(city=>services.cities.detail(city.id)));if(alive){setCities(full.filter((city):city is City=>city!==null));setStatus('ready');}}).catch(()=>{if(alive)setStatus('error');});},query?220:0);return()=>{alive=false;clearTimeout(timer);};},[query]);
  const filtered=cities.filter(city=>!maxBudget||city.monthlyBrl<=maxBudget);
  return <main id="main-content" className="container page page-content"><span className="eyebrow">{t('ui.searchEyebrow')}</span><h1>{t('ui.searchTitle')}</h1><p className="muted">{t('ui.searchBody')}</p><Card className="grid grid-2" style={{marginBottom:22}}><label className="field">{t('ui.cityOrCountry')}<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={t('ui.searchPlaceholder')} autoComplete="off" aria-label={t('ui.cityOrCountry')}/></label><label className="field">{t('ui.maxMonthly')}<select value={maxBudget} onChange={event=>setMaxBudget(Number(event.target.value))}><option value={0}>{t('ui.anyCost')}</option>{[4000,5000,6500,9000].map(value=><option key={value} value={value}>{t('ui.upTo',{value:formatMoneyFromBrl(value,currency,i18n.language)})}</option>)}</select></label></Card>
    {status==='loading'&&<div className="grid grid-auto" aria-live="polite">{[0,1,2,3].map(item=><Skeleton key={item}/>)}</div>}{status==='error'&&<p role="alert" className="error">{t('ui.searchError')}</p>}{status==='ready'&&filtered.length===0&&<Card><p>{t('ui.noResults')}</p></Card>}
    {status==='ready'&&filtered.length>0&&<div className="grid grid-auto">{filtered.map(city=><Link className="city-card" to={`/city/${city.id}`} key={city.id}><div><span className="pill">{city.countryCode}</span><h2 style={{marginTop:12}}>{city.name}</h2><p className="muted">{city.country} · {city.language}</p><p style={{marginBottom:0}}>{t('common.monthly')}: {formatMoneyFromBrl(city.monthlyBrl,currency,i18n.language)}</p></div></Link>)}</div>}
  </main>;
}
