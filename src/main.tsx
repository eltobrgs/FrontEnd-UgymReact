import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import RegisterSW from './components/pwa/RegisterSW';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <RegisterSW />
  </React.StrictMode>,
);
