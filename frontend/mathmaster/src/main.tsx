import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'katex/dist/katex.min.css';
import './index.css';
import { useAuthStore } from '@/stores/authStore';

useAuthStore.getState().refreshProfile().catch(() => {}).finally(() => useAuthStore.getState().setLoading(false));

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
