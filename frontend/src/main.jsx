import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ResponsiveVideoGrid from './components/ResponsiveVideoGrid'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResponsiveVideoGrid />
  </StrictMode>,
)
