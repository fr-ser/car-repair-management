export interface AuthUser {
  email: string;
  password: string;
}
export interface RegisterUser {
  email: string;
  password: string;
}
export interface AuthResponse {
  access_token: string;
}
