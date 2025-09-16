# DevContainer Guide for Conflux Dual Wallet Demo

This guide explains how to use the DevContainer for the Conflux Dual Wallet Demo project.

## 🚀 Quick Start

### Option 1: VS Code DevContainer (Recommended)

1. **Prerequisites:**
   - VS Code with Dev Containers extension
   - Docker Desktop running
   - Git

2. **Setup:**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd minimal
   
   # Open in VS Code
   code .
   ```

3. **Open in Container:**
   - VS Code will detect the `.devcontainer` folder
   - Click "Reopen in Container" when prompted
   - Wait for the container to build and start

4. **Start Services:**
   ```bash
   ./start-all.sh
   ```

### Option 2: Docker Compose

1. **Prerequisites:**
   - Docker and Docker Compose
   - Git

2. **Setup:**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd minimal
   
   # Start all services
   docker-compose up -d
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Conflux eSpace: http://localhost:12537
   - Conflux Core: http://localhost:12539

## 🛠️ What's Included

### Development Environment
- **Node.js 20** with TypeScript support
- **pnpm** package manager
- **Docker-in-Docker** for containerized services
- **Git** and **GitHub CLI** for version control

### VS Code Extensions
- TypeScript and JavaScript support
- React and React Native snippets
- Solidity language support
- Prettier code formatter
- ESLint
- Docker support
- Git and GitHub integration
- Markdown support

### Pre-configured Ports
- **3000** - Frontend (React)
- **3001** - API Server
- **12537** - Conflux eSpace RPC
- **12539** - Conflux Core RPC

### Environment Variables
```bash
NODE_ENV=development
ESPACE_RPC_URL=http://localhost:12537
CORE_RPC_URL=http://localhost:12539
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEPLOYMENTS_PATH=/workspace/deployment/deployments
```

## 🔧 Available Commands

### Development Commands
```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh

# Start individual services
cd server && pnpm run dev
cd frontend && pnpm start
cd node-manager && pnpm run start:node

# Deploy contracts
cd deployment && pnpm run deploy

# Test API
curl http://localhost:3001/health
```

### VS Code Tasks
Access via Command Palette (`Ctrl+Shift+P`):
- "Tasks: Run Task" → "Start All Services"
- "Tasks: Run Task" → "Stop All Services"
- "Tasks: Run Task" → "Start Server Only"
- "Tasks: Run Task" → "Start Frontend Only"
- "Tasks: Run Task" → "Deploy Contracts"
- "Tasks: Run Task" → "Test API"

### Debug Configurations
- "Debug Server" - Debug the Express.js server
- "Debug Node Manager" - Debug the node manager

## 📁 Project Structure

```
minimal/
├── .devcontainer/           # DevContainer configuration
│   ├── devcontainer.json    # Container settings
│   ├── setup.sh            # Setup script
│   └── README.md           # DevContainer documentation
├── .vscode/                # VS Code configuration
│   ├── settings.json       # Editor settings
│   ├── tasks.json          # Build tasks
│   └── launch.json         # Debug configurations
├── server/                 # Express.js API server
├── contracts/              # Smart contracts
├── deployment/             # Deployment scripts
├── node-manager/           # Node wrapper
├── frontend/               # React frontend
├── logs/                   # Application logs
├── docker-compose.yml      # Docker Compose configuration
├── start-all.sh           # Start all services
├── stop-all.sh            # Stop all services
└── README.md              # Main documentation
```

## 🐛 Debugging

### Server Debugging
1. Set breakpoints in `server/src/` files
2. Press `F5` or use "Debug Server" configuration
3. Server will start in debug mode
4. Use VS Code debugger to step through code

### Frontend Debugging
1. Open browser developer tools
2. Set breakpoints in React components
3. Use React DevTools extension
4. Check Network tab for API calls

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test contract status
curl http://localhost:3001/api/contracts/status

# Test counter operations
curl -X POST http://localhost:3001/api/contracts/counter/operation \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "value": 10}'
```

## 🔧 Customization

### DevContainer Configuration
Edit `.devcontainer/devcontainer.json`:
```json
{
  "name": "Conflux Dual Wallet Demo",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye",
  "features": {
    // Add more features here
  },
  "customizations": {
    "vscode": {
      "extensions": [
        // Add more extensions here
      ]
    }
  }
}
```

### VS Code Settings
Edit `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Environment Variables
Edit `.devcontainer/devcontainer.json`:
```json
{
  "containerEnv": {
    "NODE_ENV": "development",
    "ESPACE_RPC_URL": "http://localhost:12537",
    "CORE_RPC_URL": "http://localhost:12539"
  }
}
```

## 🆘 Troubleshooting

### Container Won't Start
1. **Check Docker:**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Check Ports:**
   ```bash
   netstat -tlnp | grep :3000
   netstat -tlnp | grep :3001
   ```

3. **Check Logs:**
   ```bash
   docker-compose logs
   ```

### Services Won't Start
1. **Check Dependencies:**
   ```bash
   cd server && pnpm install
   cd frontend && pnpm install
   ```

2. **Check Logs:**
   ```bash
   tail -f logs/server.log
   tail -f logs/frontend.log
   ```

3. **Check Ports:**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

### Build Errors
1. **Clear Cache:**
   ```bash
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

2. **Check TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

3. **Check Dependencies:**
   ```bash
   pnpm audit
   ```

### Performance Issues
1. **Check Resource Usage:**
   ```bash
   docker stats
   ```

2. **Check Memory:**
   ```bash
   free -h
   ```

3. **Check Disk Space:**
   ```bash
   df -h
   ```

## 📚 Additional Resources

- [VS Code Dev Containers](https://code.visualstudio.com/docs/remote/containers)
- [Docker Compose](https://docs.docker.com/compose/)
- [Conflux Documentation](https://docs.confluxnetwork.org/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in the DevContainer
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

