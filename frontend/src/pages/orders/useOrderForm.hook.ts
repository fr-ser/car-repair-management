import dayjs from 'dayjs';
import React from 'react';

import { BackendOrderWithPositions } from '@/src/types/backend-contracts';
import {
  CreateOrderPositionRequest,
  CreateOrderRequest,
  ORDER_STATUS,
  OrderForm,
  OrderStatus,
  PaymentMethod,
  PositionFormRow,
  PositionType,
} from '@/src/types/orders';
import { formatNumber, parseNumber } from '@/src/utils/numbers';

function computeNetSum(row: PositionFormRow): number {
  if (row.type !== 'item') return 0;
  const price = parseNumber(row.pricePerUnit.value) ?? 0;
  const amount = parseNumber(row.amount.value) ?? 0;
  const discount = parseNumber(row.discount.value || '0') ?? 0;
  return price * amount * (1 - discount / 100);
}

function makeEmptyHeading(): PositionFormRow {
  return {
    type: 'heading',
    text: { value: '' },
    articleId: { value: '' },
    description: { value: '' },
    pricePerUnit: { value: '' },
    amount: { value: '' },
    discount: { value: '' },
  };
}

function makeEmptyItem(): PositionFormRow {
  return {
    type: 'item',
    text: { value: '' },
    articleId: { value: '' },
    description: { value: '' },
    pricePerUnit: { value: '' },
    amount: { value: '' },
    discount: { value: '' },
    netSum: 0,
  };
}

function positionFromBackend(
  pos: BackendOrderWithPositions['positions'][number],
): PositionFormRow {
  const row: PositionFormRow = {
    type: pos.type as PositionType,
    text: { value: pos.text ?? '' },
    articleId: { value: pos.articleId ?? '' },
    description: { value: pos.description ?? '' },
    pricePerUnit: {
      value:
        pos.pricePerUnit != null ? formatNumber(Number(pos.pricePerUnit)) : '',
    },
    amount: {
      value: pos.amount != null ? formatNumber(Number(pos.amount)) : '',
    },
    discount: {
      value: pos.discount != null ? formatNumber(Number(pos.discount)) : '',
    },
  };
  row.netSum = computeNetSum(row);
  return row;
}

function getFormFromOrder(data?: BackendOrderWithPositions): OrderForm {
  return {
    title: { value: data?.title ?? '' },
    description: { value: data?.description ?? '' },
    orderDate: { value: data?.orderDate ? dayjs(data.orderDate) : null },
    kmStand: {
      value: data?.kmStand != null ? formatNumber(Number(data.kmStand)) : '',
    },
    status: {
      value: (data?.status as OrderStatus) ?? ORDER_STATUS.IN_PROGRESS,
    },
    paymentMethod: {
      value: (data?.paymentMethod as PaymentMethod | '') ?? '',
    },
    paymentDueDate: {
      value: data?.paymentDueDate ? dayjs(data.paymentDueDate) : null,
    },
    carId: { value: data?.carId ?? null },
    clientId: { value: data?.clientId ?? null },
    positions: (data?.positions ?? []).map(positionFromBackend),
  };
}

