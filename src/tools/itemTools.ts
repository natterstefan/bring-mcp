import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BringClient } from '../bringClient.js';
import { registerTool } from '../index.js';
import { listUuidParam, itemIdParam } from '../schemaShared.js';

export function registerItemTools(server: McpServer, bc: BringClient) {
  const getItemsParams = z.object({
    listUuid: listUuidParam,
  });
  registerTool({
    server,
    bc,
    name: 'getItems',
    description: 'Get all items from a specific shopping list.',
    schemaShape: getItemsParams.shape,
    actionFn: async (args: z.infer<typeof getItemsParams>, bc: BringClient) => bc.getItems(args.listUuid),
    failureMessage: 'Failed to get items',
  });

  const getItemsDetailsParams = z.object({
    listUuid: listUuidParam,
  });
  registerTool({
    server,
    bc,
    name: 'getItemsDetails',
    description: 'Get details for items in a list. (Currently might only take listUuid)',
    schemaShape: getItemsDetailsParams.shape,
    actionFn: async (args: z.infer<typeof getItemsDetailsParams>, bc: BringClient) => bc.getItemsDetails(args.listUuid),
    failureMessage: 'Failed to get item details',
  });

  const saveItemParams = z.object({
    listUuid: listUuidParam,
    itemName: z.string().describe('The name of the item to save.'),
    specification: z.string().optional().describe("Additional details for the item (e.g., '2 pcs', 'organic')."),
  });
  registerTool({
    server,
    bc,
    name: 'saveItem',
    description:
      'Save an item to a specific shopping list. Optionally include a specification (e.g., quantity, brand).',
    schemaShape: saveItemParams.shape,
    actionFn: async (args: z.infer<typeof saveItemParams>, bc: BringClient) =>
      bc.saveItem(args.listUuid, args.itemName, args.specification),
    failureMessage: 'Failed to save item',
  });

  const removeItemParams = z.object({
    listUuid: listUuidParam,
    itemId: itemIdParam,
  });
  registerTool({
    server,
    bc,
    name: 'removeItem',
    description: 'Remove an item from a specific shopping list.',
    schemaShape: removeItemParams.shape,
    actionFn: async (args: z.infer<typeof removeItemParams>, bc: BringClient) =>
      bc.removeItem(args.listUuid, args.itemId),
    failureMessage: 'Failed to remove item',
  });

  const moveToRecentListParams = z.object({
    listUuid: listUuidParam,
    itemId: itemIdParam,
  });
  registerTool({
    server,
    bc,
    name: 'moveToRecentList',
    description: 'Move an item from a shopping list to the recently used items list.',
    schemaShape: moveToRecentListParams.shape,
    actionFn: async (args: z.infer<typeof moveToRecentListParams>, bc: BringClient) =>
      bc.moveToRecentList(args.listUuid, args.itemId),
    failureMessage: 'Failed to move item to recent list',
  });

  const saveItemImageParams = z.object({
    listUuid: listUuidParam,
    itemId: itemIdParam,
    imagePathOrUrl: z.string().describe('Local file path or URL of the image.'),
  });
  registerTool({
    server,
    bc,
    name: 'saveItemImage',
    description: 'Save an image for an item on a shopping list. Provide a local path or a URL to the image.',
    schemaShape: saveItemImageParams.shape,
    actionFn: async (args: z.infer<typeof saveItemImageParams>, bc: BringClient) =>
      bc.saveItemImage(args.listUuid, args.itemId, args.imagePathOrUrl),
    failureMessage: 'Failed to save item image',
  });

  const removeItemImageParams = z.object({
    listUuid: listUuidParam,
    itemId: itemIdParam,
  });
  registerTool({
    server,
    bc,
    name: 'removeItemImage',
    description: 'Remove an image from an item on a shopping list.',
    schemaShape: removeItemImageParams.shape,
    actionFn: async (args: z.infer<typeof removeItemImageParams>, bc: BringClient) =>
      bc.removeItemImage(args.listUuid, args.itemId),
    failureMessage: 'Failed to remove item image',
  });
}
