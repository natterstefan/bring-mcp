import { z } from 'zod';

export const listUuidParam = z.string().describe('The UUID of the shopping list.');
export const itemIdParam = z.string().describe('The ID of the item.');
