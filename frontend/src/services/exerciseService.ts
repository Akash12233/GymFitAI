import { apiClient, retryRequest, type ApiResponse } from './api';

// Exercise Types
interface GymExercise {
  _id: string;
  Title: string;
  Desc: string;
  Type: string;
  BodyPart: string;
  Equipment: string;
  Level: string;
  Rating: number;
  RatingDesc: string;
}

interface Exercise {
  _id: string;
  userId: string;
  id: number;
  name: string;
  title: string;
  date: string;
  description: string;
  shortDescription: string;
  type: 'strength' | 'cardio' | 'flexibility';
  bodyPart: string;
  equipment: string;
  level: string;
  weight: number;
  duration: number,
  restperoid: number,
  instructions: string,
  difficultyTag: string;
  avgSets: number;
  avgReps: number;
  calorieBurnPerRep: number;
  status: {
    completedByUser: boolean;
    completePercent: number;
    totalSets: number;
    completedSets: number;
    totalReps: number;
    completedReps: number;
  };
  rating: number;
  ratingDesc: string;
  createdAt: string;
}

interface CalorieData {
  date: string;
  totalCaloriesBurnt: number;
  completionPercent: number;
}

class ExerciseService {
  // Get all gym exercises
  async getGymExercises(): Promise<GymExercise[]> {
    try {
      // console.log("1")
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<GymExercise[]>>('/exercise/getgymexercises')
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch gym exercises:', error);
      throw error;
    }
  }

  // Get gym exercise by ID
  async getGymExerciseById(id: string): Promise<GymExercise> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<GymExercise>>(`/exercise/gymexercises/${id}`)
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch gym exercise:', error);
      throw error;
    }
  }

  // Search exercises by title
  async searchExercises(query: string): Promise<GymExercise[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<GymExercise[]>>(`/exercise/search?query=${encodeURIComponent(query)}`)
      );
      
      return response;
    } catch (error) {
      console.error('Failed to search exercises:', error);
      throw error;
    }
  }

  // Add new gym exercise
  async addGymExercise(exercise: Omit<GymExercise, '_id'>): Promise<GymExercise> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<GymExercise>>('/exercise/addgymexercises', { exercise })
      );
      
      return response;
    } catch (error) {
      console.error('Failed to add gym exercise:', error);
      throw error;
    }
  }

  // Get exercises by day
  async getExercisesByDay(date: string): Promise<Exercise[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<Exercise[]>>('/statusexercise/exercisesbyday', { date })
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch exercises by day:', error);
      throw error;
    }
  }

  // Get exercises by user
  async getExercisesByUser(): Promise<Exercise[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<Exercise[]>>('/statusexercise/exercisebyuser')
      );
      // console.log(response)
      return response;
    } catch (error) {
      console.error('Failed to fetch user exercises:', error);
      throw error;
    }
  }

  // Update exercise status
  async updateExerciseStatus(exercises: Partial<Exercise>[]): Promise<void> {
    try {
      await retryRequest(() => 
        apiClient.post<ApiResponse<void>>('/statusexercise/exerciseupdated', { exercises })
      );
    } catch (error) {
      console.error('Failed to update exercise status:', error);
      throw error;
    }
  }

  // Get calories by exercises
  async getCaloriesByExercises(): Promise<CalorieData[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<CalorieData[]>>('/statusexercise/caloriesbyexercises')
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch calories data:', error);
      throw error;
    }
  }
}

export const exerciseService = new ExerciseService();
export type { GymExercise, Exercise, CalorieData };