import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SiteProvider } from './store';
import './styles.css';
import './smart.css';
import './theme.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><SiteProvider><App /></SiteProvider></React.StrictMode>);
