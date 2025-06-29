import { apiClient, retryRequest, type ApiResponse } from './api';

// Transaction Types
interface Transaction {
  _id?: string;
  userId?: string;
  planAmount: number;
  amount: number;
  amountInWords: string;
  transactionDate: string;
  transactionId: string;
  platform: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  premiumExpiry?: string;
  createdAt?: string;
}

class TransactionService {
  // Get transactions by user
  async getTransactionsByUser(): Promise<Transaction[]> {
    try {
      const response = await retryRequest(() => 
        apiClient.get<ApiResponse<Transaction[]>>('/transaction/transactionbyuser')
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      throw error;
    }
  }

  // Save transaction
  async saveTransaction(transaction: Omit<Transaction, '_id' | 'createdAt'>): Promise<Transaction> {
    try {
      const response = await retryRequest(() => 
        apiClient.post<ApiResponse<Transaction>>('/transaction/savetransaction', { transaction })
      );
      
      return response;
    } catch (error) {
      console.error('Failed to save transaction:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export type { Transaction };