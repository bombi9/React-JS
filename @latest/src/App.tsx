import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Styles/Background.css'
import './Styles/Form.css'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="stars-container">
      <div className="stars"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>

    <br/><br/><br/>
    </div>
  </StrictMode>
)