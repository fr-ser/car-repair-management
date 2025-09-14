import dayjs from 'dayjs';

export interface CreateClientRequest {
  firstName?: string;
  lastName?: string;
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

type ClientFormField<V = string | dayjs.Dayjs | null> = {
  value: V;
  errorMessage?: string;
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
  birthday: ClientFormField<dayjs.Dayjs | null>;
  comment: ClientFormField;
}
