import { 
  users, type User, type InsertUser,
  gameRounds, type GameRound, type InsertGameRound,
  bets, type Bet, type InsertBet,
  transactions, type Transaction, type InsertTransaction,
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
  
  // Game round operations
  createGameRound(round: InsertGameRound): Promise<GameRound>;
  getGameRound(id: number): Promise<GameRound | undefined>;
  getGameRoundByPeriod(period: string): Promise<GameRound | undefined>;
  getRecentGameRounds(limit: number): Promise<GameRound[]>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: number, limit: number): Promise<Bet[]>;
  updateBetResult(betId: number, isWin: boolean, payout: number): Promise<Bet>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number, limit: number): Promise<Transaction[]>;
  
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