export function useOrderForm(data?: BackendOrderWithPositions) {
  const [formData, setFormData] = React.useState<OrderForm>(
    getFormFromOrder(data),
  );

  const reloadForm = React.useCallback((data?: BackendOrderWithPositions) => {
    setFormData(getFormFromOrder(data));
  }, []);

  const onFormInputChange = React.useCallback(
    (
      field: keyof Omit<OrderForm, 'positions'>,
      value: string | number | dayjs.Dayjs | null,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], value, errorMessage: undefined },
      }));
    },
    [],
  );

  const addHeading = React.useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      positions: [...prev.positions, makeEmptyHeading()],
    }));
  }, []);

  const addItem = React.useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      positions: [...prev.positions, makeEmptyItem()],
    }));
  }, []);

  const updatePosition = React.useCallback(
    (index: number, field: keyof PositionFormRow, value: string) => {
      setFormData((prev) => {
        const positions = [...prev.positions];
        const row = { ...positions[index] };
        if (
          field === 'text' ||
          field === 'articleId' ||
          field === 'description' ||
          field === 'pricePerUnit' ||
          field === 'amount' ||
          field === 'discount'
        ) {
          (row[field] as { value: string; errorMessage?: string }) = {
            value,
            errorMessage: undefined,
          };
        }
        row.netSum = computeNetSum(row);
        positions[index] = row;
        return { ...prev, positions };
      });
    },
    [],
  );

  const movePosition = React.useCallback(
    (index: number, direction: 'up' | 'down') => {
      setFormData((prev) => {
        const positions = [...prev.positions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= positions.length) return prev;
        [positions[index], positions[targetIndex]] = [
          positions[targetIndex],
          positions[index],
        ];
        return { ...prev, positions };
      });
    },
    [],
  );

  const removePosition = React.useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
  }, []);

  const validate = React.useCallback((): boolean => {
    let isValid = true;
    const updated = { ...formData };

    if (!updated.title.value) {
      updated.title = { ...updated.title, errorMessage: 'Pflichtfeld' };
      isValid = false;
    } else {
      updated.title = { ...updated.title, errorMessage: undefined };
    }

    if (!updated.orderDate.value || !updated.orderDate.value.isValid()) {
      updated.orderDate = {
        ...updated.orderDate,
        errorMessage: 'Pflichtfeld',
      };
      isValid = false;
    } else {
      updated.orderDate = { ...updated.orderDate, errorMessage: undefined };
    }

    if (updated.carId.value == null) {
      updated.carId = { ...updated.carId, errorMessage: 'Pflichtfeld' };
      isValid = false;
    } else {
      updated.carId = { ...updated.carId, errorMessage: undefined };
    }

    if (updated.clientId.value == null) {
      updated.clientId = { ...updated.clientId, errorMessage: 'Pflichtfeld' };
      isValid = false;
    } else {
      updated.clientId = { ...updated.clientId, errorMessage: undefined };
    }

    const updatedPositions = updated.positions.map((pos) => {
      if (pos.type !== 'item') return pos;
      const updatedPos = { ...pos };
      for (const field of ['pricePerUnit', 'amount', 'discount'] as const) {
        const val = pos[field].value;
        if (val) {
          const parsed = parseNumber(val);
          if (parsed == null || isNaN(parsed)) {
            updatedPos[field] = {
              ...updatedPos[field],
              errorMessage: 'Ungültige Zahl',
            };
            isValid = false;
          } else if (field === 'discount' && (parsed < 0 || parsed > 100)) {
            updatedPos[field] = {
              ...updatedPos[field],
              errorMessage: 'Muss zwischen 0 und 100 liegen',
            };
            isValid = false;
          } else {
            updatedPos[field] = {
              ...updatedPos[field],
              errorMessage: undefined,
            };
          }
        }
      }
      return updatedPos;
    });

    setFormData({ ...updated, positions: updatedPositions });
    return isValid;
  }, [formData]);

  const getPayload = React.useCallback((): CreateOrderRequest => {
    const isValid = validate();
    if (!isValid) {
      throw new Error('Die Formulardaten sind ungültig');
    }

    const positions: CreateOrderPositionRequest[] = formData.positions.map(
      (pos, index) => {
        if (pos.type === 'heading') {
          return {
            type: 'heading',
            sortOrder: index,
            text: pos.text.value || undefined,
          };
        }
        const item: CreateOrderPositionRequest = {
          type: 'item',
          sortOrder: index,
        };
        if (pos.articleId.value) item.articleId = pos.articleId.value;
        if (pos.description.value) item.description = pos.description.value;
        if (pos.pricePerUnit.value) {
          const n = parseNumber(pos.pricePerUnit.value);
          item.pricePerUnit = n != null ? n.toString() : pos.pricePerUnit.value;
        }
        if (pos.amount.value) {
          const n = parseNumber(pos.amount.value);
          item.amount = n != null ? n.toString() : pos.amount.value;
        }
        if (pos.discount.value) {
          const n = parseNumber(pos.discount.value);
          item.discount = n != null ? n.toString() : pos.discount.value;
        }
        return item;
      },
    );

    const payload: CreateOrderRequest = {
      title: formData.title.value,
      orderDate: formData.orderDate.value!.format('YYYY-MM-DD'),
      carId: formData.carId.value!,
      clientId: formData.clientId.value!,
      positions,
    };

    if (formData.status.value) {
      payload.status = formData.status.value;
    }
    if (formData.description.value) {
      payload.description = formData.description.value;
    }
    if (formData.kmStand.value) {
      const n = parseNumber(formData.kmStand.value);
      payload.kmStand = n != null ? n.toString() : formData.kmStand.value;
    }
    if (formData.paymentMethod.value) {
      payload.paymentMethod = formData.paymentMethod.value as PaymentMethod;
    }
    if (formData.paymentDueDate.value?.isValid()) {
      payload.paymentDueDate =
        formData.paymentDueDate.value.format('YYYY-MM-DD');
    }

    return payload;
  }, [formData, validate]);

  return {
    formData,
    setFormData,
    reloadForm,
    onFormInputChange,
    addHeading,
    addItem,
    updatePosition,
    movePosition,
    removePosition,
    validate,
    getPayload,
  };
}
