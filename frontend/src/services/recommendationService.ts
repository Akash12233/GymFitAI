import { apiClient, retryRequest, type ApiResponse } from './api';

// Recommendation Types
interface PlanInput {
  date: string;
  profile: {
    name: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    weightKg: number;
    heightCm: number;
    bodyfat?: number;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    maxPushups?: number;
    maxPullups?: number;
    maxSquats?: number;
  };
  preferences: {
    goal: string;
    daysPerWeek: number;
    planStyle: string;
  };
}

interface PlanRecommendationResponse {
  _id: string;
  userId: string;
  days: any[];
  nutrition: string[];
  recommendations: string[];
  goals: string[];
  prediction: string[];
}

interface UpdateExercisesRequest {
  preWorkoutTaken: boolean;
  energyToday: 'low' | 'medium' | 'high';
  soreBodyParts: string;
  date: string;
}

class RecommendationService {
  // Create plan recommendation
  async createPlanRecommendation(input: PlanInput): Promise<PlanRecommendationResponse> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<PlanRecommendationResponse>>('/recommendation/planrecommendation', { input })
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create plan recommendation:', error);
      throw error;
    }
  }

  // Get history prediction (Premium feature)
  async getHistoryPrediction(): Promise<{
    nutrition: string[];
    recommendations: string[];
    goals: string[];
    prediction: string[];
    progressData:[{
      date: string;
      weight: number;
      BodyFat: number;
    }];
    BodyType: string;
  }> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<any>>('/recommendation/historyprediction')
      );
      
      return response;
    } catch (error) {
      console.error('Failed to get history prediction:', error);
      throw error;
    }
  }

  // AI Chat
  async chat(message: string): Promise<string> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<string>>('/recommendation/chat', { chat: message })
      );
      
      return response;
    } catch (error) {
      console.error('AI chat failed:', error);
      throw error;
    }
  }

  // Update exercises based on user condition (Premium feature)
  async updateExercises(data: UpdateExercisesRequest): Promise<any> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<any>>('/recommendation/updateexercises', data)
      );
      
      return response;
    } catch (error) {
      console.error('Failed to update exercises:', error);
      throw error;
    }
  }
}

export const recommendationService = new RecommendationService();
export type { PlanInput, PlanRecommendationResponse, UpdateExercisesRequest };