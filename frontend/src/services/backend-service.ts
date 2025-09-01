import { AuthUser } from '../types/auth';
import * as Errors from '../types/errors';

export async function signin(authUser: AuthUser) {
  const response = await fetch(`/api/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authUser),
  });
  if (!response.ok) {
    // TODO: Handle different error statuses
    throw new Errors.AuthError('Invalid credentials');
  }
}
