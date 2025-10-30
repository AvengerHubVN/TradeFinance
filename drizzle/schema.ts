import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, bigint, json, index, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Symbols table - stores all tradeable assets (crypto, stocks, forex)
 */
export const symbols = mysqlTable("symbols", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(), // e.g., "BTCUSDT", "AAPL"
  name: text("name"), // e.g., "Bitcoin", "Apple Inc."
  type: mysqlEnum("type", ["crypto", "stock", "forex"]).notNull(),
  exchange: varchar("exchange", { length: 50 }), // e.g., "binance", "nasdaq"
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  symbolIdx: index("symbol_idx").on(table.symbol),
  typeIdx: index("type_idx").on(table.type),
}));

export type Symbol = typeof symbols.$inferSelect;
export type InsertSymbol = typeof symbols.$inferInsert;

/**
 * Historical prices - OHLCV data
 */
export const historicalPrices = mysqlTable("historicalPrices", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  symbolId: int("symbolId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  interval: varchar("interval", { length: 10 }).notNull(), // "1m", "5m", "1h", "1d"
  open: varchar("open", { length: 30 }).notNull(), // Store as string to avoid precision loss
  high: varchar("high", { length: 30 }).notNull(),
  low: varchar("low", { length: 30 }).notNull(),
  close: varchar("close", { length: 30 }).notNull(),
  volume: varchar("volume", { length: 30 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolTimestampIdx: index("symbol_timestamp_idx").on(table.symbolId, table.timestamp),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export type HistoricalPrice = typeof historicalPrices.$inferSelect;
export type InsertHistoricalPrice = typeof historicalPrices.$inferInsert;

/**
 * Technical indicators
 */
export const technicalIndicators = mysqlTable("technicalIndicators", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  symbolId: int("symbolId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  rsi: varchar("rsi", { length: 20 }), // RSI value
  macd: varchar("macd", { length: 20 }), // MACD value
  macdSignal: varchar("macdSignal", { length: 20 }),
  macdHistogram: varchar("macdHistogram", { length: 20 }),
  sma50: varchar("sma50", { length: 30 }), // 50-period SMA
  sma200: varchar("sma200", { length: 30 }), // 200-period SMA
  ema12: varchar("ema12", { length: 30 }),
  ema26: varchar("ema26", { length: 30 }),
  bollingerUpper: varchar("bollingerUpper", { length: 30 }),
  bollingerMiddle: varchar("bollingerMiddle", { length: 30 }),
  bollingerLower: varchar("bollingerLower", { length: 30 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolTimestampIdx: index("tech_symbol_timestamp_idx").on(table.symbolId, table.timestamp),
}));

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = typeof technicalIndicators.$inferInsert;

/**
 * ML Predictions
 */
export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  symbolId: int("symbolId").notNull(),
  predictionDate: timestamp("predictionDate").notNull(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // "short" (1-7d), "medium" (1-4w), "long" (1-6m)
  predictedDirection: mysqlEnum("predictedDirection", ["up", "down", "neutral"]).notNull(),
  predictedPrice: varchar("predictedPrice", { length: 30 }),
  confidenceScore: int("confidenceScore").notNull(), // 0-100
  expectedReturn: varchar("expectedReturn", { length: 20 }), // Expected return percentage
  modelUsed: varchar("modelUsed", { length: 50 }), // "lstm", "ensemble", etc.
  actualPrice: varchar("actualPrice", { length: 30 }), // Filled later for accuracy tracking
  wasCorrect: boolean("wasCorrect"), // Filled later
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolDateIdx: index("pred_symbol_date_idx").on(table.symbolId, table.predictionDate),
  confidenceIdx: index("confidence_idx").on(table.confidenceScore),
}));

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

/**
 * User watchlists
 */
export const userWatchlists = mysqlTable("userWatchlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbolId: int("symbolId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userSymbolUnique: unique("user_symbol_unique").on(table.userId, table.symbolId),
  userIdx: index("watchlist_user_idx").on(table.userId),
}));

export type UserWatchlist = typeof userWatchlists.$inferSelect;
export type InsertUserWatchlist = typeof userWatchlists.$inferInsert;

/**
 * User preferences & risk profile
 */
export const userPreferences = mysqlTable("userPreferences", {
  userId: int("userId").primaryKey(),
  riskTolerance: mysqlEnum("riskTolerance", ["conservative", "moderate", "aggressive"]).default("moderate"),
  defaultCapital: varchar("defaultCapital", { length: 30 }), // Default trading capital
  preferredAssets: json("preferredAssets").$type<string[]>(), // ["crypto", "stocks"]
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Binance API connections
 */
export const exchangeConnections = mysqlTable("exchangeConnections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exchange: varchar("exchange", { length: 50 }).default("binance").notNull(),
  apiKeyEncrypted: text("apiKeyEncrypted").notNull(),
  apiSecretEncrypted: text("apiSecretEncrypted").notNull(),
  permissions: json("permissions").$type<{ read: boolean; trade: boolean; withdraw: boolean }>(),
  isActive: boolean("isActive").default(true),
  isVerified: boolean("isVerified").default(false),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userExchangeUnique: unique("user_exchange_unique").on(table.userId, table.exchange),
  userIdx: index("exchange_user_idx").on(table.userId),
}));

export type ExchangeConnection = typeof exchangeConnections.$inferSelect;
export type InsertExchangeConnection = typeof exchangeConnections.$inferInsert;

/**
 * Auto trading settings
 */
export const autoTradingSettings = mysqlTable("autoTradingSettings", {
  userId: int("userId").primaryKey(),
  enabled: boolean("enabled").default(false),
  maxPositionSizePct: int("maxPositionSizePct").default(10), // 10% of balance per trade
  maxOpenPositions: int("maxOpenPositions").default(3),
  dailyLossLimitPct: int("dailyLossLimitPct").default(5), // 5% daily loss limit
  minConfidence: int("minConfidence").default(75), // Only trade signals with >75% confidence
  allowedSymbols: json("allowedSymbols").$type<string[]>(), // NULL = all symbols
  useLimitOrders: boolean("useLimitOrders").default(true),
  slippageTolerancePct: int("slippageTolerancePct").default(1), // 0.5% -> store as 1 (0.5 * 2)
  useStopLoss: boolean("useStopLoss").default(true),
  stopLossPct: int("stopLossPct").default(2), // 2% stop loss
  useTakeProfit: boolean("useTakeProfit").default(true),
  takeProfitPct: int("takeProfitPct").default(5), // 5% take profit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoTradingSetting = typeof autoTradingSettings.$inferSelect;
export type InsertAutoTradingSetting = typeof autoTradingSettings.$inferInsert;

/**
 * Auto trades executed by the bot
 */
export const autoTrades = mysqlTable("autoTrades", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbolId: int("symbolId").notNull(),
  side: mysqlEnum("side", ["BUY", "SELL"]).notNull(),
  type: mysqlEnum("type", ["MARKET", "LIMIT"]).notNull(),
  quantity: varchar("quantity", { length: 30 }).notNull(),
  price: varchar("price", { length: 30 }), // NULL for market orders
  binanceOrderId: bigint("binanceOrderId", { mode: "number" }),
  binanceClientOrderId: varchar("binanceClientOrderId", { length: 100 }),
  status: mysqlEnum("status", ["PENDING", "FILLED", "PARTIALLY_FILLED", "CANCELLED", "FAILED"]).notNull(),
  executedQty: varchar("executedQty", { length: 30 }),
  executedPrice: varchar("executedPrice", { length: 30 }),
  commission: varchar("commission", { length: 30 }),
  commissionAsset: varchar("commissionAsset", { length: 10 }),
  signalId: int("signalId"), // Reference to prediction
  parentTradeId: bigint("parentTradeId", { mode: "number" }), // For closing trades
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  executedAt: timestamp("executedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("trade_user_created_idx").on(table.userId, table.createdAt),
  statusIdx: index("trade_status_idx").on(table.status),
  binanceOrderIdx: index("trade_binance_order_idx").on(table.binanceOrderId),
}));

export type AutoTrade = typeof autoTrades.$inferSelect;
export type InsertAutoTrade = typeof autoTrades.$inferInsert;

/**
 * Auto trading logs
 */
export const autoTradingLogs = mysqlTable("autoTradingLogs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  level: mysqlEnum("level", ["INFO", "WARNING", "ERROR"]).notNull(),
  message: text("message").notNull(),
  tradeId: bigint("tradeId", { mode: "number" }),
  signalId: int("signalId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("log_user_created_idx").on(table.userId, table.createdAt),
  levelCreatedIdx: index("log_level_created_idx").on(table.level, table.createdAt),
}));

export type AutoTradingLog = typeof autoTradingLogs.$inferSelect;
export type InsertAutoTradingLog = typeof autoTradingLogs.$inferInsert;

/**
 * Trading strategies (goal-based)
 */
export const tradingStrategies = mysqlTable("tradingStrategies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  targetRoiPct: int("targetRoiPct").notNull(), // Target ROI percentage
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // "month", "week"
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).notNull(),
  allocation: json("allocation").$type<Record<string, any>>(), // Symbol allocations
  isActive: boolean("isActive").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("strategy_user_idx").on(table.userId),
}));

export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertTradingStrategy = typeof tradingStrategies.$inferInsert;
