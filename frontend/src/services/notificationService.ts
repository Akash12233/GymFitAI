import { apiClient, retryRequest, type ApiResponse } from './api';

// Notification Types
interface Notification {
  _id?: string;
  userId?: string;
  message: string;
  date: string;
  seen?: boolean;
  createdAt?: string;
}

class NotificationService {
  // Get notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<Notification[]>>('/notifications/getnotifications')
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Add notification
  async addNotification(message: string, date: string): Promise<Notification> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<Notification>>('/notifications/addnotification', {
          message,
          date
        })
      );
      
      return response;
    } catch (error) {
      console.error('Failed to add notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export type { Notification };