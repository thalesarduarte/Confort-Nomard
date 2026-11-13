import {useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {services} from '@/services';
import type {PartnerOffer} from '@/services/types';
import {Button,Card,Modal,Skeleton} from '@/design/components';

export function PartnersPage(){
  const {t}=useTranslation();const [offers,setOffers]=useState<PartnerOffer[]>([]);const [selected,setSelected]=useState<PartnerOffer|null>(null);const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>{let alive=true;void services.business.offers().then(items=>{if(alive){setOffers(items);setStatus('ready');}}).catch(()=>{if(alive)setStatus('error');});return()=>{alive=false;};},[]);
  return <main className="container page page-content"><span className="eyebrow">Provedores fictícios</span><h1>{t('partners.title')}</h1><p className="muted">Conteúdos de demonstração para ajudar você a pensar em perguntas antes de contratar um serviço.</p>{status==='loading'&&<div className="grid grid-auto"><Skeleton/><Skeleton/><Skeleton/></div>}{status==='error'&&<p role="alert" className="error">Não foi possível carregar ofertas locais.</p>}{status==='ready'&&<div className="grid grid-auto">{offers.map(offer=><Card key={offer.id}><span className="pill">{offer.category}</span><h2 style={{marginTop:12}}>{offer.title}</h2><p>{offer.description}</p><p className="muted">{offer.estimate}</p><Button variant="primary" onClick={()=>setSelected(offer)}>{t('partners.offer')}</Button></Card>)}</div>}<p className="notice" style={{marginTop:24}}>Não há links comerciais, ofertas reais, cotações ou contratação nesta demonstração.</p><Modal open={Boolean(selected)} title={selected?.title??''} onClose={()=>setSelected(null)}>{selected&&<div><p>{selected.description}</p><p>{selected.terms}</p><Button variant="quiet" onClick={()=>setSelected(null)}>{t('actions.cancel')}</Button></div>}</Modal></main>;
}
