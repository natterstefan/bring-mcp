import {
  mockSaveItemImage,
  mockRemoveItemImage,
  mockMcpServerInstance,
  mockTools,
  loadServer,
  getTool,
} from './helpers';

let consoleErrorSpy: jest.SpyInstance;

describe('MCP Bring! Server - Image Tools', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    mockTools.clear();
    await loadServer();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('bring.saveItemImage tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'saveItemImage',
        'Save an image for an item on a shopping list. Provide a local path or a URL to the image.',
        expect.objectContaining({
          listUuid: expect.anything(),
          itemId: expect.anything(),
          imagePathOrUrl: expect.anything(),
        }),
        expect.any(Function),
      );
      const tool = getTool('saveItemImage');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe(
        'Save an image for an item on a shopping list. Provide a local path or a URL to the image.',
      );
      expect(tool?.schema).toMatchObject({ listUuid: {}, itemId: {}, imagePathOrUrl: {} });
    });

    it('should call BringClient.saveItemImage and return success', async () => {
      const fakeListUuid = 'list-img';
      const fakeItemId = 'item-img';
      const fakeImagePath = '/path/to/image.jpg';
      const successResponse = { message: 'Image saved successfully' };
      mockSaveItemImage.mockResolvedValue(successResponse);
      const tool = getTool('saveItemImage');
      if (!tool) throw new Error('Tool saveItemImage not found');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId, imagePathOrUrl: fakeImagePath });
      expect(mockSaveItemImage).toHaveBeenCalledWith(fakeListUuid, fakeItemId, fakeImagePath);
      expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(successResponse, null, 2) }] });
    });

    it('should return an error message on failed saveItemImage', async () => {
      const fakeListUuid = 'list-img';
      const fakeItemId = 'item-img';
      const fakeImagePath = '/path/to/image.jpg';
      const errorMessage = 'Could not save image';
      mockSaveItemImage.mockRejectedValue(new Error(errorMessage));
      const tool = getTool('saveItemImage');
      if (!tool) throw new Error('Tool saveItemImage not found');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId, imagePathOrUrl: fakeImagePath });
      expect(mockSaveItemImage).toHaveBeenCalledWith(fakeListUuid, fakeItemId, fakeImagePath);
      expect(result).toEqual({ content: [{ type: 'text', text: `Failed to save item image: ${errorMessage}` }] });
    });
  });

  describe('bring.removeItemImage tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'removeItemImage',
        'Remove an image from an item on a shopping list.',
        expect.objectContaining({ listUuid: expect.anything(), itemId: expect.anything() }),
        expect.any(Function),
      );
      const tool = getTool('removeItemImage');
      expect(tool).toBeDefined();
      expect(tool?.description).toBe('Remove an image from an item on a shopping list.');
      expect(tool?.schema).toMatchObject({ listUuid: {}, itemId: {} });
    });

    it('should call BringClient.removeItemImage and return success', async () => {
      const fakeListUuid = 'list-img-remove';
      const fakeItemId = 'item-img-remove';
      const successResponse = { message: 'Image removed successfully' };
      mockRemoveItemImage.mockResolvedValue(successResponse);
      const tool = getTool('removeItemImage');
      if (!tool) throw new Error('Tool removeItemImage not found');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId });
      expect(mockRemoveItemImage).toHaveBeenCalledWith(fakeListUuid, fakeItemId);
      expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(successResponse, null, 2) }] });
    });

    it('should return an error message on failed removeItemImage', async () => {
      const fakeListUuid = 'list-img-remove';
      const fakeItemId = 'item-img-remove';
      const errorMessage = 'Could not remove image';
      mockRemoveItemImage.mockRejectedValue(new Error(errorMessage));
      const tool = getTool('removeItemImage');
      if (!tool) throw new Error('Tool removeItemImage not found');
      const result = await tool.callback({ listUuid: fakeListUuid, itemId: fakeItemId });
      expect(mockRemoveItemImage).toHaveBeenCalledWith(fakeListUuid, fakeItemId);
      expect(result).toEqual({ content: [{ type: 'text', text: `Failed to remove item image: ${errorMessage}` }] });
    });
  });
});
