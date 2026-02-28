import {
  CreateArticleRequest,
  UpdateArticleRequest,
} from '@/src/types/articles';
import {
  BackendArticle,
  BackendCar,
  BackendClient,
  BackendClientWithCars,
  BackendOrderWithPositions,
  BackendPaginatedResponse,
  BackendPendingOrder,
} from '@/src/types/backend-contracts';
import { CreateCarRequest, UpdateCarRequest } from '@/src/types/cars';
import { CreateClientRequest } from '@/src/types/clients';
import * as Errors from '@/src/types/errors';
import { CreateOrderRequest, UpdateOrderRequest } from '@/src/types/orders';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await response.json();
  handleErrorResponse(response, data);
  return data as T;
}

function paginatedUrl(
  base: string,
  page: number,
  limit: number,
  search: string,
) {
  const params = new URLSearchParams({
    page: (page + 1).toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  return `${base}?${params}`;
}

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

export function createClient(client: CreateClientRequest) {
  return apiFetch<BackendClient>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(client),
  });
}

export function updateClient(clientId: number, client: CreateClientRequest) {
  return apiFetch<BackendClient>(`/api/clients/${clientId}`, {
    method: 'PATCH',
    body: JSON.stringify(client),
  });
}

export function deleteClient(clientId: number) {
  return apiFetch<object>(`/api/clients/${clientId}`, { method: 'DELETE' });
}

export function fetchClient(clientId: number) {
  return apiFetch<BackendClientWithCars>(`/api/clients/${clientId}`);
}

export function fetchClients(page = 0, limit = 10, search = '') {
  return apiFetch<BackendPaginatedResponse<BackendClient>>(
    paginatedUrl('/api/clients', page, limit, search),
  );
}

export function createCar(car: CreateCarRequest) {
  return apiFetch<BackendCar>('/api/cars', {
    method: 'POST',
    body: JSON.stringify(car),
  });
}

export function updateCar(carId: number, car: UpdateCarRequest) {
  return apiFetch<BackendCar>(`/api/cars/${carId}`, {
    method: 'PATCH',
    body: JSON.stringify(car),
  });
}

export function fetchCars(page = 0, limit = 10, search = '') {
  return apiFetch<BackendPaginatedResponse<BackendCar>>(
    paginatedUrl('/api/cars', page, limit, search),
  );
}

export function fetchCar(carId: number) {
  return apiFetch<BackendCar>(`/api/cars/${carId}`);
}

export function deleteCar(carId: number) {
  return apiFetch<object>(`/api/cars/${carId}`, { method: 'DELETE' });
}

export function fetchArticles(page = 0, limit = 10, search = '') {
  return apiFetch<BackendPaginatedResponse<BackendArticle>>(
    paginatedUrl('/api/articles', page, limit, search),
  );
}

export function createArticle(article: CreateArticleRequest) {
  return apiFetch<BackendArticle>('/api/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  });
}

export function updateArticle(
  articleId: string,
  article: UpdateArticleRequest,
) {
  return apiFetch<BackendArticle>(`/api/articles/${articleId}`, {
    method: 'PATCH',
    body: JSON.stringify(article),
  });
}

export function deleteArticle(articleId: string) {
  return apiFetch<object>(`/api/articles/${articleId}`, { method: 'DELETE' });
}

export function fetchOrders(page = 0, limit = 10, search = '') {
  return apiFetch<BackendPaginatedResponse<BackendOrderWithPositions>>(
    paginatedUrl('/api/orders', page, limit, search),
  );
}

export function fetchPendingOrders(page = 0, limit = 10, search = '') {
  return apiFetch<BackendPaginatedResponse<BackendPendingOrder>>(
    paginatedUrl('/api/orders/overview/pending', page, limit, search),
  );
}

export function fetchOrder(orderId: number) {
  return apiFetch<BackendOrderWithPositions>(`/api/orders/${orderId}`);
}

export function createOrder(order: CreateOrderRequest) {
  return apiFetch<BackendOrderWithPositions>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export function updateOrder(orderId: number, order: UpdateOrderRequest) {
  return apiFetch<BackendOrderWithPositions>(`/api/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(order),
  });
}

export function deleteOrder(orderId: number) {
  return apiFetch<object>(`/api/orders/${orderId}`, { method: 'DELETE' });
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
