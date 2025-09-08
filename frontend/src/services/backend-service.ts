import {
  CreateClientRequest,
  GetClientsResponse,
  GetSingleClientResponse,
} from '@/src/types/clients';
import * as Errors from '@/src/types/errors';

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
): Promise<GetSingleClientResponse> {
  const response = await fetch(`/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  const responseData: GetSingleClientResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData;
}

export async function updateClient(
  clientId: number,
  client: CreateClientRequest,
): Promise<GetSingleClientResponse> {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  const responseData: GetSingleClientResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData;
}

export async function deleteClient(clientId: number): Promise<void> {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseData: GetSingleClientResponse = await response.json();

  handleErrorResponse(response, responseData);
}

export async function fetchClients(
  page: number = 0,
  limit: number = 10,
): Promise<GetClientsResponse> {
  const response = await fetch(`/api/clients?page=${page + 1}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseData: GetClientsResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleErrorResponse(response: Response, responseData: any) {
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
}
