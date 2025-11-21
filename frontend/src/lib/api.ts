import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface User {
  id: number;
  email: string;
  role?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: number;
  ticket_number: string;
  category: string;
  description: string;
  preferred_entry_time?: string;
  resident_must_be_home: boolean;
  urgency_level: string;
  status: string;
  admin_notes?: string;
  resident_visible_notes?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  property: {
    id: number;
    name: string;
    address: string;
  };
  unit?: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    email: string;
  };
  assigned_maintenance_user?: {
    id: number;
    email: string;
  } | null;
  photos: string[];
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

  async signup(email: string, password: string, passwordConfirmation: string): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({ 
        user: { 
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

  async getUnit(id: number): Promise<any> {
    return this.request<any>(`/api/v1/units/${id}`);
  }

  // Rental Applications endpoints
  async getRentalApplications(): Promise<any[]> {
    return this.request<any[]>('/api/v1/rental_applications');
  }

  async createRentalApplication(application: {
    property_id: number;
    unit_id: number;
    unit_monthly_price_id: number;
    move_in_date: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
  }): Promise<any> {
    return this.request<any>('/api/v1/rental_applications', {
      method: 'POST',
      body: JSON.stringify({ rental_application: application }),
    });
  }

  async getRentalApplication(id: number): Promise<any> {
    return this.request<any>(`/api/v1/rental_applications/${id}`);
  }

  // Verification endpoints
  async uploadIdVerification(
    rentalApplicationId: number,
    idImage: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append('id_image', idImage);
    
    const url = `${this.baseUrl}/api/v1/rental_applications/${rentalApplicationId}/verifications`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getVerification(rentalApplicationId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/rental_applications/${rentalApplicationId}/verifications/show_by_application`
    );
  }

  async verifyId(rentalApplicationId: number, verificationId: number): Promise<any> {
    return this.request<any>(
      `/api/v1/rental_applications/${rentalApplicationId}/verifications/${verificationId}/verify`,
      {
        method: 'POST',
      }
    );
  }

  // Leases endpoints
  async getLeases(): Promise<any[]> {
    return this.request<any[]>('/api/v1/leases');
  }

  async createLease(rentalApplicationId: number): Promise<any> {
    return this.request<any>('/api/v1/leases', {
      method: 'POST',
      body: JSON.stringify({ rental_application_id: rentalApplicationId }),
    });
  }

  // Payment endpoints
  async getOutstandingPayments(): Promise<{
    outstanding_payments: any[];
    total_amount: number;
    has_overdue: boolean;
    overdue_payments: any[];
  }> {
    return this.request('/api/v1/payments/outstanding');
  }

  async getLastPayment(): Promise<{ last_paid_date: string | null }> {
    return this.request('/api/v1/payments/last_paid');
  }

  async createPaymentIntent(): Promise<{
    session_id: string;
    url: string;
    amount: number;
  }> {
    return this.request('/api/v1/payments/create_intent', {
      method: 'POST',
    });
  }

  async confirmPayment(sessionId: string): Promise<{
    message: string;
    payments: any[];
  }> {
    return this.request('/api/v1/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  // Maintenance Request endpoints
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return this.request<MaintenanceRequest[]>('/api/v1/maintenance_requests');
  }

  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest> {
    return this.request<MaintenanceRequest>(`/api/v1/maintenance_requests/${id}`);
  }

  async createMaintenanceRequest(data: {
    category: string;
    description: string;
    preferred_entry_time?: string;
    resident_must_be_home: boolean;
    urgency_level: string;
    photos?: File[];
  }): Promise<MaintenanceRequest> {
    const formData = new FormData();
    formData.append('maintenance_request[category]', data.category);
    formData.append('maintenance_request[description]', data.description);
    if (data.preferred_entry_time) {
      formData.append('maintenance_request[preferred_entry_time]', data.preferred_entry_time);
    }
    formData.append('maintenance_request[resident_must_be_home]', data.resident_must_be_home.toString());
    formData.append('maintenance_request[urgency_level]', data.urgency_level);
    
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });
    }

    const url = `${this.baseUrl}/api/v1/maintenance_requests`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateMaintenanceRequest(id: number, data: {
    urgency_level?: string;
    status?: string;
    assigned_maintenance_user_id?: number;
    admin_notes?: string;
    resident_visible_notes?: string;
  }): Promise<MaintenanceRequest> {
    return this.request<MaintenanceRequest>(`/api/v1/maintenance_requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ maintenance_request: data }),
    });
  }

  async addMaintenanceRequestPhotos(id: number, photos: File[]): Promise<MaintenanceRequest> {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    const url = `${this.baseUrl}/api/v1/maintenance_requests/${id}/add_photos`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getMaintenanceUsers(propertyId: number): Promise<{ id: number; email: string }[]> {
    return this.request<{ id: number; email: string }[]>(`/api/v1/maintenance_requests/maintenance_users?property_id=${propertyId}`);
  }

  async updateMaintenanceRequestResolution(id: number, data: {
    resolution_notes?: string;
    status?: string;
    photos?: File[];
  }): Promise<MaintenanceRequest> {
    const formData = new FormData();
    if (data.resolution_notes) {
      formData.append('resolution_notes', data.resolution_notes);
    }
    if (data.status) {
      formData.append('status', data.status);
    }
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });
    }

    const url = `${this.baseUrl}/api/v1/maintenance_requests/${id}/update_resolution`;
    const response = await fetch(url, {
      method: 'PATCH',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Loyalty endpoints
  async getLoyaltyStatus(): Promise<{
    tier: string;
    on_time_payments_count: number;
    next_tier: string | null;
    payments_needed_for_next_tier: number;
    discount_percentage: number;
    property: {
      id: number;
      name: string;
    };
  }> {
    return this.request('/api/v1/loyalty');
  }

}

export const apiService = new ApiService(API_BASE_URL);
