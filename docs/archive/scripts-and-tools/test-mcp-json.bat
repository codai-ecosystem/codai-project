cd e:\GitHub\codai-project\apps\memorai\packages\mcp
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/server.js > mcp-test-output.txt 2>&1
type mcp-test-output.txt
pause
