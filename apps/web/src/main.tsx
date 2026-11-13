import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '@/App';
import '@/design/tokens.css';
import '@/design/accessibility.css';
import '@/i18n';

const root=document.getElementById('root');
if(!root)throw new Error('Elemento raiz do app não encontrado.');
createRoot(root).render(<React.StrictMode><App/></React.StrictMode>);
