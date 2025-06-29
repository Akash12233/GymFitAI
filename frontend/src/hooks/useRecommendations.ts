import { useState } from 'react';
import { recommendationService, type PlanInput } from '../services/recommendationService';
import { useNotifications } from '../contexts/NotificationContext';
import { type ApiError } from '../services/api';

interface UseRecommendationsReturn {
  loading: boolean;
  error: ApiError | null;
  createPlan: (input: PlanInput) => Promise<any>;
  chatWithAI: (message: string) => Promise<string>;
  getHistoryPrediction: () => Promise<any>;
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const { addNotification } = useNotifications();

  const createPlan = async (input: PlanInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await recommendationService.createPlanRecommendation(input);
     
      addNotification({
        type: 'success',
        title: 'Plan Created!',
        message: 'Your personalized workout plan has been generated successfully.'
      });
      
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      addNotification({
        type: 'error',
        title: 'Plan Creation Failed',
        message: apiError.message
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const chatWithAI = async (message: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recommendationService.chat(message);
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      addNotification({
        type: 'error',
        title: 'AI Chat Error',
        message: apiError.message
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getHistoryPrediction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await recommendationService.getHistoryPrediction();
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      if (apiError.statusCode === 402) {
        addNotification({
          type: 'warning',
          title: 'Premium Feature',
          message: 'History predictions are available for Pro users only.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Failed to load predictions',
          message: apiError.message
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPlan,
    chatWithAI,
    getHistoryPrediction
  };
};