type ClientLike = {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  clientNumber?: string | null;
};

/**
 * Returns the best human-readable label for a client:
 * full name if available, company name as fallback, client number as last resort.
 */
export function clientDisplayName(client: ClientLike): string {
  const name = [client.firstName, client.lastName].filter(Boolean).join(' ');
  if (name) return name;
  if (client.company) return client.company;
  return client.clientNumber ?? '';
}

/**
 * Returns the autocomplete / dropdown option label for a client:
 * "clientNumber – full name" or "clientNumber – company".
 */
export function clientOptionLabel(client: ClientLike): string {
  const name = [client.firstName, client.lastName].filter(Boolean).join(' ');
  return `${client.clientNumber ?? ''} – ${name || client.company || ''}`;
}
