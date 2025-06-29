
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import PreviousWorkouts from './pages/PreviousWorkouts';
import Pricing from './pages/Pricing';
import Account from './pages/Account';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import "./index.css";

function App() {
  
  return (
   
                <div className="min-h-screen bg-gray-900 text-white">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                     <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Layout><Dashboard /></Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/recommendations"
                    element={
                      <PrivateRoute>
                        <Layout><Recommendations /></Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/workouts"
                    element={
                      <PrivateRoute>
                        <Layout><PreviousWorkouts /></Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <PrivateRoute>
                        <Layout><Pricing /></Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <PrivateRoute>
                        <Layout><Account /></Layout>
                      </PrivateRoute>
                    }
                  />
                  </Routes>
                </div>
              
  );
}

export default App;