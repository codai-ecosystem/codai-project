@echo off
cd /d "E:\GitHub\codai-project\packages\controlai-mcp"
echo Building ControlAI MCP...
pnpm run build
if %errorlevel% equ 0 (
    echo Build successful! Publishing to npm...
    npm version patch --no-git-tag-version
    npm publish --registry https://registry.npmjs.org/ --access public
    echo Package published successfully!
) else (
    echo Build failed with error code %errorlevel%
)
