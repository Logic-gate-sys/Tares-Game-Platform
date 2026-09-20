
// Auth responses
export type SignupRequest = {
  email: string;
  username: string;
  password: {
    plain_text: string;
  }
}

export type LoginRequest = {
  email: string;
  password: {
    plain_text: string;
  }
}

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    username?: string;
    p_level?: string;
    bio?: string;
    total_score?: number; 
    createdAt: Date; 
  };
}

export type ErrorResponse = {
  error: string;
  details?: unknown;
}

