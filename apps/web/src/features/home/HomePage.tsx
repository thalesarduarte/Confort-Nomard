import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {services} from '@/services';
import type {City,ProfilePatch} from '@/services/types';
import {useAppStore} from '@/store/appStore';
import {Button,Card,Chip,Skeleton} from '@/design/components';
import {formatMoneyFromBrl} from '@/domain/money';

export function HomePage(){
  const {t,i18n}=useTranslation();const profile=useAppStore(state=>state.profile);const tempProfile=useAppStore(state=>state.tempProfile);const currency=useAppStore(state=>state.currency);const activeProfile:ProfilePatch|null=profile??tempProfile;
  const [cities,setCities]=useState<City[]>([]);const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');const [retry,setRetry]=useState(0);
  useEffect(()=>{let alive=true;setStatus('loading');void services.recommendations.forProfile(activeProfile,4).then(async recommendations=>{const results=await Promise.all(recommendations.map(item=>services.cities.detail(item.cityId)));if(alive){setCities(results.filter((item):item is City=>item!==null));setStatus('ready');}}).catch(()=>{if(alive)setStatus('error');});return()=>{alive=false;};},[activeProfile,retry]);
  return <main id="main-content" className="container page page-content">
    <section className="hero"><div className="hero-copy"><span className="eyebrow">✳ {t('home.eyebrow')}</span><h1>{t('home.title')}</h1><p>{t('home.description')}</p><div className="row"><Link className="button button-primary" to="/onboarding">{t('actions.start')} <span aria-hidden="true">→</span></Link><Link className="button button-quiet" to="/search">{t('actions.explore')}</Link></div><div className="row" style={{marginTop:20}}><Chip>{t('ui.cityCount')}</Chip><Chip>{t('ui.arrivalPlan')}</Chip><Chip>{t('ui.localOnly')}</Chip></div></div><div className="hero-art" aria-hidden="true"><span className="floating-note one">🌤 {t('ui.weatherRoutine')}</span><span className="hero-orb"/><span className="floating-note two">🍲 {t('ui.familiarFlavors')}</span><span className="floating-note three">🏡 {t('ui.nextNeighborhood')}</span></div></section>
    <section className="section"><div className="row spread"><div><span className="eyebrow">01 / {t('home.featured')}</span><h2>{t('home.how')}</h2><p className="muted">{t('home.howBody')}</p></div><Link to="/search">{t('actions.explore')} →</Link></div>
      {status==='loading'&&<div className="grid grid-auto" aria-live="polite">{[0,1,2,3].map(id=><Skeleton key={id}/>)}</div>}
      {status==='error'&&<Card><p role="alert">{t('common.error')}</p><Button onClick={()=>setRetry(value=>value+1)}>{t('actions.next')}</Button></Card>}
      {status==='ready'&&<div className="grid grid-auto">{cities.map((city,index)=><Link className="city-card" key={city.id} to={`/city/${city.id}`}><div><span className="pill">{index===0?t('ui.topMatch'):`${t('ui.option')} ${index+1}`}</span><h3 style={{marginTop:14}}>{city.name}</h3><p className="muted" style={{marginBottom:8}}>{city.country} · {city.language}</p><small>{t('common.monthly')}: {formatMoneyFromBrl(city.monthlyBrl,currency,i18n.language)}</small></div></Link>)}</div>}
    </section>
    <section className="section grid grid-3"><Card><span className="eyebrow">01 · {t('ui.understand')}</span><h3>{t('ui.criteria')}</h3><p className="muted">{t('ui.criteriaBody')}</p></Card><Card><span className="eyebrow">02 · {t('nav.compare')}</span><h3>{t('ui.compareWeights')}</h3><p className="muted">{t('ui.compareWeightsBody')}</p></Card><Card><span className="eyebrow">03 · {t('ui.prepare')}</span><h3>{t('ui.prepareMove')}</h3><p className="muted">{t('ui.prepareMoveBody')}</p></Card></section>
    <section className="section"><Card className="grid grid-2"><div><span className="eyebrow">{t('home.quotes')}</span><h2>“{t('home.quote')}”</h2><p className="muted">— {t('home.author')}</p></div><div className="notice">{t('ui.dataDisclaimer')}</div></Card></section>
  </main>;
}
