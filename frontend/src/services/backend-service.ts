import { API_URL } from '../config';
import { AuthResponse, AuthUser, RegisterUser } from '../types/auth';
import * as Errors from '../types/errors';

export async function signin(authUser: AuthUser): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authUser),
  });
  const responseJson = await response.json();
  const responseStatus = response.status;
  if (responseStatus !== 200) {
    // TODO: Handle different error statuses
    throw new Errors.AuthError('Invalid credentials');
  } else {
    return { access_token: responseJson.access_token };
  }
}

export async function signup(
  registerUser: RegisterUser,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerUser),
  });
  const responseJson = await response.json();
  const responseStatus = await response.status;
  if (responseStatus !== 201) {
    // TODO: Handle different error statuses
    throw new Errors.AuthError('User not created');
  }
  return { access_token: responseJson.access_token };
}
