import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchPaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  @IsOptional()
  @IsString()
  search: string | undefined;
}

export class PaginationMeta {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(
    data: T[],
    totalItems: number,
    query: { page: number; limit: number },
  ) {
    this.data = data;
    this.meta = {
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
      hasNextPage: query.page < Math.ceil(totalItems / query.limit),
    };
  }
}
