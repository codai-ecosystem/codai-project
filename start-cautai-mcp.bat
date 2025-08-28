@echo off
echo Starting CAUTAI MCP Server...
cd /d "%~dp0packages\cautai-mcp"
npm run start:mcp
pause