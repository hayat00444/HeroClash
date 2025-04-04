import { 
  users, type User, type InsertUser,
  gameRounds, type GameRound, type InsertGameRound,
  bets, type Bet, type InsertBet,
  transactions, type Transaction, type InsertTransaction,
  depositRequests, type DepositRequest, type InsertDepositRequest,
  NUMBER_COLOR_MAP
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Game round operations
  createGameRound(round: InsertGameRound): Promise<GameRound>;
  getGameRound(id: number): Promise<GameRound | undefined>;
  getGameRoundByPeriod(period: string): Promise<GameRound | undefined>;
  getRecentGameRounds(limit: number): Promise<GameRound[]>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: number, limit: number): Promise<Bet[]>;
  updateBetResult(betId: number, isWin: boolean, payout: number): Promise<Bet>;
  getAllBets(limit: number): Promise<Bet[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number, limit: number): Promise<Transaction[]>;
  getAllTransactions(limit: number): Promise<Transaction[]>;
  
  // Deposit request operations
  createDepositRequest(request: InsertDepositRequest): Promise<DepositRequest>;
  getDepositRequest(id: number): Promise<DepositRequest | undefined>;
  getDepositRequestByOrderId(orderId: string): Promise<DepositRequest | undefined>;
  getUserDepositRequests(userId: number, limit: number): Promise<DepositRequest[]>;
  getAllDepositRequests(limit: number): Promise<DepositRequest[]>;
  updateDepositRequestStatus(
    requestId: number, 
    status: string, 
    adminId: number, 
    notes?: string
  ): Promise<DepositRequest>;
  
  // Game statistics
  getNumberFrequency(): Promise<Record<number, number>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      balance: 100 // Default starting balance
    }).returning();
    return user;
  }
  
  async updateUserBalance(userId: number, newBalance: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  async updateUserBanStatus(userId: number, isBanned: boolean, banReason?: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isBanned: isBanned,
        banReason: banReason || null
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.id));
  }

  // Game round operations
  async createGameRound(insertRound: InsertGameRound): Promise<GameRound> {
    const [round] = await db
      .insert(gameRounds)
      .values(insertRound)
      .returning();
    
    return round;
  }

  async getGameRound(id: number): Promise<GameRound | undefined> {
    const [round] = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.id, id));
    
    return round;
  }
  
  async getGameRoundByPeriod(period: string): Promise<GameRound | undefined> {
    const [round] = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.period, period));
    
    return round;
  }

  async getRecentGameRounds(limit: number): Promise<GameRound[]> {
    return await db
      .select()
      .from(gameRounds)
      .orderBy(desc(gameRounds.timestamp))
      .limit(limit);
  }

  // Bet operations
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const [bet] = await db
      .insert(bets)
      .values(insertBet)
      .returning();
    
    return bet;
  }

  async getUserBets(userId: number, limit: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.timestamp))
      .limit(limit);
  }
  
  async updateBetResult(betId: number, isWin: boolean, payout: number): Promise<Bet> {
    const [updatedBet] = await db
      .update(bets)
      .set({
        isWin: isWin,
        payout: payout
      })
      .where(eq(bets.id, betId))
      .returning();
    
    if (!updatedBet) {
      throw new Error(`Bet with ID ${betId} not found`);
    }
    
    return updatedBet;
  }
  
  async getAllBets(limit: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .orderBy(desc(bets.timestamp))
      .limit(limit);
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    
    return transaction;
  }

  async getUserTransactions(userId: number, limit: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
  }
  
  async getAllTransactions(limit: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
  }
  
  // Deposit request operations
  async createDepositRequest(request: InsertDepositRequest): Promise<DepositRequest> {
    const [depositRequest] = await db
      .insert(depositRequests)
      .values(request)
      .returning();
    
    return depositRequest;
  }
  
  async getDepositRequest(id: number): Promise<DepositRequest | undefined> {
    const [request] = await db
      .select()
      .from(depositRequests)
      .where(eq(depositRequests.id, id));
    
    return request;
  }
  
  async getDepositRequestByOrderId(orderId: string): Promise<DepositRequest | undefined> {
    const [request] = await db
      .select()
      .from(depositRequests)
      .where(eq(depositRequests.orderId, orderId));
    
    return request;
  }
  
  async getUserDepositRequests(userId: number, limit: number): Promise<DepositRequest[]> {
    return await db
      .select()
      .from(depositRequests)
      .where(eq(depositRequests.userId, userId))
      .orderBy(desc(depositRequests.timestamp))
      .limit(limit);
  }
  
  async getAllDepositRequests(limit: number): Promise<DepositRequest[]> {
    return await db
      .select()
      .from(depositRequests)
      .orderBy(desc(depositRequests.timestamp))
      .limit(limit);
  }
  
  async updateDepositRequestStatus(
    requestId: number, 
    status: string, 
    adminId: number, 
    notes?: string
  ): Promise<DepositRequest> {
    const [updatedRequest] = await db
      .update(depositRequests)
      .set({
        status: status,
        processedAt: new Date(),
        processedBy: adminId,
        notes: notes
      })
      .where(eq(depositRequests.id, requestId))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Deposit request with ID ${requestId} not found`);
    }
    
    return updatedRequest;
  }
  
  // Game statistics
  async getNumberFrequency(): Promise<Record<number, number>> {
    // Initialize frequency object
    const frequency: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };
    
    // Get frequency counts from database
    const results = await db
      .select({
        number: gameRounds.number,
        count: sql<number>`count(${gameRounds.id})::int`
      })
      .from(gameRounds)
      .groupBy(gameRounds.number);
    
    // Populate frequency object with results
    results.forEach(row => {
      frequency[row.number] = row.count;
    });
    
    return frequency;
  }
}

// Export an instance of DatabaseStorage
export const storage = new DatabaseStorage();
