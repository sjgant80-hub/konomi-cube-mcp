#!/usr/bin/env node
// konomi-cube-mcp · MCP stdio server wrapping konomi-cube-sdk · MIT · AI-Native Solutions
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'konomi-cube-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'konomi-cube_build_cube',
    description: 'buildCube · from konomi-cube-sdk',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => {
      const { buildCube } = await import('@ai-native-solutions/konomi-cube-sdk');
      return typeof buildCube === 'function' ? await buildCube(args) : { error: 'buildCube not callable' };
    }
  },
  {
    name: 'konomi-cube_rebuild',
    description: 'rebuild · from konomi-cube-sdk',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => {
      const { rebuild } = await import('@ai-native-solutions/konomi-cube-sdk');
      return typeof rebuild === 'function' ? await rebuild(args) : { error: 'rebuild not callable' };
    }
  },
  {
    name: 'konomi-cube_animate',
    description: 'animate · from konomi-cube-sdk',
    inputSchema: { type: 'object', properties: {} },
    handler: async (args) => {
      const { animate } = await import('@ai-native-solutions/konomi-cube-sdk');
      return typeof animate === 'function' ? await animate(args) : { error: 'animate not callable' };
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ handler, ...rest }) => rest)
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const t = TOOLS.find(x => x.name === req.params.name);
  if (!t) throw new Error('unknown tool: ' + req.params.name);
  const result = await t.handler(req.params.arguments || {});
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

await server.connect(new StdioServerTransport());
console.error('konomi-cube-mcp v1.0.0 · stdio ready');
