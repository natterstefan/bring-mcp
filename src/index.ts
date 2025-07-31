import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z, ZodRawShape, ZodObject } from 'zod';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import 'dotenv/config';

import { BringClient } from './bringClient.js';
import { registerListTools } from './tools/listTools.js';
import { registerItemTools } from './tools/itemTools.js';
import { registerUserTools } from './tools/userTools.js';
import { registerCatalogTools } from './tools/catalogTools.js';

const server = new McpServer({
  name: 'bring',
  version: '1.0.0',
  capabilities: { resources: {}, tools: {} },
});

// const bc = new BringClient(); // Moved into main

// Define a type for content parts
type McpContentPart = { type: 'text'; text: string; [key: string]: unknown };

// Helper function to create a simple text response
function textToolResult(text: string) {
  const contentPart: McpContentPart = { type: 'text', text };
  return { content: [contentPart] };
}

// Helper function to create a JSON response (as stringified text)
function jsonToolResult(data: unknown) {
  const contentPart: McpContentPart = { type: 'text', text: JSON.stringify(data, null, 2) };
  return { content: [contentPart] };
}

// Generic tool registration helper - Overloads
export function registerTool<TParams extends ZodRawShape, TResult, TArgs = z.infer<ZodObject<TParams>>>(options: {
  server: McpServer;
  bc: BringClient;
  name: string;
  description: string;
  schemaShape: TParams; // Non-optional for this overload
  actionFn: (args: TArgs, bc: BringClient) => Promise<TResult>;
  transformResult?: (result: TResult) => { content: McpContentPart[] };
  failureMessage: string;
}): void;
export function registerTool<TResult>(options: {
  server: McpServer;
  bc: BringClient;
  name: string;
  description: string;
  schemaShape?: undefined; // Schema is undefined for this overload
  actionFn: (args: undefined, bc: BringClient) => Promise<TResult>; // Args are undefined
  transformResult?: (result: TResult) => { content: McpContentPart[] };
  failureMessage: string;
}): void;
// Implementation signature for registerTool
export function registerTool(options: {
  server: McpServer;
  bc: BringClient;
  name: string;
  description: string;
  schemaShape?: ZodRawShape;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionFn: (args: any, bc: BringClient) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformResult?: (result: any) => { content: McpContentPart[] };
  failureMessage: string;
}) {
  const { server, bc, name, description, schemaShape, actionFn, transformResult, failureMessage } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callback = async (args: any) => {
    try {
      const res = await actionFn(args, bc);
      if (transformResult) {
        return transformResult(res);
      }
      return jsonToolResult(res);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${failureMessage}:`, error);
      return textToolResult(`${failureMessage}: ${errorMessage}`);
    }
  };

  if (schemaShape) {
    server.tool(name, description, schemaShape, callback);
  } else {
    server.tool(name, description, {}, callback);
  }
}

const SERVER_CONFIG = {
  name: 'bring',
  version: '1.0.0',
  capabilities: { resources: {}, tools: {} },
};

// Start the server
async function main() {
  if (!process.env.BRING_MAIL || !process.env.BRING_PASSWORD) {
    console.error(
      'Missing BRING_MAIL, BRING_PASSWORD environment variables. Please create a .env file with your Bring credentials (e.g., MAIL=your_email@example.com\nPW=your_password).',
    );
    process.exit(1);
  }

  const bc = new BringClient(); // Instantiated after env check

  // Register tools from modules
  registerListTools(server, bc);
  registerItemTools(server, bc);
  registerUserTools(server, bc);
  registerCatalogTools(server, bc);

  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req: express.Request, res: express.Response) => {
    try {
      const s = new McpServer(SERVER_CONFIG);
      // Register tools for this instance
      registerListTools(s, bc);
      registerItemTools(s, bc);
      registerUserTools(s, bc);
      registerCatalogTools(s, bc);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        console.log('Request closed');
        transport.close();
        s.close();
      });
      await s.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
      res.status(500).send('Internal Server Error');
    }
  });

  // SSE notifications not supported in stateless mode
  app.get('/mcp', async (req: express.Request, res: express.Response) => {
    console.log('Received GET MCP request');
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        id: null,
      }),
    );
  });

  // Session termination not needed in stateless mode
  app.delete('/mcp', async (req: express.Request, res: express.Response) => {
    console.log('Received DELETE MCP request');
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        id: null,
      }),
    );
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, () => {
    console.log(`--> MCP server for Bring! API is running on HTTP :${port} /mcp`);
  });
}

main().catch((e) => {
  console.error('Fatal error starting MCP server:', e);
  process.exit(1);
});
