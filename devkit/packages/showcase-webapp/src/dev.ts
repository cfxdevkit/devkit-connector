// Development entry point for the showcase webapp
import { server as app } from './server-entry.js';

const port = process.env.PORT || 3002;

// Start the server in development mode
app.listen(port, () => {
  console.log(`🌐 Showcase WebApp running on port ${port}`);
  console.log(`📱 Open: http://localhost:${port}`);
  console.log(`🔗 API Proxy: http://localhost:${port}/api`);
  console.log(`💚 Health: http://localhost:${port}/health`);
  console.log(`🔄 Development mode - watching for changes...`);
  console.log(`\n📋 Note: This is a demonstration of the DevKit architecture.`);
  console.log(
    `   Server-side packages run on the backend, browser-side packages in the frontend.`
  );
});
