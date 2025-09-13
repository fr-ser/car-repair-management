import React from 'react';

import { BackendClient } from '@/src/types/backend-contracts';
import { ClientForm, CreateClientRequest } from '@/src/types/clients';

export default (data: BackendClient) => {
  function loadForm(data: BackendClient): ClientForm {
    return {
      firstName: {
        required: true,
        value: data.firstName || '',
        errorMessage: null,
      },
      lastName: {
        required: true,
        value: data.lastName || '',
        errorMessage: null,
      },
      company: {
        required: false,
        value: data.company || '',
        errorMessage: null,
      },
      street: {
        required: false,
        value: data.street || '',
        errorMessage: null,
      },
      postalCode: {
        required: false,
        value: data.postalCode || '',
        errorMessage: null,
      },
      city: {
        required: false,
        value: data.city || '',
        errorMessage: null,
      },
      landline: {
        required: false,
        value: data.landline || '',
        errorMessage: null,
      },
      phoneNumber: {
        required: false,
        value: data.phoneNumber || '',
        errorMessage: null,
      },
      email: {
        required: false,
        value: data.email || '',
        errorMessage: null,
      },
      birthday: {
        required: false,
        value: data.birthday || '',
        errorMessage: null,
      },
      comment: {
        required: false,
        value: data.comment || '',
        errorMessage: null,
      },
    };
  }
  const [formData, setFormData] = React.useState<ClientForm>(loadForm(data));

  function reloadForm(data: BackendClient) {
    setFormData(loadForm(data));
  }

  function onFormInputChange(
    field: keyof ClientForm,
    value: string | Date | null,
  ) {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], value } }));
  }

  function validate(): boolean {
    let errors = false;
    Object.entries(formData).forEach(([fieldName, field]) => {
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

  function getPayload(): CreateClientRequest {
    const isValid = validate();
    if (!isValid) {
      throw new Error('Please fix validation errors before submitting');
    }

    const result: CreateClientRequest = { firstName: '', lastName: '' };

    Object.entries(formData).forEach(([key, field]) => {
      if (field.value) {
        (result as CreateClientRequest)[key as keyof CreateClientRequest] =
          field.value;
      }
    });

    return result;
  }

  return {
    formData,
    reloadForm,
    setFormData,
    onFormInputChange,
    validate,
    getPayload,
  };
};
