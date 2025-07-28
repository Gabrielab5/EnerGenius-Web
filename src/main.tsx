import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Import i18n configuration
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { AppInitializer } from './components/ui-components/AppInitializer.tsx';

const root = createRoot(document.getElementById("root")!);

root.render(
  <BrowserRouter>
    <AppInitializer>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AppInitializer>
  </BrowserRouter>
);
