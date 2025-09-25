export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  user: string;
  createdAt: string;
}

// src/types/index.ts - Full types for your app (add/update ChatMessage)

// ChatMessage type (UPDATED: Added 'role' for user/AI styling)
export interface ChatMessage {
  _id: string;
  message: string;  // User input
  response?: string;  // AI reply (optional)
  tokensUsed?: number;  // Optional
  project: string;
  createdAt: string;
  role?: 'user' | 'assistant';  // NEW: For bubble styling (user right/blue, AI left/gray)
}

// User type (for AuthContext)
export interface User {
  _id: string;
  username: string;
  email: string;
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}