import { useEffect } from 'react';

// Este componente registra o service worker manualmente se necessário
export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Registra o service worker quando o componente é montado
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.error('Falha ao registrar o Service Worker:', error);
        });
    }
  }, []);

  return null; // Este componente não renderiza nada
} 