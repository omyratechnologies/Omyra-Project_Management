import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile: {
      fullName: string;
      avatar?: string;
    };
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data.user;
  },

  async updateProfile(data: Partial<RegisterData>): Promise<AuthResponse['user']> {
    const response = await api.put<AuthResponse>('/auth/profile', data);
    return response.data.user;
  },

  async resetPassword(email: string): Promise<void> {
    await api.post('/auth/reset-password', { email });
  },

  async verifyResetToken(token: string): Promise<boolean> {
    const response = await api.get(`/auth/verify-reset-token/${token}`);
    return response.data.valid;
  },

  async setNewPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/set-new-password', { token, password });
  },

  getStoredUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
