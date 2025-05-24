// We don't need to import BringClient directly anymore as it's fully mocked via jest.mock

// --- Mocking BringClient ---
// Keep track of mock functions for BringClient methods
let mockLogin: jest.Mock;
let mockLoadLists: jest.Mock;
let mockGetItems: jest.Mock;
let mockGetItemsDetails: jest.Mock;
let mockSaveItem: jest.Mock;
let mockRemoveItem: jest.Mock;
let mockMoveToRecentList: jest.Mock;
let mockSaveItemImage: jest.Mock;
let mockRemoveItemImage: jest.Mock;
let mockGetAllUsersFromList: jest.Mock;
let mockGetUserSettings: jest.Mock;
let mockLoadTranslations: jest.Mock;
let mockLoadCatalog: jest.Mock;
let mockGetPendingInvitations: jest.Mock;

jest.mock('../bringClient.js', () => {
  // Initialize mock functions here so they exist in the module scope
  // for the factory to capture.
  mockLogin = jest.fn();
  mockLoadLists = jest.fn();
  mockGetItems = jest.fn();
  mockGetItemsDetails = jest.fn();
  mockSaveItem = jest.fn();
  mockRemoveItem = jest.fn();
  mockMoveToRecentList = jest.fn();
  mockSaveItemImage = jest.fn();
  mockRemoveItemImage = jest.fn();
  mockGetAllUsersFromList = jest.fn();
  mockGetUserSettings = jest.fn();
  mockLoadTranslations = jest.fn();
  mockLoadCatalog = jest.fn();
  mockGetPendingInvitations = jest.fn();

  return {
    BringClient: jest.fn().mockImplementation(() => ({
      login: mockLogin,
      loadLists: mockLoadLists,
      getItems: mockGetItems,
      getItemsDetails: mockGetItemsDetails,
      saveItem: mockSaveItem,
      removeItem: mockRemoveItem,
      moveToRecentList: mockMoveToRecentList,
      saveItemImage: mockSaveItemImage,
      removeItemImage: mockRemoveItemImage,
      getAllUsersFromList: mockGetAllUsersFromList,
      getUserSettings: mockGetUserSettings,
      loadTranslations: mockLoadTranslations,
      loadCatalog: mockLoadCatalog,
      getPendingInvitations: mockGetPendingInvitations,
    })),
  };
});

// --- Mocking McpServer ---
const mockTools: Map<
  string,
  {
    description: string;
    schema: Record<string, unknown>;
    callback: (...args: Record<string, unknown>[]) => Promise<Record<string, unknown>>;
  }
> = new Map();
const mockMcpServerInstance = {
  tool: jest.fn((name, description, schema, callback) => {
    mockTools.set(name, { description, schema, callback });
  }),
  connect: jest.fn(),
};
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn(() => mockMcpServerInstance),
}));

// --- Mocking StdioServerTransport ---
jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn(() => ({})),
}));

// --- Mocking dotenv ---
jest.mock('dotenv/config', () => ({}));

// --- Test Setup ---
async function loadServer() {
  jest.resetModules(); // Reset modules to ensure index.ts is re-evaluated

  // Set up process.env before index.ts is loaded
  process.env.MAIL = 'test@example.com';
  process.env.PW = 'testpassword';

  // Dynamically import index.ts AFTER mocks are set up
  await import('../index.js');
}

describe('MCP Bring! Server - Tools', () => {
  beforeEach(async () => {
    // Clear all mock instances and calls, and custom map
    jest.clearAllMocks(); // Clears tool calls on mockMcpServerInstance, and calls/results on BringClient mocks
    mockTools.clear();

    // Specific mocks for BringClient methods are already jest.fn() from the factory.
    // We just need to clear their history if jest.clearAllMocks() wasn't enough,
    // or set default behaviors for a describe block if needed.
    // jest.clearAllMocks() should handle resetting the .mock property of each jest.fn()

    await loadServer(); // This will re-run index.ts, re-registering tools
  });

  describe('bring.login tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'login',
        'Authenticate with Bring! API. Call this first.',
        {}, // Schema for no-param tool
        expect.any(Function), // Callback
      );
      const loginTool = mockTools.get('login');
      expect(loginTool).toBeDefined();
      expect(loginTool?.description).toBe('Authenticate with Bring! API. Call this first.');
      expect(loginTool?.schema).toEqual({});
    });

    it('should call BringClient.login and return success on successful login', async () => {
      mockLogin.mockResolvedValue({ message: 'Login successful' });

      const loginTool = mockTools.get('login');
      if (!loginTool) throw new Error('Login tool not found');

      const result = await loginTool.callback({});

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully logged in to Bring!' }],
      });
    });

    it('should return an error message on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue(new Error(errorMessage));

      const loginTool = mockTools.get('login');
      if (!loginTool) throw new Error('Login tool not found');

      const result = await loginTool.callback({});

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        content: [{ type: 'text', text: `Login failed: ${errorMessage}` }],
      });
    });
  });

  // --- TODO: Add tests for other tools (loadLists, getItems, etc.) ---
  describe('bring.getItems tool', () => {
    const getItemsToolSchemaShape = { listUuid: expect.any(Object) }; // Zod types become objects

    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'getItems',
        expect.any(String),
        getItemsToolSchemaShape, // schema for getItems
        expect.any(Function),
      );
      const tool = mockTools.get('getItems');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Get all items from a specific shopping list.');
      // For Zod schemas, .shape is passed.
      expect(tool?.schema).toMatchObject({ listUuid: {} }); // Check for the presence of listUuid
    });

    it('should call BringClient.getItems with listUuid and return items', async () => {
      const fakeListUuid = 'test-list-uuid';
      const fakeItems = [{ id: 'item1', name: 'Milk' }];
      mockGetItems.mockResolvedValue(fakeItems);

      const getItemsTool = mockTools.get('getItems');
      if (!getItemsTool) throw new Error('getItems tool not found');

      const result = await getItemsTool.callback({ listUuid: fakeListUuid });

      expect(mockGetItems).toHaveBeenCalledWith(fakeListUuid);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(fakeItems, null, 2) }],
      });
    });

    it('should return an error message on failed getItems', async () => {
      const fakeListUuid = 'test-list-uuid';
      const errorMessage = 'List not found';
      mockGetItems.mockRejectedValue(new Error(errorMessage));

      const getItemsTool = mockTools.get('getItems');
      if (!getItemsTool) throw new Error('getItems tool not found');

      const result = await getItemsTool.callback({ listUuid: fakeListUuid });

      expect(mockGetItems).toHaveBeenCalledWith(fakeListUuid);
      expect(result).toEqual({
        content: [{ type: 'text', text: `Failed to get items: ${errorMessage}` }],
      });
    });
  });
});
