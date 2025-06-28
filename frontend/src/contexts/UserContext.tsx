import React, { createContext, useContext, useState, useEffect } from 'react';
import { exerciseService, Exercise, CalorieData } from '../services/exerciseService';
import { plannerService, Planner } from '../services/plannerService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { getTodayString, formatDate } from '../utils/dateUtils';

interface UserStats {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  bodyFat?: number;
  goal: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  workoutsCompleted: number;
  currentStreak: number;
  totalWorkouts: number;
  strengthInfo:{
    maxPushups: number,
    maxPullups: number,
    maxSquats: number,
    maxBenchKg: number,
    maxSquatkg: number,
    maxDeadliftkg: number
  }
}

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
  completed: boolean;
  duration?: number;
  difficulty?: string;
  workoutType?: string;
  targetMuscles?: string[];
}

interface WorkoutExercise {
  id: string;
  name: string;
  avgSets: number;
  avgReps: number;
  weight?: number;
  duration?: number;
  restPeriod?: number;
  instructions?: string;
  completed?:boolean;
  type: string;
  status :{
    completedByUser:  boolean;
    completePercent : number;
    totalSets: number;
    completedSets: number;
    totalReps: number;
    completedReps: number
  }
}

interface UserContextType {
  userStats: UserStats | null;
  workouts: Workout[];
  planners: Planner[];
  calorieData: CalorieData[];
  loading: boolean;
  error: string | null;
  updateUserStats: (stats: Partial<UserStats>) => void;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<boolean>;
  completeExercise: (workoutId: string, exerciseId: string) => boolean;
  clearUserData: () => void;
  getTodaysWorkout: () => Workout | undefined;
  getWorkoutsByDate: (date: string) => Workout[];
  refreshData: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  givenDate: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [calorieData, setCalorieData] = useState<CalorieData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [givenDate, setgivenDate] = useState(getTodayString());
  
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Load data from localStorage and sync with server
  useEffect(() => {
    if (user) {
      loadLocalData();
      syncWithServer();
    } else {
      clearUserData();
    }
  }, [user]);

