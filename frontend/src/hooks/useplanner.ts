import { useState } from "react";
import { plannerService } from "../services/plannerService";
import { type ApiError } from "../services/api";
import { useNotifications } from "../contexts/NotificationContext";

interface UsePlannerReturn {
  loading: boolean;
  error: ApiError | null;
  getPlanner: () => Promise<any>;
  getPlannerReport: () => Promise<any>;
}

export const usePlanner = (): UsePlannerReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const { addNotification } = useNotifications();

  const getPlanner = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await plannerService.getPlannerByUser();
     
      addNotification({
        type: 'success',
        title: 'Plan fetched!',
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

  const getPlannerReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await plannerService.getPlannerReport();
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

  return {
    loading,
    error,
    getPlanner,
    getPlannerReport
  };
};