// This file is used as a bridge to import backend types into the frontend codebase
// It's main purpose is to avoid BE imports all around the FE codebase
// If at any point in time we decide to move away from Prisma in BE or to move FE to a different repo
// or just to remove this dependency for some other reason
// The only thing necessary will be to define these interfaces in this file,
// no need to go all over the codebase changing those imports
import { Client } from '@/../../backend/node_modules/@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BackendClient extends Client {}

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
