import { CreateClientRequest, CreateClientResponse } from '@/src/types/clients';

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

export async function createClient(
  client: CreateClientRequest,
): Promise<CreateClientResponse> {
  const response = await fetch(`/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  const responseData: CreateClientResponse = await response.json();

  if (!response.ok) {
    // TODO: Handle different error statuses
    let errorMessage: string;
    if (typeof responseData.message === 'string') {
      errorMessage = responseData.message || 'Unknown error';
    } else {
      errorMessage = responseData.message?.[0] || 'Unknown error';
    }
    throw new Errors.RequestError(`Error! ${errorMessage}`);
  }

  return responseData;
}
