import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import AppRouter from '../client/AppRouter';
import { I18nProvider } from '../client/i18n/I18nProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
);
