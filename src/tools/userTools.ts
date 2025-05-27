import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BringClient } from '../bringClient.js';
import { registerTool } from '../index.js';
import { listUuidParam } from '../schemaShared.js';

export function registerUserTools(server: McpServer, bc: BringClient) {
  const getAllUsersFromListParams = z.object({
    ...listUuidParam,
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

  registerTool({
    server,
    bc,
    name: 'getDefaultList',
    description: 'Get the UUID of the default shopping list for the authenticated user.',
    schemaShape: undefined,
    actionFn: async (_args: undefined, bc: BringClient) => {
      const settings = await bc.getUserSettings();
      // @ts-expect-error The bring-shopping type GetUserSettingsResponse may be outdated
      // and not include defaultListUUID, which is expected based on API observation.
      if (settings && settings.defaultListUUID) {
        // @ts-expect-error The bring-shopping type GetUserSettingsResponse may be outdated.
        return settings.defaultListUUID;
      }
      throw new Error('Default list UUID not found in user settings.');
    },
    failureMessage: 'Failed to get default list UUID',
  });
}
