import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import contractRoutes from "./routes/contracts";
import { WalletRoutes } from "./routes/wallet";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting - much more generous for development, especially with React Strict Mode
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute windows for faster reset
  max: process.env.NODE_ENV === "development" ? 10000 : 100, // Very high limit for dev
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
    retryAfter: process.env.NODE_ENV === "development" ? 60 : 15 * 60, // shorter retry in dev
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: any, res) => {
    const retryAfter = Math.round(
      (req.rateLimit.resetTime - Date.now()) / 1000
    );
    console.log(
      `🚫 Rate limit hit for ${req.ip} on ${req.path} - retry in ${retryAfter}s`
    );

    res.status(429).json({
      success: false,
      error: `Too many requests from this IP. Please try again in ${retryAfter} seconds.`,
      retryAfter: retryAfter,
    });
  },
});
app.use(limiter);

// Initialize wallet routes
const walletRoutes = new WalletRoutes();

// Routes
app.use("/api/contracts", contractRoutes);

// Delegation routes (specific routes first)
app.post("/api/wallet/delegation", walletRoutes.createBrowserDelegation);
app.get("/api/wallet/delegation/:sessionId", walletRoutes.getDelegation);

// Wallet API routes - action-based endpoints
app.use("/api/wallet", (req, res, next) => {
  console.log(`🔍 Wallet API request: ${req.method} ${req.path}`, req.body);

  // Handle action-based routes
  const { action } = req.body;
  console.log(`📝 Handling action: ${action}`);
  switch (action) {
    case "load_wallet":
      return walletRoutes.loadWallet(req, res);
    case "sign_transaction":
      return walletRoutes.signTransaction(req, res);
    case "sign_message":
      return walletRoutes.signMessage(req, res);
    case "clear_wallet":
      return walletRoutes.clearWallet(req, res);
    case "create_delegation":
      return walletRoutes.createDelegation(req, res);
    case "process_operation":
      return walletRoutes.processWalletOperation(req, res);
    default:
      return res.status(400).json({ success: false, error: "Invalid action" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "minimal-contract-server",
  });
});

// Auto-load server wallet on startup
async function initializeServer() {
  try {
    console.log("🔄 Auto-loading server wallet...");
    const { ServerWalletService } = await import("./services/wallet-service");
    const walletService = ServerWalletService.getInstance();

    // Use a consistent demo user ID for auto-loading
    const demoUserId = "demo-user";
    const walletData = await walletService.loadWalletFromServer(demoUserId);

    console.log("✅ Server wallet loaded successfully");
    console.log(`📍 eSpace Address: ${walletData.eSpaceAddress}`);
    console.log(`📍 Core Address: ${walletData.coreAddress}`);
    console.log(`🆔 Wallet ID: ${walletData.walletId}`);

    // Store the wallet ID globally for API access
    (global as any).demoWalletId = walletData.walletId;
  } catch (error) {
    console.log(
      "⚠️  Server wallet auto-load failed, will load on first request"
    );
    console.error("Auto-load error:", error);
  }
}

// Start server
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`🚀 Minimal Server running on port ${PORT}`);
    console.log(`📊 Contract API: http://localhost:${PORT}/api/contracts`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);

    // Auto-load wallet after server starts
    await initializeServer();
  });
}

export default app;
