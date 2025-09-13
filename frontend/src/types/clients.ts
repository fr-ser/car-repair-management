import { BackendClient, BackendPaginatedResponse } from './backend-contracts';

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  company?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  landline?: string;
  phoneNumber?: string;
  email?: string;
  birthday?: Date;
  comment?: string;
}

export interface ErrorResponsePart {
  message?: string[] | string;
  error?: string;
  statusCode?: number;
}

export interface GetSingleClientResponse
  extends BackendClient,
    ErrorResponsePart {}

export interface GetClientsResponse
  extends BackendPaginatedResponse<BackendClient>,
    ErrorResponsePart {}

type ClientFormField<V = string> = {
  required: boolean;
  value: V;
  errorMessage: string | null;
};

export interface ClientForm {
  firstName: ClientFormField;
  lastName: ClientFormField;
  company: ClientFormField;
  street: ClientFormField;
  postalCode: ClientFormField;
  city: ClientFormField;
  landline: ClientFormField;
  phoneNumber: ClientFormField;
  email: ClientFormField;
  birthday: ClientFormField;
  comment: ClientFormField;
}
