import type {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAppStore} from '@/store/appStore';

export function ProtectedRoute({children}:{children:ReactNode}){const account=useAppStore(state=>state.account);return account?children:<Navigate to="/login" replace/>;}
