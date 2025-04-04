import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(100), // Default starting balance (₹100)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Game rounds
export const gameRounds = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  period: text("period").notNull().unique(), // Unique identifier for the round (e.g., 2025040401128)
  number: integer("number").notNull(), // Winning number (0-9)
  color: text("color").notNull(), // Green, Violet, Red
  bigSmall: text("big_small").notNull(), // Big (5-9) or Small (0-4)
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertGameRoundSchema = createInsertSchema(gameRounds).pick({
  period: true,
  number: true,
  color: true,
  bigSmall: true,
});

// User bets
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User who placed the bet
  roundId: integer("round_id").notNull(), // Game round the bet was placed on
  period: text("period").notNull(), // Period of the game round
  betType: text("bet_type").notNull(), // "color", "number", or "bigSmall"
  betValue: text("bet_value").notNull(), // Value of the bet (color name, number, "Big"/"Small")
  amount: integer("amount").notNull(), // Amount bet
  payout: integer("payout"), // Payout if won
  isWin: boolean("is_win"), // Whether the bet won
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  roundId: true,
  period: true,
  betType: true,
  betValue: true,
  amount: true,
});

// Wallet transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "deposit", "withdraw", "bet", "win"
  amount: integer("amount").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
});

// Define color mapping
export const NUMBER_COLOR_MAP: Record<number, string> = {
  0: "violet",
  1: "green",
  2: "red",
  3: "green",
  4: "red",
  5: "violet",
  6: "red",
  7: "green",
  8: "red",
  9: "green"
};

// Define payout multipliers
export const PAYOUT_MULTIPLIERS = {
  color: {
    green: 2,
    violet: 4.5,
    red: 2
  },
  number: 9,
  bigSmall: 2
};

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GameRound = typeof gameRounds.$inferSelect;
export type InsertGameRound = z.infer<typeof insertGameRoundSchema>;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Game state type
export type GameState = {
  currentPeriod: string;
  timeRemaining: number;
  lastResults: GameRound[];
  roundActive: boolean;
};

// Socket message types
export type GameStateMessage = {
  type: 'gameState';
  data: GameState;
};

export type GameResultMessage = {
  type: 'gameResult';
  data: GameRound;
};

export type BetResponseMessage = {
  type: 'betResponse';
  success: boolean;
  message: string;
  balance?: number;
};

export type WalletUpdateMessage = {
  type: 'walletUpdate';
  balance: number;
};

export type WebSocketMessage = 
  | GameStateMessage
  | GameResultMessage
  | BetResponseMessage
  | WalletUpdateMessage;
