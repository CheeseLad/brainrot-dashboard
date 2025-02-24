import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import VideoGrid from './components/VideoGrid'
import DraggableImage from './components/DraggableImage'
import DraggableNew from './components/DraggableNew'
import MyResponsiveGrid from './components/MyResponsiveGrid'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyResponsiveGrid />
  </StrictMode>,
)
