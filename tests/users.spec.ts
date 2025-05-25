import {
  mockGetAllUsersFromList,
  mockGetUserSettings,
  mockGetPendingInvitations,
  mockMcpServerInstance,
  mockTools,
  loadServer,
  getTool,
} from './helpers';

let consoleErrorSpy: jest.SpyInstance;

// Placeholder for user tests
describe('User Tests', () => {
  it('should have a placeholder test', () => {
    expect(true).toBe(true);
  });
});

describe('MCP Bring! Server - User Tools', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    mockTools.clear();
    await loadServer();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // Test for getAllUsersFromList
  describe('bring.getAllUsersFromList tool', () => {
    const toolSchema = { listUuid: expect.any(Object) }; // Zod string

    it('should be registered correctly', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'getAllUsersFromList',
        'Get all users associated with a specific shopping list.',
        toolSchema,
        expect.any(Function),
      );
      const tool = getTool('getAllUsersFromList');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Get all users associated with a specific shopping list.');
      expect(tool?.schema).toMatchObject({ listUuid: {} });
    });

    it('should return users on success', async () => {
      const fakeListUuid = 'list-users';
      const fakeUsers = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' },
      ];
      mockGetAllUsersFromList.mockResolvedValue(fakeUsers);
      const tool = getTool('getAllUsersFromList');
      const result = await tool.callback({ listUuid: fakeListUuid });
      expect(mockGetAllUsersFromList).toHaveBeenCalledWith(fakeListUuid);
      expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(fakeUsers, null, 2) }] });
    });

    it('should return error on failure', async () => {
      const fakeListUuid = 'list-users-fail';
      const error = new Error('Failed to get users');
      mockGetAllUsersFromList.mockRejectedValue(error);
      const tool = getTool('getAllUsersFromList');
      const result = await tool.callback({ listUuid: fakeListUuid });
      expect(result).toEqual({
        content: [{ type: 'text', text: `Failed to get all users from list: ${error.message}` }],
      });
    });
  });

  // Test for getUserSettings
  describe('bring.getUserSettings tool', () => {
    it('should be registered correctly', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'getUserSettings',
        'Get the settings for the current authenticated user.',
        {},
        expect.any(Function),
      );
      const tool = getTool('getUserSettings');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Get the settings for the current authenticated user.');
      expect(tool?.schema).toEqual({});
    });

    it('should return settings on success', async () => {
      const fakeSettings = { theme: 'dark', notifications: true };
      mockGetUserSettings.mockResolvedValue(fakeSettings);
      const tool = getTool('getUserSettings');
      const result = await tool.callback({});
      expect(mockGetUserSettings).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(fakeSettings, null, 2) }] });
    });

    it('should return error on failure', async () => {
      const error = new Error('Failed to get settings');
      mockGetUserSettings.mockRejectedValue(error);
      const tool = getTool('getUserSettings');
      const result = await tool.callback({});
      expect(result).toEqual({ content: [{ type: 'text', text: `Failed to get user settings: ${error.message}` }] });
    });
  });

  // Test for getPendingInvitations
  describe('bring.getPendingInvitations tool', () => {
    it('should be registered correctly', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'getPendingInvitations',
        'Get any pending invitations for the authenticated user to join shopping lists.',
        {},
        expect.any(Function),
      );
      const tool = getTool('getPendingInvitations');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Get any pending invitations for the authenticated user to join shopping lists.');
      expect(tool?.schema).toEqual({});
    });

    it('should return invitations on success', async () => {
      const fakeInvitations = [{ listId: 'list-invite', fromUser: 'UserA' }];
      mockGetPendingInvitations.mockResolvedValue(fakeInvitations);
      const tool = getTool('getPendingInvitations');
      const result = await tool.callback({});
      expect(mockGetPendingInvitations).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(fakeInvitations, null, 2) }] });
    });

    it('should return error on failure', async () => {
      const error = new Error('Failed to get invitations');
      mockGetPendingInvitations.mockRejectedValue(error);
      const tool = getTool('getPendingInvitations');
      const result = await tool.callback({});
      expect(result).toEqual({
        content: [{ type: 'text', text: `Failed to get pending invitations: ${error.message}` }],
      });
    });
  });
});