  const loadLocalData = () => {
    try {
      const storedStats = localStorage.getItem('fitness-user-stats');
      const storedWorkouts = localStorage.getItem('fitness-workouts');
      
      if (storedStats) {
        setUserStats(JSON.parse(storedStats));
      }
      
      if (storedWorkouts) {
        
        setWorkouts(JSON.parse(storedWorkouts));
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const syncWithServer = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user exercises
      const userExercises = await exerciseService.getExercisesByUser();
      
      
      // Convert server exercises to local workout format
      const serverWorkouts =  convertExercisesToWorkouts(userExercises);
      
      setWorkouts(serverWorkouts);
      localStorage.setItem('fitness-workouts', JSON.stringify(serverWorkouts));
      
      // Fetch planners
      const userPlanners = await plannerService.getPlannerByUser();
      setPlanners(userPlanners);
      
      
      // Fetch calorie data
      const calories = await exerciseService.getCaloriesByExercises();
      setCalorieData(calories);
      
      
    } catch (error: any) {
      console.error('Error syncing with server:', error);
      setError(error.message || 'Failed to sync data');
      
      addNotification({
        type: 'warning',
        title: 'Sync Warning',
        message: 'Some data may not be up to date. Check your connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  const convertExercisesToWorkouts = (exercises: Exercise[]): Workout[] => {
    // Group exercises by date and create workouts
    const groupedByDate = exercises.reduce((acc, exercise) => {
      const date = exercise.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(exercise);
      return acc;
    }, {} as Record<string, Exercise[]>);

    return Object.entries(groupedByDate).map(([date, dayExercises]) => {
      const workoutExercises: WorkoutExercise[] = dayExercises.map(ex => ({
        id: ex._id,
        name: ex.name,
        avgSets: ex.avgSets,
        avgReps: ex.avgReps,
        weight: ex.weight, // Not stored in server model
        duration: ex.duration,
        restPeriod: ex.restperoid,
        instructions: ex.description,
        completed: ex.status.completedByUser,
        type: ex.type,
        status: ex.status     
      }));

      const completed = dayExercises.every(ex => ex.status.completedByUser);
      const workoutName = dayExercises[0]?.title || `${date} Workout`;

      return {
        id: `${date}-workout`,
        name: workoutName,
        date,
        exercises: workoutExercises,
        completed,
        estimatedDuration: dayExercises.length * 8 // Rough estimate
      };
    });
  };

  const updateUserStats = (stats: Partial<UserStats>) => {
    const newStats = userStats ? { ...userStats, ...stats } : stats as UserStats;
    setUserStats(newStats);
    localStorage.setItem('fitness-user-stats', JSON.stringify(newStats));
  };

  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: `${workout.date}-${Date.now()}`
    };
    
    setWorkouts(prev => {
      const updated = [...prev, newWorkout];
      localStorage.setItem('fitness-workouts', JSON.stringify(updated));
      return updated;
    });
  };

  const updateWorkout = async (id: string, workoutUpdate: Partial<Workout>): Promise<boolean> => {
    try {   
      setWorkouts(prev => {
        const updated = prev.map(w => {
          if (w.id === id) {
            const updatedWorkout = { ...w, ...workoutUpdate };
              
            // Update user stats if workout is completed
            if (updatedWorkout.completed && !w.completed) {
              setUserStats(prevStats => prevStats ? {
                ...prevStats,
                workoutsCompleted: prevStats.workoutsCompleted + 1,
                totalWorkouts: prevStats.totalWorkouts + 1
              } : null);
            }
            
            return updatedWorkout;
          }
          return w;
        });
        
        localStorage.setItem('fitness-workouts', JSON.stringify(updated));
        return updated;
      });

      // Sync with server if needed
      if (workoutUpdate.completed) {
        await syncWorkoutWithServer(id, workoutUpdate);
      }

      return true;
    } catch (error) {
      console.error('Error updating workout:', error);
      return false;
    }
  };

  const syncWorkoutWithServer = async (workoutId: string, workoutUpdate: Partial<Workout>) => {
    try {
      const workout = workouts.find(w => w.id === workoutId);
      if (!workout) return;

      // Convert workout exercises to server format and update
      const exerciseUpdates = workout.exercises.map(ex => ({
        _id: ex.id,
        status: {
          completedByUser: workoutUpdate.completed || false,
          totalSets: ex.avgSets,
          completedSets: ex.status.completedByUser ? ex.avgSets : 0,
          totalReps: ex.status.completedByUser ? ex.status.totalReps: 0,
          completedReps: ex.status.completedByUser ? ex.status.totalReps : 0,
          completePercent: ex.status.completedByUser ? 100 : 0
        }
      }));

      await exerciseService.updateExerciseStatus(exerciseUpdates);
    } catch (error) {
      console.error('Error syncing workout with server:', error);
    }
  };

  const completeExercise = (workoutId: string, exerciseId: string): boolean => {
    try {
      setWorkouts(prev => {
        const updated = prev.map(workout => 
          workout.id === workoutId 
            ? {
                ...workout,
                exercises: workout.exercises.map(exercise =>
                  exercise.id === exerciseId 
                    ? { ...exercise, status: { ...exercise.status, completedByUser: true } }
                    : exercise
                )
              }
            : workout
        );
        
        localStorage.setItem('fitness-workouts', JSON.stringify(updated));
        return updated;
      });
      
      return true;
    } catch (error) {
      console.error('Error completing exercise:', error);
      return false;
    }
  };

  const clearUserData = () => {
    setUserStats(null);
    setWorkouts([]);
    setPlanners([]);
    setCalorieData([]);
    setError(null);
    localStorage.removeItem('fitness-user-stats');
    localStorage.removeItem('fitness-workouts');
  };

  const getTodaysWorkout = (): Workout | undefined => {
  const today = getTodayString();
  // workouts.forEach((w, index) => {
  //   console.log(today)
  //   console.log(`Workout ${index + 1}:`,  w.date.split('T')[0], "| Completed:", w.completed);
  // });

  return workouts.find(w => w.date.split('T')[0] === today && !w.completed);
};
  const getWorkoutsByDate = (date: string): Workout[] => {
    // console.log("workouts",workouts);
    
    return workouts.filter((w, i) =>{
      return w.date === date +"T00:00:00.000Z";
    });
  };

  const refreshData = async () => {
    await syncWithServer();
  };

  return (
    <UserContext.Provider value={{
      userStats,
      workouts,
      planners,
      calorieData,
      loading,
      error,
      updateUserStats,
      addWorkout,
      updateWorkout,
      completeExercise,
      clearUserData,
      getTodaysWorkout,
      getWorkoutsByDate,
      refreshData,
      syncWithServer,
      givenDate
    }}>
      {children}
    </UserContext.Provider>
  );
};