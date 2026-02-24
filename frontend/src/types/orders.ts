import dayjs from 'dayjs';

export const ORDER_STATUS = {
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_METHOD = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
} as const;
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type PositionType = 'heading' | 'item';

export type CreateOrderPositionRequest = {
  type: PositionType;
  sortOrder: number;
  text?: string;
  articleId?: string;
  description?: string;
  pricePerUnit?: string;
  amount?: string;
  discount?: string;
};

export type CreateOrderRequest = {
  title: string;
  orderDate: string;
  carId: number;
  clientId: number;
  status?: OrderStatus;
  description?: string;
  kmStand?: string;
  paymentMethod?: PaymentMethod;
  paymentDueDate?: string;
  positions?: CreateOrderPositionRequest[];
};

export type UpdateOrderRequest = Partial<CreateOrderRequest>;

type OrderFormField<V = string> = { value: V; errorMessage?: string };

export type PositionFormRow = {
  type: PositionType;
  // heading
  text: OrderFormField;
  // item
  articleId: OrderFormField;
  description: OrderFormField;
  pricePerUnit: OrderFormField;
  amount: OrderFormField;
  discount: OrderFormField;
  netSum?: number; // computed, not sent to backend
};

export type OrderForm = {
  title: OrderFormField;
  description: OrderFormField;
  orderDate: OrderFormField<dayjs.Dayjs | null>;
  kmStand: OrderFormField;
  status: OrderFormField<OrderStatus | ''>;
  paymentMethod: OrderFormField<PaymentMethod | ''>;
  paymentDueDate: OrderFormField<dayjs.Dayjs | null>;
  carId: OrderFormField<number | null>;
  clientId: OrderFormField<number | null>;
  positions: PositionFormRow[];
};
