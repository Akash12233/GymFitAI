
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { AutoFillProvider } from './contexts/AutoFillContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { UserProvider } from './contexts/UserContext'
import { GoogleOAuthProvider } from '@react-oauth/google';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <UserProvider>
              <AutoFillProvider>
    <App />
    </AutoFillProvider>
                </UserProvider>
              </AuthProvider>
            </NotificationProvider>
          </Router>
  </GoogleOAuthProvider>
        </ErrorBoundary>
  
)