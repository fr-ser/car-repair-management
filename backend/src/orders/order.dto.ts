import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { SearchPaginationQueryDto } from '@/src/common/dto/pagination.dto';

export class OrdersListQueryDto extends SearchPaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  carId?: number;
}

export enum OrderStatus {
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PositionType {
  HEADING = 'heading',
  ITEM = 'item',
}

export class CreateOrderPositionDto {
  @IsEnum(PositionType)
  type: PositionType;

  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  articleId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumberString()
  pricePerUnit?: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsNumberString()
  discount?: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @MaxLength(10)
  orderDate: string;

  @IsOptional()
  @IsNumberString()
  kmStand?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  @MaxLength(10)
  paymentDueDate?: string;

  @IsInt()
  carId: number;

  @IsInt()
  clientId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPositionDto)
  positions?: CreateOrderPositionDto[];
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
