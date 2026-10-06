import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } } });

export default function App() {
  return <ErrorBoundary><QueryClientProvider client={queryClient}><BrowserRouter><AppRoutes /></BrowserRouter><Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px', background: '#1E293B', color: '#F8FAFC', fontSize: '14px' } }} /></QueryClientProvider></ErrorBoundary>;
}
