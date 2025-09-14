import React from 'react';

import { BackendClient } from '@/src/types/backend-contracts';
import { ClientForm, CreateClientRequest } from '@/src/types/clients';

function getFromFromClient(data?: BackendClient): ClientForm {
  return {
    firstName: {
      value: data?.firstName ?? '',
    },
    lastName: {
      value: data?.lastName ?? '',
    },
    company: {
      value: data?.company ?? '',
    },
    street: {
      value: data?.street ?? '',
    },
    postalCode: {
      value: data?.postalCode ?? '',
    },
    city: {
      value: data?.city ?? '',
    },
    landline: {
      value: data?.landline ?? '',
    },
    phoneNumber: {
      value: data?.phoneNumber ?? '',
    },
    email: {
      value: data?.email ?? '',
    },
    birthday: {
      value: data?.birthday ?? '',
    },
    comment: {
      value: data?.comment ?? '',
    },
  };
}

export default (data?: BackendClient) => {
  const [formData, setFormData] = React.useState<ClientForm>(
    getFromFromClient(data),
  );

  const reloadForm = React.useCallback((data?: BackendClient) => {
    setFormData(getFromFromClient(data));
  }, []);

  const onFormInputChange = React.useCallback(
    (field: keyof ClientForm, value: string | Date | null) => {
      setFormData((prev) => ({ ...prev, [field]: { ...prev[field], value } }));
    },
    [],
  );

  const validate = React.useCallback((): boolean => {
    let isValid = true;
    Object.entries(formData).forEach(([fieldName, field]) => {
      field.errorMessage = undefined;
      switch (fieldName) {
        case 'email':
          if (
            field.value &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(field.value)
          ) {
            field.errorMessage = 'Ungültige E-Mail-Adresse';
            isValid = false;
          }
          break;
        default:
          break;
      }
    });
    return isValid;
  }, [formData]);

  const getPayload = React.useCallback((): CreateClientRequest => {
    const isValid = validate();
    if (!isValid) {
      throw new Error('Die Formulardaten sind ungültig');
    }

    const result: CreateClientRequest = {};

    Object.entries(formData).forEach(([key, field]) => {
      if (field.value) {
        result[key as keyof CreateClientRequest] = field.value;
      }
    });

    return result;
  }, [formData, validate]);

  return {
    formData,
    reloadForm,
    setFormData,
    onFormInputChange,
    validate,
    getPayload,
  };
};
