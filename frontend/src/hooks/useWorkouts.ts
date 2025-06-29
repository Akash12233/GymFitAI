import { useState, useEffect } from 'react';
import { exerciseService, type Exercise } from '../services/exerciseService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { type ApiError } from '../services/api';

interface UseWorkoutsReturn {
  exercises: Exercise[];
  loading: boolean;
  error: ApiError | null;
  refreshExercises: () => Promise<void>;
  updateExerciseStatus: (exercises: Partial<Exercise>[]) => Promise<void>;
  getExercisesByDate: (date: string) => Promise<Exercise[]>;
}

export const useWorkouts = (): UseWorkoutsReturn => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const refreshExercises = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userExercises = await exerciseService.getExercisesByUser();
      setExercises(userExercises);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      addNotification({
        type: 'error',
        title: 'Failed to load workouts',
        message: apiError.message
      });
    } finally {
      setLoading(false);
    }
  };

  const updateExerciseStatus = async (exerciseUpdates: Partial<Exercise>[]) => {
    try {
      await exerciseService.updateExerciseStatus(exerciseUpdates);
      
      // Update local state
      setExercises(prev => 
        prev.map(exercise => {
          const update = exerciseUpdates.find(u => u._id === exercise._id);
          return update ? { ...exercise, ...update } : exercise;
        })
      );
      
      addNotification({
        type: 'success',
        title: 'Progress Updated',
        message: 'Your workout progress has been saved!'
      });
    } catch (err) {
      const apiError = err as ApiError;
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: apiError.message
      });
      throw err;
    }
  };

  const getExercisesByDate = async (date: string): Promise<Exercise[]> => {
    try {
      return await exerciseService.getExercisesByDay(date);
    } catch (err) {
      const apiError = err as ApiError;
      addNotification({
        type: 'error',
        title: 'Failed to load exercises',
        message: apiError.message
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      refreshExercises();
    }
  }, [user]);

  return {
    exercises,
    loading,
    error,
    refreshExercises,
    updateExerciseStatus,
    getExercisesByDate
  };
};