import {
  BackendCar,
  BackendClient,
  BackendPaginatedResponse,
  ErrorResponse,
} from '@/src/types/backend-contracts';
import { CreateCarRequest, UpdateCarRequest } from '@/src/types/cars';
import { CreateClientRequest } from '@/src/types/clients';
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

export async function createClient(client: CreateClientRequest) {
  const response = await fetch(`/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  const responseData: BackendClient | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendClient;
}

export async function updateClient(
  clientId: number,
  client: CreateClientRequest,
) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  const responseData: BackendClient | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendClient;
}

export async function deleteClient(clientId: number) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const responseData: object | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);
}

export async function fetchClients(
  page: number = 0,
  limit: number = 10,
  search: string = '',
) {
  const queryParameters = new URLSearchParams({
    page: (page + 1).toString(),
    limit: limit.toString(),
  });
  if (search) {
    queryParameters.append('search', search);
  }
  const response = await fetch(`/api/clients?${queryParameters.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const responseData: BackendPaginatedResponse<BackendClient> | ErrorResponse =
    await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendPaginatedResponse<BackendClient>;
}

export async function createCar(car: CreateCarRequest) {
  const response = await fetch(`/api/cars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  const responseData: BackendCar | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendCar;
}

export async function updateCar(carId: number, car: UpdateCarRequest) {
  const response = await fetch(`/api/cars/${carId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  const responseData: BackendCar | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendCar;
}

export async function fetchCars(
  page: number = 0,
  limit: number = 10,
  search: string = '',
) {
  const queryParameters = new URLSearchParams({
    page: (page + 1).toString(),
    limit: limit.toString(),
  });
  if (search) {
    queryParameters.append('search', search);
  }
  const response = await fetch(`/api/cars?${queryParameters.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const responseData: BackendPaginatedResponse<BackendCar> | ErrorResponse =
    await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendPaginatedResponse<BackendCar>;
}

export async function fetchCar(carId: number) {
  const response = await fetch(`/api/cars/${carId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const responseData: BackendCar | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);

  return responseData as BackendCar;
}

export async function deleteCar(carId: number) {
  const response = await fetch(`/api/cars/${carId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const responseData: object | ErrorResponse = await response.json();

  handleErrorResponse(response, responseData);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleErrorResponse(response: Response, responseData: any) {
  if (response.ok) return;

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  let errorMessage: string;
  if (typeof responseData.message === 'string') {
    errorMessage = responseData.message || 'Unknown error';
  } else {
    errorMessage = responseData.message?.[0] || 'Unknown error';
  }
  throw new Errors.RequestError(`Error! ${errorMessage}`);
}
