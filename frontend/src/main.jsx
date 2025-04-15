import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-d5w2kxikwmretd2l.us.auth0.com"
    clientId="R645IdkhV3VAKnJA4Fx7GMp9GysPVhsi"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
)
