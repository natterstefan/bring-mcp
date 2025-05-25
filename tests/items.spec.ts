import {
  mockGetItems,
  mockGetItemsDetails,
  mockSaveItem,
  mockRemoveItem,
  mockMoveToRecentList,
  mockMcpServerInstance,
  mockTools,
  loadServer,
  getTool,
} from './helpers'; // Import from helpers

let consoleErrorSpy: jest.SpyInstance;

describe('MCP Bring! Server - Item Tools', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    mockTools.clear();
    await loadServer();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('bring.getItems tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'getItems',
        'Get all items from a specific shopping list.', // From src/index.ts
        expect.objectContaining({ listUuid: expect.anything() }), // Adjusted schema check
        expect.any(Function),
      );
      const tool = getTool('getItems');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Get all items from a specific shopping list.');
      expect(tool?.schema).toMatchObject({ listUuid: {} });
    });

    it('should call BringClient.getItems with listUuid and return items', async () => {
      const fakeListUuid = 'test-list-uuid';
      const fakeItems = [{ id: 'item1', name: 'Milk' }];
      mockGetItems.mockResolvedValue(fakeItems);

      const getItemsTool = getTool('getItems');
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

      const getItemsTool = getTool('getItems');
      const result = await getItemsTool.callback({ listUuid: fakeListUuid });

      expect(mockGetItems).toHaveBeenCalledWith(fakeListUuid);
      expect(result).toEqual({
        content: [{ type: 'text', text: `Failed to get items: ${errorMessage}` }],
      });
    });
  });

  describe('bring.getItemsDetails tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'getItemsDetails',
        'Get details for items in a list. (Currently might only take listUuid)', // Corrected description
        expect.objectContaining({ listUuid: expect.anything() }), // Adjusted schema check
        expect.any(Function),
      );
      const tool = getTool('getItemsDetails');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Get details for items in a list. (Currently might only take listUuid)');
      expect(tool?.schema).toMatchObject({ listUuid: {} }); // Schema has only listUuid
    });

    it('should call BringClient.getItemsDetails and return item details on success', async () => {
      const fakeListUuid = 'list-123';
      // itemId is not used by the tool's current implementation in src/index.ts
      const fakeItemDetails = { id: 'item-abc', name: 'Detailed Milk', specification: 'Organic' };
      mockGetItemsDetails.mockResolvedValue(fakeItemDetails);

      const tool = getTool('getItemsDetails');
      const result = await tool.callback({ listUuid: fakeListUuid }); // Corrected: only pass listUuid

      expect(mockGetItemsDetails).toHaveBeenCalledWith(fakeListUuid); // Corrected: only expect listUuid
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(fakeItemDetails, null, 2) }],
      });
    });

    it('should return an error message on failed getItemsDetails', async () => {
      const fakeListUuid = 'list-123';
      // itemId is not used by the tool's current implementation in src/index.ts
      const errorMessage = 'Item details not found';
      mockGetItemsDetails.mockRejectedValue(new Error(errorMessage));
      const tool = getTool('getItemsDetails');
      const result = await tool.callback({ listUuid: fakeListUuid }); // Corrected: only pass listUuid
      expect(mockGetItemsDetails).toHaveBeenCalledWith(fakeListUuid); // Corrected: only expect listUuid
      expect(result).toEqual({ content: [{ type: 'text', text: `Failed to get item details: ${errorMessage}` }] });
    });
  });

  describe('bring.saveItem tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'saveItem',
        'Save an item to a specific shopping list. Optionally include a specification (e.g., quantity, brand).',
        expect.objectContaining({
          listUuid: expect.anything(),
          itemName: expect.anything(),
          specification: expect.anything(),
        }),
        expect.any(Function),
      );
      const tool = getTool('saveItem');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe(
        'Save an item to a specific shopping list. Optionally include a specification (e.g., quantity, brand).',
      ); // Corrected
      expect(tool?.schema).toMatchObject({ listUuid: {}, itemName: {}, specification: {} });
    });

    it('should call BringClient.saveItem and return success message on success (with spec)', async () => {
      const fakeListUuid = 'list-123';
      const fakeItemName = 'Eggs';
      const fakeItemSpec = '6 pack';
      const savedItemConfirmation = { itemId: 'item-xyz', message: 'Item saved successfully' };
      mockSaveItem.mockResolvedValue(savedItemConfirmation);
      const tool = getTool('saveItem');
      const result = await tool.callback({
        listUuid: fakeListUuid,
        itemName: fakeItemName,
        specification: fakeItemSpec,
      });
      // This is the critical check. If args.specification is not passed correctly from Zod, this will fail.
      expect(mockSaveItem).toHaveBeenCalledWith(fakeListUuid, fakeItemName, fakeItemSpec);
      expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(savedItemConfirmation, null, 2) }] });
    });

    it('should return an error message on failed saveItem', async () => {
      const fakeListUuid = 'list-123';
      const fakeItemName = 'Eggs';
      const fakeItemSpec = '6 pack';
      const errorMessage = 'Could not save item';
      mockSaveItem.mockRejectedValue(new Error(errorMessage));
      const tool = getTool('saveItem');
      const result = await tool.callback({
        listUuid: fakeListUuid,
        itemName: fakeItemName,
        specification: fakeItemSpec,
      });
      expect(mockSaveItem).toHaveBeenCalledWith(fakeListUuid, fakeItemName, fakeItemSpec);
      expect(result).toEqual({ content: [{ type: 'text', text: `Failed to save item: ${errorMessage}` }] });
    });
  });

  describe('bring.removeItem tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'removeItem',
        'Remove an item from a specific shopping list.',
        expect.objectContaining({ listUuid: expect.anything(), itemId: expect.anything() }),
        expect.any(Function),
      );
      const tool = getTool('removeItem');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Remove an item from a specific shopping list.'); // Corrected
      expect(tool?.schema).toMatchObject({ listUuid: {}, itemId: {} });
    });

    it('should call BringClient.removeItem and return success message', async () => {
      const fakeListUuid = 'list-123';
      const fakeItemId = 'item-toremove';
      const successResponse = { message: 'Item removed successfully' };
      mockRemoveItem.mockResolvedValue(successResponse);

      const tool = getTool('removeItem');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId });

      expect(mockRemoveItem).toHaveBeenCalledWith(fakeListUuid, fakeItemId);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(successResponse, null, 2) }],
      });
    });

    it('should return an error message on failed removeItem', async () => {
      const fakeListUuid = 'list-123';
      const fakeItemId = 'item-toremove';
      const errorMessage = 'Could not remove item';
      mockRemoveItem.mockRejectedValue(new Error(errorMessage));

      const tool = getTool('removeItem');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId });

      expect(mockRemoveItem).toHaveBeenCalledWith(fakeListUuid, fakeItemId);
      expect(result).toEqual({
        content: [{ type: 'text', text: `Failed to remove item: ${errorMessage}` }],
      });
    });
  });

  describe('bring.moveToRecentList tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'moveToRecentList',
        'Move an item from a shopping list to the recently used items list.',
        expect.objectContaining({ listUuid: expect.anything(), itemId: expect.anything() }),
        expect.any(Function),
      );
      const tool = getTool('moveToRecentList');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Move an item from a shopping list to the recently used items list.'); // Corrected
      expect(tool?.schema).toMatchObject({ listUuid: {}, itemId: {} });
    });

    it('should call BringClient.moveToRecentList and return success message', async () => {
      const fakeListUuid = 'list-123';
      const fakeItemId = 'item-tomove';
      const successResponse = { message: 'Item moved successfully' };
      mockMoveToRecentList.mockResolvedValue(successResponse);

      const tool = getTool('moveToRecentList');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId });

      expect(mockMoveToRecentList).toHaveBeenCalledWith(fakeListUuid, fakeItemId);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(successResponse, null, 2) }],
      });
    });

    it('should return an error message on failed moveToRecentList', async () => {
      const fakeListUuid = 'list-123';
      const fakeItemId = 'item-tomove';
      const errorMessage = 'Could not move item';
      mockMoveToRecentList.mockRejectedValue(new Error(errorMessage));

      const tool = getTool('moveToRecentList');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId });

      expect(mockMoveToRecentList).toHaveBeenCalledWith(fakeListUuid, fakeItemId);
      expect(result).toEqual({
        content: [{ type: 'text', text: `Failed to move item to recent list: ${errorMessage}` }],
      });
    });
  });
});
