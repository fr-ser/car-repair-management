// This file is used as a bridge to import backend types into the frontend codebase
// It's main purpose is to avoid BE imports all around the FE codebase
// If at any point in time we decide to move away from Prisma in BE or to move FE to a different repo
// or just to remove this dependency for some other reason
// The only thing necessary will be to define these interfaces in this file,
// no need to go all over the codebase changing those imports
import type {
  Article,
  Car,
  Client,
  Document,
  DocumentPosition,
  Order,
  OrderPosition,
} from '@/../../backend/src/generated/prisma/client';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendArticle extends Article {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendClient extends Client {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendCar extends Car {}

export interface BackendClientWithCars extends BackendClient {
  cars: BackendCar[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendOrderPosition extends OrderPosition {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendOrder extends Order {}
export interface BackendOrderWithPositions extends BackendOrder {
  positions: BackendOrderPosition[];
  car: { carNumber: string | null; licensePlate: string };
  client: {
    clientNumber: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface BackendPendingOrder extends BackendOrder {
  car: { carNumber: string | null; licensePlate: string };
  client: {
    clientNumber: string | null;
    firstName: string | null;
    lastName: string | null;
    company: string | null;
  };
}

export interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendDocumentPosition extends DocumentPosition {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendDocument extends Document {}
export interface BackendDocumentWithPositions extends BackendDocument {
  positions: BackendDocumentPosition[];
}

export interface ErrorResponse {
  message?: string[] | string;
  error?: string;
  statusCode?: number;
}
