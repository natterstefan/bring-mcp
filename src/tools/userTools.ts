import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BringClient } from '../bringClient.js';
import { registerTool } from '../index.js';
import { listUuidParam } from '../schemaShared.js';

export function registerUserTools(server: McpServer, bc: BringClient) {
  const getAllUsersFromListParams = z.object({
    listUuid: listUuidParam,
  });
  registerTool({
    server,
    bc,
    name: 'getAllUsersFromList',
    description: 'Get all users associated with a specific shopping list.',
    schemaShape: getAllUsersFromListParams.shape,
    actionFn: async (args: z.infer<typeof getAllUsersFromListParams>, bc: BringClient) =>
      bc.getAllUsersFromList(args.listUuid),
    failureMessage: 'Failed to get all users from list',
  });

  registerTool({
    server,
    bc,
    name: 'getUserSettings',
    description: 'Get the settings for the current authenticated user.',
    schemaShape: undefined,
    actionFn: async (_args: undefined, bc: BringClient) => bc.getUserSettings(),
    failureMessage: 'Failed to get user settings',
  });

  registerTool({
    server,
    bc,
    name: 'getPendingInvitations',
    description: 'Get any pending invitations for the authenticated user to join shopping lists.',
    schemaShape: undefined,
    actionFn: async (_args: undefined, bc: BringClient) => bc.getPendingInvitations(),
    failureMessage: 'Failed to get pending invitations',
  });
}
