import type { Request, Response } from 'express';
import { ServerWalletService } from '../services/wallet-service';

// JWT temporarily disabled for build testing

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Middleware to verify JWT token (temporarily disabled for testing)
function verifyAuth(_req: AuthenticatedRequest): string | null {
  // Temporarily return mock user for testing
  return `test-user-${Date.now()}`;
}

export class WalletRoutes {
  private walletService: ServerWalletService;

  constructor() {
    this.walletService = ServerWalletService.getInstance();
  }

  // Set node manager reference (called from main server)
  setNodeManager(nodeManager: unknown) {
    this.walletService.setNodeManager(nodeManager as any);
  }

  // Load server-managed wallet
  loadWallet = async (req: AuthenticatedRequest, res: Response) => {
    console.log('🔍 loadWallet called');
    const userId = verifyAuth(req);
    if (!userId) {
      console.log('❌ Unauthorized - no userId');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log(`✅ Authorized userId: ${userId}`);

    try {
      // Check if we have a pre-loaded demo wallet
      if ((global as Record<string, unknown>).demoWalletId) {
        console.log('🔄 Using pre-loaded demo wallet...');
        const wallet = this.walletService.getWallet(
          (global as Record<string, unknown>).demoWalletId as string
        );
        if (wallet) {
          const walletData = {
            eSpaceAddress: wallet.address,
            coreAddress: `cfx:${wallet.address.slice(2)}`, // Simple conversion for demo
            walletId: (global as Record<string, unknown>)
              .demoWalletId as string,
          };
          console.log('✅ Using pre-loaded wallet:', walletData);
          return res.json({
            success: true,
            data: walletData,
          });
        }
      }

      console.log('🔄 Calling walletService.loadWalletFromServer...');
      const walletData = await this.walletService.loadWalletFromServer(userId);
      console.log('✅ Wallet loaded successfully:', walletData);
      res.json({
        success: true,
        data: walletData,
      });
    } catch (error) {
      console.error('❌ Error in loadWallet:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Sign transaction with server wallet
  signTransaction = async (req: AuthenticatedRequest, res: Response) => {
    const userId = verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { walletId, transaction, chainType } = req.body;
      const signature = await this.walletService.signTransaction(
        walletId,
        transaction,
        chainType
      );

      res.json({
        success: true,
        data: { signature },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Sign message with server wallet
  signMessage = async (req: AuthenticatedRequest, res: Response) => {
    const userId = verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { walletId, message } = req.body;
      const signature = await this.walletService.signMessage(walletId, message);

      res.json({
        success: true,
        data: { signature },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Create delegation session
  createDelegation = async (req: AuthenticatedRequest, res: Response) => {
    const userId = verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { userAddress, delegateAddress, config } = req.body;
      const sessionId = this.walletService.createDelegationSession(
        userAddress,
        delegateAddress,
        config
      );

      res.json({
        success: true,
        data: { sessionId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Get delegation session
  getDelegation = async (req: AuthenticatedRequest, res: Response) => {
    const userId = verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { sessionId } = req.params;
      const session = this.walletService.getDelegationSession(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Delegation session not found or expired',
        });
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Clear wallet from memory
  clearWallet = async (req: AuthenticatedRequest, res: Response) => {
    const userId = verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { walletId } = req.body;
      this.walletService.clearWallet(walletId);

      res.json({
        success: true,
        data: { message: 'Wallet cleared successfully' },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Process wallet operation with delegation validation
  processWalletOperation = async (req: AuthenticatedRequest, res: Response) => {
    const userId = verifyAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { sessionId, operation } = req.body;

      // Validate operation against delegation rules
      const isValid = this.walletService.validateWalletOperation(
        sessionId,
        operation
      );
      if (!isValid) {
        return res.status(403).json({
          success: false,
          error: 'Operation not allowed by delegation rules',
        });
      }

      // Process the operation based on type
      let result: unknown;
      switch (operation.type) {
        case 'sign_transaction':
          result = await this.walletService.signTransaction(
            operation.walletId,
            operation.payload,
            operation.chainType
          );
          break;
        case 'sign_message':
          result = await this.walletService.signMessage(
            operation.walletId,
            operation.payload.message
          );
          break;
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }

      res.json({
        success: true,
        data: { result },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Create delegation from browser wallet
  createBrowserDelegation = async (req: Request, res: Response) => {
    try {
      const {
        delegationMessage,
        signature,
        userAddress,
        delegateAddress,
        config,
      } = req.body;

      if (
        !delegationMessage ||
        !signature ||
        !userAddress ||
        !delegateAddress
      ) {
        return res.status(400).json({
          success: false,
          error: 'Missing required delegation parameters',
        });
      }

      // Verify the signature (simplified - in production you'd verify the signature)
      console.log('🔍 Creating browser delegation:', {
        userAddress,
        delegateAddress,
        config,
      });

      // Create delegation session
      const sessionId = this.walletService.createDelegationSession(
        userAddress,
        delegateAddress,
        config
      );

      res.json({
        success: true,
        data: { sessionId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Load server wallet from node manager
  loadWalletFromNode = async (req: AuthenticatedRequest, res: Response) => {
    console.log('🔍 loadWalletFromNode called');
    const userId = verifyAuth(req);
    if (!userId) {
      console.log('❌ Unauthorized - no userId');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log(`✅ Authorized userId: ${userId}`);

    try {
      // Debug: Check global node manager
      console.log(
        '🔍 Global node manager exists:',
        !!(global as Record<string, unknown>).globalNodeManager
      );
      console.log(
        '🔍 Local node manager exists:',
        !!this.walletService.nodeManager
      );

      const result = await this.walletService.loadServerWalletFromNode();

      if (result.success) {
        console.log('✅ Loaded wallet from node:', result.data);
        return res.json({
          success: true,
          data: result.data,
        });
      } else {
        console.log('❌ Failed to load wallet from node:', result.error);
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error('❌ Error loading wallet from node:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
