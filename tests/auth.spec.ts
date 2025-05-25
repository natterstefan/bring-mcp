import { mockLogin, mockMcpServerInstance, mockTools, loadServer, getTool } from './helpers'; // Import from helpers

let consoleErrorSpy: jest.SpyInstance;

// Placeholder for authentication tests
describe('Auth Tests', () => {
  it('should have a placeholder test', () => {
    expect(true).toBe(true);
  });
});

describe('MCP Bring! Server - Auth Tool', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    mockTools.clear();
    await loadServer();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('bring.login tool', () => {
    it('should be registered with correct name, description, and schema', () => {
      expect(mockMcpServerInstance.tool).toHaveBeenCalledWith(
        'login',
        'Authenticate with Bring! API. Call this first.',
        {}, // Schema for no-param tool
        expect.any(Function), // Callback
      );
      const loginTool = getTool('login');
      expect(loginTool).toBeDefined();
      expect(loginTool?.description).toBe('Authenticate with Bring! API. Call this first.');
      expect(loginTool?.schema).toEqual({});
    });

    it('should call BringClient.login and return success on successful login', async () => {
      mockLogin.mockResolvedValue({ message: 'Login successful' });

      const loginTool = getTool('login');
      const result = await loginTool.callback({});

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully logged in to Bring!' }],
      });
    });

    it('should return an error message on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue(new Error(errorMessage));

      const loginTool = getTool('login');
      const result = await loginTool.callback({});

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        content: [{ type: 'text', text: `Login failed: ${errorMessage}` }],
      });
    });
  });
});
