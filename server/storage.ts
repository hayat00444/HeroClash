import { 
  users, type User, type InsertUser,
  gameRounds, type GameRound, type InsertGameRound,
  bets, type Bet, type InsertBet,
  transactions, type Transaction, type InsertTransaction,
  NUMBER_COLOR_MAP
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameRounds: Map<number, GameRound>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  
  private currentUserId: number;
  private currentGameRoundId: number;
  private currentBetId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.gameRounds = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    
    this.currentUserId = 1;
    this.currentGameRoundId = 1;
    this.currentBetId = 1;
    this.currentTransactionId = 1;
    
    // Add demo user
    this.users.set(1, {
      id: 1,
      username: "demo",
      password: "demo123",
      balance: 100
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, balance: 100 };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(userId: number, newBalance: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Game round operations
  async createGameRound(insertRound: InsertGameRound): Promise<GameRound> {
    const id = this.currentGameRoundId++;
    const round: GameRound = { 
      ...insertRound, 
      id, 
      timestamp: new Date() 
    };
    this.gameRounds.set(id, round);
    return round;
  }

  async getGameRound(id: number): Promise<GameRound | undefined> {
    return this.gameRounds.get(id);
  }
  
  async getGameRoundByPeriod(period: string): Promise<GameRound | undefined> {
    return Array.from(this.gameRounds.values()).find(
      (round) => round.period === period
    );
  }

  async getRecentGameRounds(limit: number): Promise<GameRound[]> {
    return Array.from(this.gameRounds.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Bet operations
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const bet: Bet = { 
      ...insertBet, 
      id, 
      payout: null,
      isWin: null,
      timestamp: new Date() 
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getUserBets(userId: number, limit: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter((bet) => bet.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async updateBetResult(betId: number, isWin: boolean, payout: number): Promise<Bet> {
    const bet = this.bets.get(betId);
    if (!bet) {
      throw new Error(`Bet with ID ${betId} not found`);
    }
    
    const updatedBet = { ...bet, isWin, payout };
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      timestamp: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number, limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Game statistics
  async getNumberFrequency(): Promise<Record<number, number>> {
    const frequency: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };
    
    Array.from(this.gameRounds.values()).forEach(round => {
      frequency[round.number]++;
    });
    
    return frequency;
  }
}

export const storage = new MemStorage();
