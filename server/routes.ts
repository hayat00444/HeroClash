import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  GameRound, GameState, WebSocketMessage,
  NUMBER_COLOR_MAP, PAYOUT_MULTIPLIERS,
  insertBetSchema, insertTransactionSchema, insertDepositRequestSchema
} from "@shared/schema";
import { z } from "zod";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time game updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Game state
  let gameState: GameState = {
    currentPeriod: generatePeriod(),
    timeRemaining: 60,
    lastResults: [],
    roundActive: true
  };
  
  // Connected clients
  const clients = new Map<WebSocket, { userId?: number }>();
  
  // Broadcast message to all connected clients
  function broadcast(message: WebSocketMessage) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  // Authenticate user API endpoint
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Your account has been banned', 
        banReason: user.banReason 
      });
    }
    
    // Set session
    if (!req.session) {
      req.session = {} as any;
    }
    req.session.userId = user.id;
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      balance: user.balance 
    });
  });
  
  // Register user API endpoint
  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const existingUser = await storage.getUserByUsername(username);
    
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    const user = await storage.createUser({ username, password });
    
    // Set session
    if (!req.session) {
      req.session = {} as any;
    }
    req.session.userId = user.id;
    
    res.status(201).json({ 
      id: user.id, 
      username: user.username, 
      balance: user.balance 
    });
  });
  
  // Get user profile
  app.get('/api/user/profile', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      balance: user.balance 
    });
  });
  
  // Get user balance
  app.get('/api/user/balance', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ balance: user.balance });
  });
  
  // Deposit to wallet (mock)
  app.post('/api/user/deposit', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const amountSchema = z.object({
      amount: z.number().positive()
    });
    
    try {
      const { amount } = amountSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const newBalance = user.balance + amount;
      await storage.updateUserBalance(userId, newBalance);
      
      // Record transaction
      await storage.createTransaction({
        userId,
        type: 'deposit',
        amount
      });
      
      // Notify user through WebSocket
      sendToUser(userId, {
        type: 'walletUpdate',
        balance: newBalance
      });
      
      res.json({ balance: newBalance });
    } catch (error) {
      res.status(400).json({ message: 'Invalid amount' });
    }
  });
  
  // Withdraw from wallet (mock)
  app.post('/api/user/withdraw', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const amountSchema = z.object({
      amount: z.number().positive()
    });
    
    try {
      const { amount } = amountSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      const newBalance = user.balance - amount;
      await storage.updateUserBalance(userId, newBalance);
      
      // Record transaction
      await storage.createTransaction({
        userId,
        type: 'withdraw',
        amount: -amount
      });
      
      // Notify user through WebSocket
      sendToUser(userId, {
        type: 'walletUpdate',
        balance: newBalance
      });
      
      res.json({ balance: newBalance });
    } catch (error) {
      res.status(400).json({ message: 'Invalid amount' });
    }
  });
  
  // Get game history
  app.get('/api/game/history', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await storage.getRecentGameRounds(limit);
    res.json(history);
  });
  
  // Get user betting history
  app.get('/api/user/history', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await storage.getUserBets(userId, limit);
    res.json(history);
  });
  
  // Get user deposit requests history
  app.get('/api/user/deposits', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const deposits = await storage.getUserDepositRequests(userId, limit);
    res.json(deposits);
  });
  
  // Create a new deposit request
  app.post('/api/user/request-deposit', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const depositRequestSchema = z.object({
      amount: z.number().positive().refine(val => [100, 200, 300, 500].includes(val), {
        message: "Amount must be one of: 100, 200, 300, 500"
      }),
      upiId: z.string().min(1),
      upiScreenshot: z.string().optional()
    });
    
    try {
      const { amount, upiId, upiScreenshot } = depositRequestSchema.parse(req.body);
      
      // Generate unique order ID
      const orderId = `ORD${Date.now()}${userId}${Math.floor(Math.random() * 1000)}`;
      
      const depositRequest = await storage.createDepositRequest({
        userId,
        amount,
        orderId,
        upiId,
        upiScreenshot: upiScreenshot || null
      });
      
      res.status(201).json({
        id: depositRequest.id,
        orderId: depositRequest.orderId,
        amount: depositRequest.amount,
        status: depositRequest.status,
        timestamp: depositRequest.timestamp
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: 'Invalid deposit request data' });
    }
  });
  
  // ADMIN ROUTES
  
  // Helper middleware to check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // For simplicity, we're considering userId 1 as admin
    // In a real app, you would have a role field in user model
    if (userId !== 1) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    next();
  };
  
  // Get all users (admin only)
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });
  
  // Update user balance (admin only)
  app.post('/api/admin/users/:userId/balance', isAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const balanceSchema = z.object({
      amount: z.number(),
      notes: z.string().optional()
    });
    
    try {
      const { amount, notes } = balanceSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const newBalance = user.balance + amount;
      
      // Don't allow negative balance
      if (newBalance < 0) {
        return res.status(400).json({ message: 'Resulting balance would be negative' });
      }
      
      await storage.updateUserBalance(userId, newBalance);
      
      // Record transaction
      await storage.createTransaction({
        userId,
        type: amount > 0 ? 'admin_credit' : 'admin_debit',
        amount
      });
      
      // Notify user through WebSocket
      sendToUser(userId, {
        type: 'walletUpdate',
        balance: newBalance
      });
      
      res.json({ userId, balance: newBalance });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: 'Invalid request' });
    }
  });
  
  // Ban or unban a user (admin only)
  app.post('/api/admin/users/:userId/ban-status', isAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const banSchema = z.object({
      isBanned: z.boolean(),
      banReason: z.string().optional()
    });
    
    try {
      const { isBanned, banReason } = banSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't allow banning the admin account (ID 1)
      if (userId === 1) {
        return res.status(400).json({ message: 'Cannot ban the admin account' });
      }
      
      await storage.updateUserBanStatus(userId, isBanned, banReason);
      
      res.json({ 
        userId, 
        isBanned, 
        message: isBanned ? 'User has been banned' : 'User has been unbanned' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: 'Invalid request' });
    }
  });
  
  // Get all bets (admin only)
  app.get('/api/admin/bets', isAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const bets = await storage.getAllBets(limit);
    res.json(bets);
  });
  
  // Get all transactions (admin only)
  app.get('/api/admin/transactions', isAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const transactions = await storage.getAllTransactions(limit);
    res.json(transactions);
  });
  
  // Get all deposit requests (admin only)
  app.get('/api/admin/deposit-requests', isAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const requests = await storage.getAllDepositRequests(limit);
    res.json(requests);
  });
  
  // Update deposit request status (admin only)
  app.post('/api/admin/deposit-requests/:requestId/status', isAdmin, async (req, res) => {
    const requestId = parseInt(req.params.requestId);
    const adminId = req.session?.userId;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const statusSchema = z.object({
      status: z.enum(['approved', 'rejected']),
      notes: z.string().optional()
    });
    
    try {
      const { status, notes } = statusSchema.parse(req.body);
      
      const depositRequest = await storage.getDepositRequest(requestId);
      
      if (!depositRequest) {
        return res.status(404).json({ message: 'Deposit request not found' });
      }
      
      // If request is already processed, don't allow changes
      if (depositRequest.status !== 'pending') {
        return res.status(400).json({ message: `Deposit request is already ${depositRequest.status}` });
      }
      
      // Update deposit request status
      const updatedRequest = await storage.updateDepositRequestStatus(
        requestId,
        status,
        adminId as number,
        notes
      );
      
      // If approved, update user balance
      if (status === 'approved') {
        const user = await storage.getUser(depositRequest.userId);
        
        if (user) {
          const newBalance = user.balance + depositRequest.amount;
          await storage.updateUserBalance(depositRequest.userId, newBalance);
          
          // Record transaction
          await storage.createTransaction({
            userId: depositRequest.userId,
            type: 'deposit',
            amount: depositRequest.amount
          });
          
          // Notify user through WebSocket
          sendToUser(depositRequest.userId, {
            type: 'walletUpdate',
            balance: newBalance
          });
        }
      }
      
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: 'Invalid request' });
    }
  });
  
  // Get number frequency for chart
  app.get('/api/game/stats', async (req, res) => {
    const frequency = await storage.getNumberFrequency();
    res.json({ frequency });
  });
  
  // Place bet
  app.post('/api/bet', async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const betSchema = z.object({
      betType: z.enum(["color", "number", "bigSmall"]),
      betValue: z.string(),
      amount: z.number().positive()
    });
    
    try {
      const { betType, betValue, amount } = betSchema.parse(req.body);
      
      // Validate bet type and value
      if (betType === "color" && !["green", "violet", "red"].includes(betValue)) {
        return res.status(400).json({ message: 'Invalid color value' });
      }
      
      if (betType === "number") {
        const num = parseInt(betValue);
        if (isNaN(num) || num < 0 || num > 9) {
          return res.status(400).json({ message: 'Invalid number value (must be 0-9)' });
        }
      }
      
      if (betType === "bigSmall" && !["big", "small"].includes(betValue.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid big/small value' });
      }
      
      // Game must be active
      if (!gameState.roundActive) {
        return res.status(400).json({ message: 'Round not active, please wait' });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({ 
          message: 'Your account has been banned', 
          banReason: user.banReason 
        });
      }
      
      // Check balance
      if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Deduct bet amount from balance
      const newBalance = user.balance - amount;
      await storage.updateUserBalance(userId, newBalance);
      
      // Record transaction
      await storage.createTransaction({
        userId,
        type: 'bet',
        amount: -amount
      });
      
      // Create bet
      const bet = await storage.createBet({
        userId,
        roundId: 0, // Will be updated when round completes
        period: gameState.currentPeriod,
        betType,
        betValue,
        amount
      });
      
      // Notify user through WebSocket
      sendToUser(userId, {
        type: 'betResponse',
        success: true,
        message: 'Bet placed successfully',
        balance: newBalance
      });
      
      res.status(201).json({ 
        id: bet.id,
        betType,
        betValue,
        amount,
        period: gameState.currentPeriod,
        balance: newBalance
      });
      
    } catch (error) {
      res.status(400).json({ message: 'Invalid bet data' });
    }
  });
  
  // WebSocket connection
  wss.on('connection', (ws) => {
    // Add client to list
    clients.set(ws, {});
    
    // Send current game state
    ws.send(JSON.stringify({
      type: 'gameState',
      data: gameState
    }));
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle auth message
        if (data.type === 'auth' && data.userId) {
          const user = await storage.getUser(data.userId);
          if (user) {
            // Check if user is banned
            if (user.isBanned) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Your account has been banned',
                banReason: user.banReason
              }));
              // Don't disconnect, but don't set the userId either
              return;
            }
            
            clients.set(ws, { userId: user.id });
            
            // Send balance update
            ws.send(JSON.stringify({
              type: 'walletUpdate',
              balance: user.balance
            }));
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  // Send message to specific user
  function sendToUser(userId: number, message: WebSocketMessage) {
    clients.forEach((client, ws) => {
      if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
  
  // Generate a unique period ID
  function generatePeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }
  
  // Generate a random number (0-9)
  function generateRandomNumber(): number {
    return Math.floor(Math.random() * 10);
  }
  
  // Determine if a number is big or small
  function getBigSmall(number: number): string {
    return number >= 5 ? 'big' : 'small';
  }
  
  // Game timer logic
  let gameInterval = setInterval(async () => {
    // Decrement timer
    gameState.timeRemaining--;
    
    // Broadcast updated game state
    broadcast({
      type: 'gameState',
      data: gameState
    });
    
    // When timer reaches 0, end the round and generate result
    if (gameState.timeRemaining === 0) {
      // Pause betting
      gameState.roundActive = false;
      
      // Generate result
      const resultNumber = generateRandomNumber();
      const resultColor = NUMBER_COLOR_MAP[resultNumber];
      const resultBigSmall = getBigSmall(resultNumber);
      
      // Create game round in storage
      const round = await storage.createGameRound({
        period: gameState.currentPeriod,
        number: resultNumber,
        color: resultColor,
        bigSmall: resultBigSmall
      });
      
      // Process bets for this round
      processBets(round);
      
      // Broadcast result
      broadcast({
        type: 'gameResult',
        data: round
      });
      
      // Get recent rounds for history
      const recentRounds = await storage.getRecentGameRounds(20);
      
      // Start new round
      gameState = {
        currentPeriod: generatePeriod(),
        timeRemaining: 60,
        lastResults: recentRounds,
        roundActive: true
      };
      
      // Broadcast new game state
      broadcast({
        type: 'gameState',
        data: gameState
      });
    }
  }, 1000);
  
  // Process bets for a completed round
  async function processBets(round: GameRound) {
    // Get all bets for this period
    const allBets = await storage.getUserBets(0, 1000); // Get a large number to process
    const periodBets = allBets.filter(bet => bet.period === round.period);
    
    for (const bet of periodBets) {
      let isWin = false;
      let multiplier = 0;
      let payout = 0;
      
      // Check if bet won
      if (bet.betType === 'color' && bet.betValue === round.color) {
        isWin = true;
        multiplier = PAYOUT_MULTIPLIERS.color[round.color as keyof typeof PAYOUT_MULTIPLIERS.color];
      } else if (bet.betType === 'number' && parseInt(bet.betValue) === round.number) {
        isWin = true;
        multiplier = PAYOUT_MULTIPLIERS.number;
      } else if (bet.betType === 'bigSmall' && bet.betValue.toLowerCase() === round.bigSmall) {
        isWin = true;
        multiplier = PAYOUT_MULTIPLIERS.bigSmall;
      }
      
      // Calculate payout
      if (isWin) {
        payout = bet.amount * multiplier;
        
        // Update user balance
        const user = await storage.getUser(bet.userId);
        if (user) {
          const newBalance = user.balance + payout;
          await storage.updateUserBalance(bet.userId, newBalance);
          
          // Record win transaction
          await storage.createTransaction({
            userId: bet.userId,
            type: 'win',
            amount: payout
          });
          
          // Notify user through WebSocket
          sendToUser(bet.userId, {
            type: 'walletUpdate',
            balance: newBalance
          });
        }
      }
      
      // Update bet with result
      await storage.updateBetResult(bet.id, isWin, isWin ? payout : 0);
    }
  }
  
  // Clean up on server shutdown
  process.on('SIGTERM', () => {
    clearInterval(gameInterval);
  });
  
  process.on('SIGINT', () => {
    clearInterval(gameInterval);
  });

  return httpServer;
}
