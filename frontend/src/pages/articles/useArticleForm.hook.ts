import React from 'react';

import { ArticleForm, CreateArticleRequest } from '@/src/types/articles';
import { BackendArticle } from '@/src/types/backend-contracts';
import { parseNumber } from '@/src/utils/numbers';

function getFormFromArticle(data?: BackendArticle): ArticleForm {
  return {
    id: { value: data?.id ?? '' },
    description: { value: data?.description ?? '' },
    price: { value: data?.price != null ? data.price.toString() : '' },
    amount: { value: data?.amount != null ? data.amount.toString() : '' },
  };
}

export function useArticleForm(data?: BackendArticle) {
  const [formData, setFormData] = React.useState<ArticleForm>(
    getFormFromArticle(data),
  );

  const reloadForm = React.useCallback((data?: BackendArticle) => {
    setFormData(getFormFromArticle(data));
  }, []);

  const onFormInputChange = React.useCallback(
    (field: keyof ArticleForm, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], value, errorMessage: undefined },
      }));
    },
    [],
  );

  const validate = React.useCallback((): boolean => {
    let isValid = true;
    const updated = { ...formData };

    if (!updated.id.value) {
      updated.id = { ...updated.id, errorMessage: 'Pflichtfeld' };
      isValid = false;
    } else {
      updated.id = { ...updated.id, errorMessage: undefined };
    }

    if (!updated.description.value) {
      updated.description = {
        ...updated.description,
        errorMessage: 'Pflichtfeld',
      };
      isValid = false;
    } else {
      updated.description = { ...updated.description, errorMessage: undefined };
    }

    if (!updated.price.value) {
      updated.price = { ...updated.price, errorMessage: 'Pflichtfeld' };
      isValid = false;
    } else {
      updated.price = { ...updated.price, errorMessage: undefined };
    }

    setFormData(updated);
    return isValid;
  }, [formData]);

  const getPayload = React.useCallback((): CreateArticleRequest => {
    const isValid = validate();
    if (!isValid) {
      throw new Error('Die Formulardaten sind ungültig');
    }

    const priceNumber = parseNumber(formData.price.value);
    const payload: CreateArticleRequest = {
      id: formData.id.value,
      description: formData.description.value,
      price:
        priceNumber != null ? priceNumber.toString() : formData.price.value,
    };

    if (formData.amount.value) {
      const amountNumber = parseNumber(formData.amount.value);
      payload.amount =
        amountNumber != null ? amountNumber.toString() : formData.amount.value;
    }

    return payload;
  }, [formData, validate]);

  return {
    formData,
    reloadForm,
    setFormData,
    onFormInputChange,
    validate,
    getPayload,
  };
}
