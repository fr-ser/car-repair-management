import {
  CreateArticleRequest,
  UpdateArticleRequest,
} from '@/src/types/articles';
import {
  BackendArticle,
  BackendCar,
  BackendClient,
  BackendClientWithCars,
  BackendDocument,
  BackendDocumentWithPositions,
  BackendOrderWithPositions,
  BackendPaginatedResponse,
  BackendPendingOrder,
} from '@/src/types/backend-contracts';
import { CreateCarRequest, UpdateCarRequest } from '@/src/types/cars';
import { CreateClientRequest } from '@/src/types/clients';
import { CreateDocumentRequest } from '@/src/types/documents';
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

export function fetchDocumentsByOrder(orderId: number) {
  return apiFetch<BackendDocument[]>(`/api/documents/by-order/${orderId}`);
}

export function fetchDocuments(page = 0, limit = 10, search = '') {
  return apiFetch<BackendPaginatedResponse<BackendDocument>>(
    paginatedUrl('/api/documents', page, limit, search),
  );
}

export function fetchDocument(documentId: number) {
  return apiFetch<BackendDocumentWithPositions>(`/api/documents/${documentId}`);
}

export function createDocument(data: CreateDocumentRequest) {
  return apiFetch<BackendDocument>('/api/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteDocument(documentId: number) {
  return apiFetch<object>(`/api/documents/${documentId}`, { method: 'DELETE' });
}

export async function downloadDocumentPdf(
  documentId: number,
  filename: string,
) {
  const response = await fetch(`/api/documents/${documentId}/pdf`);
  if (!response.ok) throw new Error('PDF download failed');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadDocumentsPdf(ids: number[]) {
  const response = await fetch('/api/documents/bulk-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error('PDF download failed');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'documents.pdf';
  a.click();
  URL.revokeObjectURL(url);
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
