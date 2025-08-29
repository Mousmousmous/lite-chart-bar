import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug PWA
console.log('PWA Debug: App starting')
console.log('PWA Debug: Service Worker support?', 'serviceWorker' in navigator)
console.log('PWA Debug: Protocol:', window.location.protocol)

createRoot(document.getElementById("root")!).render(<App />);
