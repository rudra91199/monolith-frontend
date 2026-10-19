import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import { router } from './Routes/Routes.jsx';
import { VillageProvider } from './Context/VillageContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VillageProvider>
      <RouterProvider router={router} />
    </VillageProvider>
  </StrictMode>,
);