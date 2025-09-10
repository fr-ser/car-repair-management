import { BEClient, BEPaginatedResponse } from './be-contracts';

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

export interface GetSingleClientResponse extends BEClient, ErrorResponsePart {}

export interface GetClientsResponse
  extends BEPaginatedResponse<BEClient>,
    ErrorResponsePart {}

export interface IClientForm {
  firstName: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  lastName: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  company: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  street: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  postalCode: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  city: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  landline: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  phoneNumber: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  email: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  birthday: {
    required: boolean;
    value: string | null;
    errorMessage: string | null;
  };
  comment: {
    required: boolean;
    value: string;
    errorMessage: string | null;
  };
  validate(): boolean;
  getReqest(): CreateClientRequest;
  withUpdate(fields: Partial<IClientForm>): IClientForm;
}

export class ClientForm implements IClientForm {
  firstName = { required: true, value: '', errorMessage: null };
  lastName = { required: true, value: '', errorMessage: null };
  company = { required: false, value: '', errorMessage: null };
  street = { required: false, value: '', errorMessage: null };
  postalCode = { required: false, value: '', errorMessage: null };
  city = { required: false, value: '', errorMessage: null };
  landline = { required: false, value: '', errorMessage: null };
  phoneNumber = { required: false, value: '', errorMessage: null };
  email = { required: false, value: '', errorMessage: null };
  birthday = { required: false, value: '', errorMessage: null };
  comment = { required: false, value: '', errorMessage: null };

  // custom method
  getReqest(): CreateClientRequest {
    const result: CreateClientRequest = { firstName: '', lastName: '' };

    Object.entries(this).forEach(([key, field]) => {
      if (field.value) {
        (result as CreateClientRequest)[key as keyof CreateClientRequest] =
          field.value;
      }
    });

    return result;
  }

  validate(): boolean {
    let errors = false;
    Object.entries(this).forEach(([fieldName, field]) => {
      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          if (field.required && (field.value === null || field.value === '')) {
            field.errorMessage = 'This field is required';
            errors = true;
          } else {
            field.errorMessage = null;
          }
          break;
        case 'email':
          if (
            field.value &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(field.value)
          ) {
            field.errorMessage = 'Invalid email address';
            errors = true;
          } else {
            field.errorMessage = null;
          }
          break;
        case 'birthday':
          if (field.value && isNaN(Date.parse(field.value))) {
            field.errorMessage = 'Invalid date';
            errors = true;
          } else {
            field.errorMessage = null;
          }
          break;
        case 'company':
        case 'street':
        case 'postalCode':
        case 'city':
        case 'landline':
        case 'phoneNumber':
        case 'comment':
        default:
          break;
      }
    });
    return !errors;
  }

  withUpdate(fields: Partial<ClientForm>): ClientForm {
    const copy = new ClientForm();
    Object.assign(copy, this, fields);
    return copy;
  }
}
