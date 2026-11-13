import {Suspense,lazy,useEffect} from 'react';
import {BrowserRouter,Route,Routes,useLocation} from 'react-router-dom';
import {Header,Footer} from '@/app/Shell';
import {ProtectedRoute} from '@/app/ProtectedRoute';
import {useAppStore} from '@/store/appStore';
import i18n from '@/i18n';

const Home=lazy(()=>import('@/features/home/HomePage').then(module=>({default:module.HomePage})));
const Search=lazy(()=>import('@/features/home/SearchPage').then(module=>({default:module.SearchPage})));
const Onboarding=lazy(()=>import('@/features/onboarding/OnboardingPage').then(module=>({default:module.OnboardingPage})));
const City=lazy(()=>import('@/features/city/CityPage').then(module=>({default:module.CityPage})));
const Compare=lazy(()=>import('@/features/compare/ComparePage').then(module=>({default:module.ComparePage})));
const Profile=lazy(()=>import('@/features/profile/ProfilePage').then(module=>({default:module.ProfilePage})));
const Favorites=lazy(()=>import('@/features/favorites/FavoritesPage').then(module=>({default:module.FavoritesPage})));
const Community=lazy(()=>import('@/features/community/CommunityPage').then(module=>({default:module.CommunityPage})));
const Partners=lazy(()=>import('@/features/partners/PartnersPage').then(module=>({default:module.PartnersPage})));
const Business=lazy(()=>import('@/features/b2b/BusinessPage').then(module=>({default:module.BusinessPage})));
const Auth=lazy(()=>import('@/features/auth/AuthPage').then(module=>({default:module.AuthPage})));
const About=lazy(()=>import('@/features/about/AboutPage').then(module=>({default:module.AboutPage})));

function ThemeSync(){const theme=useAppStore(state=>state.theme);const language=useAppStore(state=>state.language);useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.lang=language;void i18n.changeLanguage(language);},[theme,language]);return null;}
function MainContentSync(){const {pathname}=useLocation();useEffect(()=>{const setMainId=()=>document.querySelector<HTMLElement>('main:not([id])')?.setAttribute('id','main-content');setMainId();const observer=new MutationObserver(setMainId);observer.observe(document.querySelector('#root')??document.body,{childList:true,subtree:true});return()=>observer.disconnect();},[pathname]);return null;}
const loading=<main id="main-content" className="container page-content" aria-live="polite"><div className="skeleton"/><p className="muted">Loading local module…</p></main>;

export default function App(){return <BrowserRouter><ThemeSync/><MainContentSync/><Header/><Suspense fallback={loading}><Routes>
  <Route path="/" element={<Home/>}/><Route path="/search" element={<Search/>}/><Route path="/onboarding" element={<Onboarding/>}/><Route path="/city/:cityId" element={<City/>}/>
  <Route path="/compare" element={<Compare/>}/><Route path="/login" element={<Auth/>}/>
  <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/><Route path="/favorites" element={<ProtectedRoute><Favorites/></ProtectedRoute>}/><Route path="/community" element={<ProtectedRoute><Community/></ProtectedRoute>}/>
  <Route path="/partners" element={<Partners/>}/><Route path="/business" element={<Business/>}/><Route path="/about" element={<About/>}/>
  <Route path="*" element={<main id="main-content" className="container page-content"><h1>Página não encontrada</h1><a className="button button-primary" href="/">Voltar ao início</a></main>}/>
</Routes></Suspense><Footer/></BrowserRouter>;}
