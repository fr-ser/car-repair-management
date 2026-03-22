export const DOCUMENT_TYPE = {
  INVOICE: 'invoice',
  OFFER: 'offer',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export interface CreateDocumentRequest {
  orderId: number;
  type: DocumentType;
  documentDate?: string;
}
