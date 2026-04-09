import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const DOCUMENT_TYPE = {
  INVOICE: 'invoice',
  OFFER: 'offer',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export class BulkPdfDto {
  @IsArray()
  @IsInt({ each: true })
  declare ids: number[];
}

export class CreateDocumentDto {
  @IsInt()
  declare orderId: number;

  @IsIn([...Object.values(DOCUMENT_TYPE)])
  declare type: DocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  documentDate?: string;
}
