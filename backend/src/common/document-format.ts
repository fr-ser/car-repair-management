export function formatIsoDateString(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('de-DE', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function toPaymentMethodLabel(method: string | null): string {
  if (method === 'cash') return 'Bar';
  if (method === 'bank_transfer') return 'Überweisung';
  return method ?? '';
}

export function getDefaultPaymentTerms(
  documentType: string,
  paymentDueDate: string | null,
): string | undefined {
  return documentType === 'invoice' && !paymentDueDate
    ? 'Sofort ohne Abzug zahlbar'
    : undefined;
}
