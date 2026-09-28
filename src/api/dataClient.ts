import type { Claim, ClaimStatus, Product } from '../types';

export type RemoteState = {
  products: Product[];
  claims: Claim[];
  source?: 'database';
};

export type RemoteOperation =
  | { operation: 'add-product'; product: Product }
  | { operation: 'update-product'; product: Product }
  | { operation: 'toggle-product'; productId: string | number }
  | { operation: 'delete-product'; productId: string | number }
  | { operation: 'add-claim'; claim: Claim }
  | {
      operation: 'update-claim-status';
      claimId: string | number;
      status: ClaimStatus;
      adminNote?: string;
    }
  | { operation: 'reset' };

const parseState = async (response: Response): Promise<RemoteState | null> => {
  if (!response.ok) return null;
  try {
    const data = (await response.json()) as Partial<RemoteState>;
    if (!Array.isArray(data.products) || !Array.isArray(data.claims)) return null;
    return { products: data.products, claims: data.claims, source: 'database' };
  } catch {
    return null;
  }
};

export const fetchRemoteState = async (): Promise<RemoteState | null> => {
  try {
    const response = await fetch('/api/data', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    return parseState(response);
  } catch (error) {
    console.warn('Remote data is unavailable; using local data.', error);
    return null;
  }
};

export const mutateRemoteState = async (
  operation: RemoteOperation
): Promise<RemoteState | null> => {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operation)
    });
    return parseState(response);
  } catch (error) {
    console.warn('Remote data update failed; keeping local data.', error);
    return null;
  }
};