import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user?: User;
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
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

  // Post endpoints
  async getPosts(): Promise<Post[]> {
    return this.request<Post[]>('/api/v1/posts');
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/api/v1/posts/${id}`);
  }

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    return this.request<Post>('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify({ post }),
    });
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post> {
    return this.request<Post>(`/api/v1/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ post }),
    });
  }

  async deletePost(id: number): Promise<void> {
    return this.request<void>(`/api/v1/posts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
