import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { AppRoutes } from '@/routes';
import { useUiStore } from '@/store/ui.store';

export function App() {
  const { theme } = useUiStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
