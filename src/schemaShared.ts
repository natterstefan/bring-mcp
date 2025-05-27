import { z } from 'zod';

export const listUuidParam = {
  listUuid: z.string().uuid({ message: 'Invalid list UUID' }),
};

export const itemIdParam = {
  itemId: z.string().min(1, { message: 'Item ID cannot be empty' }),
};

export const itemNameParam = {
  itemName: z.string().min(1, { message: 'Item name cannot be empty' }),
};

export const itemSpecificationParam = {
  specification: z.string().nullable().optional(),
};

export const itemImageParam = {
  imagePathOrUrl: z.string().min(1, { message: 'Image path or URL cannot be empty' }),
};

export const batchItemSchema = z.object({
  itemName: z.string().min(1, { message: 'Item name cannot be empty in batch' }),
  specification: z.string().nullable().optional(),
});

export const saveItemBatchParams = {
  ...listUuidParam,
  items: z.array(batchItemSchema).min(1, { message: 'Items array cannot be empty' }),
};

export const itemNamesArrayParam = {
  itemNames: z
    .array(z.string().min(1, { message: 'Item name in array cannot be empty' }))
    .min(1, { message: 'Item names array cannot be empty' }),
};
