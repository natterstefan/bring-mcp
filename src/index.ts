#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { BringClient } from './bringClient.js';
import 'dotenv/config';

const server = new McpServer({
  name: 'bring',
  version: '1.0.0',
  capabilities: { resources: {}, tools: {} },
});

const bc = new BringClient();

// Define a type for content parts that includes an index signature
type McpContentPart =
  | { type: 'text'; text: string; [key: string]: unknown }
  | { type: 'json_string'; text: string; [key: string]: unknown }; // Using json_string for clarity, will be text

// Helper function to create a simple text response
function textToolResult(text: string) {
  const contentPart: McpContentPart = { type: 'text', text };
  return { content: [contentPart] };
}

// Helper function to create a JSON response (as stringified text)
function jsonToolResult(data: unknown) {
  const contentPart: McpContentPart = { type: 'text', text: JSON.stringify(data, null, 2) }; // type is still 'text'
  return { content: [contentPart] };
}

// For tools with no parameters, pass empty object for schema
server.tool('login', 'Authenticate with Bring! API. Call this first.', {}, async () => {
  try {
    await bc.login();
    return textToolResult('Successfully logged in to Bring!');
  } catch (error: unknown) {
    console.error('Login failed:', error);
    return textToolResult(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.tool('loadLists', 'Load all shopping lists from Bring!', {}, async () => {
  try {
    const res = await bc.loadLists();
    return jsonToolResult(res);
  } catch (error: unknown) {
    console.error('Failed to load lists:', error);
    return textToolResult(`Failed to load lists: ${error instanceof Error ? error.message : String(error)}`);
  }
});

const getItemsParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
});
server.tool(
  'getItems',
  'Get all items from a specific shopping list.',
  getItemsParams.shape,
  async (args: z.infer<typeof getItemsParams>) => {
    try {
      const res = await bc.getItems(args.listUuid);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to get items:', error);
      return textToolResult(`Failed to get items: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const getItemsDetailsParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
});
server.tool(
  'getItemsDetails',
  'Get details for items in a list. (Currently might only take listUuid)',
  getItemsDetailsParams.shape,
  async (args: z.infer<typeof getItemsDetailsParams>) => {
    try {
      const res = await bc.getItemsDetails(args.listUuid);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to get item details:', error);
      return textToolResult(`Failed to get item details: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const saveItemParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
  itemName: z.string().describe('The name of the item to save.'),
  specification: z.string().optional().describe("Additional details for the item (e.g., '2 pcs', 'organic')."),
});
server.tool(
  'saveItem',
  'Save an item to a specific shopping list. Optionally include a specification (e.g., quantity, brand).',
  saveItemParams.shape,
  async (args: z.infer<typeof saveItemParams>) => {
    try {
      const res = await bc.saveItem(args.listUuid, args.itemName, args.specification);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to save item:', error);
      return textToolResult(`Failed to save item: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const removeItemParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
  itemId: z.string().describe('The ID of the item to remove.'),
});
server.tool(
  'removeItem',
  'Remove an item from a specific shopping list.',
  removeItemParams.shape,
  async (args: z.infer<typeof removeItemParams>) => {
    try {
      const res = await bc.removeItem(args.listUuid, args.itemId);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to remove item:', error);
      return textToolResult(`Failed to remove item: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const moveToRecentListParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list the item is currently on.'),
  itemId: z.string().describe('The ID of the item to move.'),
});
server.tool(
  'moveToRecentList',
  'Move an item from a shopping list to the recently used items list.',
  moveToRecentListParams.shape,
  async (args: z.infer<typeof moveToRecentListParams>) => {
    try {
      const res = await bc.moveToRecentList(args.listUuid, args.itemId);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to move item to recent list:', error);
      return textToolResult(
        `Failed to move item to recent list: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

const saveItemImageParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
  itemId: z.string().describe('The ID of the item to associate the image with.'),
  imagePathOrUrl: z.string().describe('Local file path or URL of the image.'),
});
server.tool(
  'saveItemImage',
  'Save an image for an item on a shopping list. Provide a local path or a URL to the image.',
  saveItemImageParams.shape,
  async (args: z.infer<typeof saveItemImageParams>) => {
    try {
      const res = await bc.saveItemImage(args.listUuid, args.itemId, args.imagePathOrUrl);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to save item image:', error);
      return textToolResult(`Failed to save item image: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const removeItemImageParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
  itemId: z.string().describe('The ID of the item whose image should be removed.'),
});
server.tool(
  'removeItemImage',
  'Remove an image from an item on a shopping list.',
  removeItemImageParams.shape,
  async (args: z.infer<typeof removeItemImageParams>) => {
    try {
      const res = await bc.removeItemImage(args.listUuid, args.itemId);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to remove item image:', error);
      return textToolResult(`Failed to remove item image: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const getAllUsersFromListParams = z.object({
  listUuid: z.string().describe('The UUID of the shopping list.'),
});
server.tool(
  'getAllUsersFromList',
  'Get all users associated with a specific shopping list.',
  getAllUsersFromListParams.shape,
  async (args: z.infer<typeof getAllUsersFromListParams>) => {
    try {
      const res = await bc.getAllUsersFromList(args.listUuid);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to get all users from list:', error);
      return textToolResult(
        `Failed to get all users from list: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

server.tool('getUserSettings', 'Get the settings for the current authenticated user.', {}, async () => {
  try {
    const res = await bc.getUserSettings();
    return jsonToolResult(res);
  } catch (error: unknown) {
    console.error('Failed to get user settings:', error);
    return textToolResult(`Failed to get user settings: ${error instanceof Error ? error.message : String(error)}`);
  }
});

const loadTranslationsParams = z.object({
  locale: z
    .string()
    .optional()
    .describe("The locale for translations (e.g., 'de-CH', 'fr-FR'). Defaults to 'en-US' if not provided."),
});
server.tool(
  'loadTranslations',
  "Load translations for item names and other UI elements. Optionally specify a locale (e.g., 'de-DE', 'en-US'). Defaults to 'en-US'.",
  loadTranslationsParams.shape,
  async (args: z.infer<typeof loadTranslationsParams>) => {
    try {
      const res = await bc.loadTranslations(args.locale);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to load translations:', error);
      return textToolResult(`Failed to load translations: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

const loadCatalogParams = z.object({
  locale: z.string().describe("The locale for the catalog (e.g., 'de-CH', 'en-US')."),
});
server.tool(
  'loadCatalog',
  'Load the Bring! catalog for a specific locale. This contains standard items.',
  loadCatalogParams.shape,
  async (args: z.infer<typeof loadCatalogParams>) => {
    try {
      const res = await bc.loadCatalog(args.locale);
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to load catalog:', error);
      return textToolResult(`Failed to load catalog: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
);

server.tool(
  'getPendingInvitations',
  'Get any pending invitations for the authenticated user to join shopping lists.',
  {},
  async () => {
    try {
      const res = await bc.getPendingInvitations();
      return jsonToolResult(res);
    } catch (error: unknown) {
      console.error('Failed to get pending invitations:', error);
      return textToolResult(
        `Failed to get pending invitations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

async function main() {
  if (!process.env.MAIL || !process.env.PW) {
    console.error(
      'Missing MAIL or PW environment variables. Please create a .env file with your Bring credentials (e.g., MAIL=your_email@example.com\\nPW=your_password).',
    );
    process.exit(1);
    return;
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server for Bring! API is running on STDIO');
}

main().catch((e) => {
  console.error('Fatal error starting MCP server:', e);
  process.exit(1);
});
