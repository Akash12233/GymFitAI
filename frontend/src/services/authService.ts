
import { apiClient, retryRequest, type ApiResponse } from './api';
interface AutoFillData {
  // Personal Info
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  bodyFat?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';

  strengthInfo:{
    maxPushups: number,
    maxPullups: number,
    maxSquats: number,
    maxBenchKg: number,
    maxSquatkg: number,
    maxDeadliftkg: number
  }
  
  // Goals & Preferences
  goal?: string;
  daysPerWeek?: number;
  sessionDuration?: number;
  availableTime?: string;
  
  // Equipment & Style
  equipment?: string;
  workoutStyle?: string;
  limitations?: string;
  
  // Additional metadata
  lastUpdated?: string;
  planCount?: number;
}

interface ProfileForm {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  bodyFat?: number;
  bodyType: string;
  bodyTypeNotes: string;
}
// Auth Types
interface LoginRequest {
  email: string;
  password: string;
}

interface WorkoutPhotos {
  id: string;
  url: string;
  date: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    profile: any;
    tier: 'free' | 'premium';
    premiumExpiry: Date | null;
    workoutPhotos: string[]; // Cloudinary URLs
    strengthInfo: any;
    preferences: any;
  };
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
   _id?: string;
  email: string;
  workoutPhotos: string[]; // Cloudinary URLs
  avatar?: string; // URL to user's avatar image
  profile: {
    name?: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    bodytype?: string;
    weightKg?: number;
    heightCm?: number;
    bodyfat?: number;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    currentStreak: number;
    workoutsCompleted: number;
    totalWorkouts: number;
  };

  strengthInfo: {
    maxPushups: number;
    maxPullups: number;
    maxSquats: number;
    maxBenchKg: number;
    maxSquatkg: number;
    maxDeadliftkg: number;
  };

  premiumExpiry: Date | null;
  tier: 'free' | 'premium';

  preferences: {
    goal?: string;
    daysPerWeek?: number;
    planStyle?: string;
    sessionDuration?: number;
    equipment?: string;
    limitations?: string; 
    availableTime?: string;
}

};

function transformToAutoFill(user: any): AutoFillData {
  const profile = user.profile || {};
  const preferences = user.preferences || {};
  const strengthInfo = user.strengthInfo || {};

  const autoFill: AutoFillData = {
    // Personal Info
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    height: profile.heightCm,
    weight: profile.weightKg,
    bodyFat: profile.bodyfat,
    fitnessLevel: profile.experienceLevel,

    // Strength Info
    strengthInfo: {
      maxPushups: strengthInfo.maxPushups ?? 0,
      maxPullups: strengthInfo.maxPullups ?? 0,
      maxSquats: strengthInfo.maxSquats ?? 0,
      maxBenchKg: strengthInfo.maxBenchKg ?? 0,
      maxSquatkg: strengthInfo.maxSquatkg ?? 0,
      maxDeadliftkg: strengthInfo.maxDeadliftkg ?? 0
    },

    // Preferences & Goals
    goal: preferences.goal,
    daysPerWeek: preferences.daysPerWeek,
    sessionDuration: preferences.sessionDuration,
    availableTime: preferences.availableTime,
    equipment: preferences.equipment,
    workoutStyle: preferences.planStyle, // mapped from `planStyle`
    limitations: preferences.limitations,

    // Additional metadata
    lastUpdated: user.updatedAt ?? new Date().toISOString(), // or omit if not needed
    planCount: user.totalPlans ?? 0 // optional, if you track plan count
  };

  return autoFill;
}

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AuthResponse = await retryRequest(() => 
        apiClient.post<ApiResponse<AuthResponse>>('/user/login', credentials)
      );
      
      // Store tokens
      localStorage.setItem('fitness-access-token', response.accessToken);
      localStorage.setItem('fitness-refresh-token', response.refreshToken);
      localStorage.setItem('fitness-user', JSON.stringify(response.user));
      localStorage.setItem('fitness-autofill-data', JSON.stringify(transformToAutoFill(response.user)));
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register user
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response: User = await retryRequest(() => 
        
        apiClient.post<ApiResponse<User>>('/user/register', userData)
      );
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('fitness-access-token');
      localStorage.removeItem('fitness-refresh-token');
      localStorage.removeItem('fitness-user');
      localStorage.removeItem('fitness-user-stats');
      localStorage.removeItem('fitness-workouts');
      localStorage.removeItem('fitness-autofill-data');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response: User = await retryRequest(() => 
        apiClient.get<ApiResponse<User>>('/user/current-user')
      );
      
      // Update stored user data
      localStorage.setItem('fitness-user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData: any): Promise<User> {
    try {
      
      
      
      const response: User = await retryRequest(() => 
        apiClient.post<ApiResponse<User>>('/user/updateprofile', {input: profileData})
      );
      
      // Update stored user data
      localStorage.setItem('fitness-user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  async updateAccountDetails(accountData:ProfileForm ): Promise<User> {
      try {
        const response: User = await retryRequest(() => 
          apiClient.patch<ApiResponse<User>>('/user/update-account', {input: accountData})
        );
        
        // Update stored user data
        localStorage.setItem('fitness-user', JSON.stringify(response));
        
        return response;
      } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
  }

 async uploadWorkoutPhotos(photos: FileList): Promise<void> {
    try {
      const formData = new FormData();

      for (let i = 0; i < photos.length; i++) {
        formData.append("workoutphotos", photos[i]);
      }

      await retryRequest(() =>
        apiClient.post<ApiResponse<void>>("/user/workoutphotos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    } catch (error) {
      console.error("Photo upload failed:", error);
      throw error;
    }
}


  async getWorkoutPhotos  ():Promise<WorkoutPhotos[]>{
    try {
      const response: WorkoutPhotos[] = await retryRequest(() => 
        apiClient.get<ApiResponse<WorkoutPhotos[]>>('/user/getworkoutphotos')
      );
      return response;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      await retryRequest(() => 
        apiClient.post<ApiResponse<void>>('/user/change-password', {
          oldPassword,
          newPassword
        })
      );
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
      return false;
    }
  }

  // Add device token for push notifications
  async addDeviceToken(token: string): Promise<void> {
    try {
      await retryRequest(() => 
        apiClient.post<ApiResponse<void>>('/user/adddevicetoken', { token })
      );
    } catch (error) {
      console.error('Failed to add device token:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {

    return !!localStorage.getItem('fitness-access-token');
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('fitness-user');
    return userData ? JSON.parse(userData) : null;
  }

  // authService.ts
 loginWithGoogle = async (googleToken: string) => {
  const response = await apiClient.post('/auth/google', {
    token: googleToken,
  });

  const { accessToken, refreshToken, user } = response.data.data;

  localStorage.setItem('fitness-access-token', accessToken);
  localStorage.setItem('fitness-refresh-token', refreshToken);
  localStorage.setItem('fitness-user', JSON.stringify(user));

  return { user };
};

}

export const authService = new AuthService();
export type { LoginRequest, RegisterRequest, AuthResponse, User };