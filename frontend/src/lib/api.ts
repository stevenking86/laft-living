import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}


class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session-based auth
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/v1/users');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/api/v1/users/${id}`);
  }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return this.request<User>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({ user }),
    });
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    return this.request<User>(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ user }),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ user: User }>('/api/v1/auth/me');
    return response.user;
  }

  async signup(name: string, email: string, password: string, passwordConfirmation: string): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({ 
        user: { 
          name, 
          email, 
          password, 
          password_confirmation: passwordConfirmation 
        } 
      }),
    });
  }

  // Units endpoints
  async getUnits(): Promise<any[]> {
    return this.request<any[]>('/api/v1/units');
  }

}

export const apiService = new ApiService(API_BASE_URL);
