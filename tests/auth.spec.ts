import { BringClient } from '../src/bringClient';
import { mockMcpServerInstance, mockTools, loadServer, getTool } from './helpers';

let consoleErrorSpy: jest.SpyInstance;

// Mock the Bring library
const mockBringLogin = jest.fn();
const mockBringLoadLists = jest.fn();

jest.mock('bring-shopping', () => {
  return jest.fn().mockImplementation(() => {
    return {
      login: mockBringLogin,
      loadLists: mockBringLoadLists,
      // Add other methods as needed by tests in this file or globally if preferred
    };
  });
});

describe('BringClient Automatic Login', () => {
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    // Reset environment variables for each test to ensure isolation
    delete process.env.BRING_MAIL;
    delete process.env.BRING_PASSWORD;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should automatically login on the first API call and succeed if credentials are valid', async () => {
    process.env.BRING_MAIL = 'test@example.com';
    process.env.BRING_PASSWORD = 'password';

    mockBringLogin.mockResolvedValue(undefined); // Simulate successful login
    mockBringLoadLists.mockResolvedValue([]); // Simulate successful API call after login

    const client = new BringClient();
    await client.loadLists(); // First API call triggers login

    expect(mockBringLogin).toHaveBeenCalledTimes(1);
    expect(mockBringLoadLists).toHaveBeenCalledTimes(1);
  });

  it('should attempt login only once for multiple API calls if successful', async () => {
    process.env.BRING_MAIL = 'test@example.com';
    process.env.BRING_PASSWORD = 'password';

    mockBringLogin.mockResolvedValue(undefined);
    mockBringLoadLists.mockResolvedValue([]);

    const client = new BringClient();
    await client.loadLists(); // First call
    await client.loadLists(); // Second call

    expect(mockBringLogin).toHaveBeenCalledTimes(1); // Login should only happen once
    expect(mockBringLoadLists).toHaveBeenCalledTimes(2);
  });

  it('should fail the API call if automatic login fails due to invalid credentials', async () => {
    process.env.BRING_MAIL = 'wrong@example.com';
    process.env.BRING_PASSWORD = 'wrongpassword';
    const loginError = new Error('Invalid Bring credentials');
    mockBringLogin.mockRejectedValue(loginError); // Simulate failed login

    const client = new BringClient();

    await expect(client.loadLists()).rejects.toThrow(loginError);
    expect(mockBringLogin).toHaveBeenCalledTimes(1);
    expect(mockBringLoadLists).not.toHaveBeenCalled(); // API call should not proceed
  });

  it('should re-attempt login on a subsequent API call if the first login attempt failed', async () => {
    process.env.BRING_MAIL = 'firstfail@example.com';
    process.env.BRING_PASSWORD = 'password';
    const loginError = new Error('Login failed initially');

    // First attempt: Login fails
    mockBringLogin.mockRejectedValueOnce(loginError);
    const client = new BringClient();
    await expect(client.loadLists()).rejects.toThrow(loginError);
    expect(mockBringLogin).toHaveBeenCalledTimes(1);
    expect(mockBringLoadLists).not.toHaveBeenCalled();

    // Second attempt: Login succeeds
    mockBringLogin.mockResolvedValueOnce(undefined); // Simulate successful login on retry
    mockBringLoadLists.mockResolvedValueOnce([]); // Simulate successful API call
    await client.loadLists(); // This should re-attempt login

    expect(mockBringLogin).toHaveBeenCalledTimes(2); // Login attempted twice
    expect(mockBringLoadLists).toHaveBeenCalledTimes(1); // API call succeeds after second login
  });
});

// The MCP server part of the tests can be removed or adapted
// if no direct 'login' tool is exposed anymore.
// For now, let's remove the MCP related tests for login tool as it doesn't exist.
describe('MCP Bring! Server - Tool Registration (Post-Login Refactor)', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    mockTools.clear();
    // Ensure necessary mocks for server loading are in place if needed
    // For example, if loadServer itself tries to make API calls
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should no longer register a dedicated 'login' tool", async () => {
    // Simulate server loading to check registered tools
    // This might require mocking BringClient or its methods if loadServer uses them
    process.env.BRING_MAIL = 'test@example.com'; // Needed for BringClient instantiation
    process.env.BRING_PASSWORD = 'password';
    mockBringLogin.mockResolvedValue(undefined); // Prevent login issues during server load

    await loadServer(); // This populates mockTools

    const loginTool = getTool('login');
    expect(loginTool).toBeUndefined(); // The login tool should not be registered
    expect(mockMcpServerInstance.tool).not.toHaveBeenCalledWith(
      'login',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });
});
