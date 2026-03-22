import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export const DOCUMENT_TYPE = {
  INVOICE: 'invoice',
  OFFER: 'offer',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export class CreateDocumentDto {
  @IsInt()
  orderId: number;

  @IsIn([...Object.values(DOCUMENT_TYPE)])
  type: DocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  documentDate?: string;
}
