import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  const container = document.getElementById('root');
  if (!container) throw new Error("Root element not found");
  
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("React Init Error:", error);
  document.body.innerHTML = `<div style="color:red;padding:20px;background:black"><h1>React Error</h1><pre>${error.message}</pre></div>`;
}
