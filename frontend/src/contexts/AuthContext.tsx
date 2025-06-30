import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type User, type LoginRequest, type RegisterRequest } from '../services/authService';
import { useNotifications } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loginWithGoogle: (googleToken: string) => Promise<boolean>;
  isLoading: boolean;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Check for stored auth and validate with server
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            
            // Validate token with server
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              // Token is invalid, clear auth
              await authService.logout();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginWithGoogle = async (googleToken: string): Promise<boolean> => {
  setIsLoading(true);
  try {
    const response = await authService.loginWithGoogle(googleToken);
    setUser({
      ...response.user,
      workoutPhotos: response.user.workoutPhotos ?? [],
      strengthInfo: response.user.strengthInfo ?? {},
      premiumExpiry: response.user.premiumExpiry ?? null,
      preferences: response.user.preferences ?? {},
    });

    addNotification({
      type: 'success',
      title: 'Logged In with Google!',
      message: 'Welcome back!'
    });

    return true;
  } catch (error: any) {
    addNotification({
      type: 'error',
      title: 'Google Login Failed',
      message: error.message || 'Failed to log in with Google'
    });
    return false;
  } finally {
    setIsLoading(false);
  }
};


  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in.'
      });
      
      return true;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid email or password'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.register(userData);
      
      // Auto-login after registration
      const loginSuccess = await login(userData);
      
      if (loginSuccess) {
        addNotification({
          type: 'success',
          title: 'Account Created!',
          message: 'Welcome to FitAI! Your account has been created successfully.'
        });
      }
      
      return loginSuccess;
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create account'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      
      addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.'
      });
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const clearSession = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading,
      clearSession,
      loginWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};