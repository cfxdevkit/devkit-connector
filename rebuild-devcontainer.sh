#!/bin/bash

echo "🔄 Rebuilding devcontainer with Node.js 22..."
echo "This will restart the container with the updated configuration."

# Check if we're in a devcontainer
if [ -n "$REMOTE_CONTAINERS" ] || [ -n "$CODESPACES" ]; then
    echo "⚠️  Please rebuild the devcontainer manually:"
    echo "1. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)"
    echo "2. Type 'Dev Containers: Rebuild Container'"
    echo "3. Select it and wait for the rebuild to complete"
    echo ""
    echo "Or run this command in VS Code terminal:"
    echo "code --command 'dev-containers.rebuild'"
else
    echo "❌ Not running in a devcontainer. Please open this project in VS Code with Dev Containers extension."
fi

echo ""
echo "📋 After rebuilding, the container will have:"
echo "   - Node.js 22 (instead of 20)"
echo "   - Updated dependencies"
echo "   - Better Hardhat compatibility"
echo ""
echo "🚀 Then you can run:"
echo "   cd /workspace/contracts && npx hardhat compile"
echo "   cd /workspace/contracts && pnpm run deploy"