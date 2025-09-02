import { CreateClientRequest, CreateClientResponse } from '@/src/types/clients';

import * as Errors from '../types/errors';

export async function signIn(userName: string, password: string) {
  const response = await fetch(`/api/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, password }),
  });
  if (!response.ok) {
    throw new Error('login failed');
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
