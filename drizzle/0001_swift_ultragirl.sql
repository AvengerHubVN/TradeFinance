CREATE TABLE `autoTrades` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbolId` int NOT NULL,
	`side` enum('BUY','SELL') NOT NULL,
	`type` enum('MARKET','LIMIT') NOT NULL,
	`quantity` varchar(30) NOT NULL,
	`price` varchar(30),
	`binanceOrderId` bigint,
	`binanceClientOrderId` varchar(100),
	`status` enum('PENDING','FILLED','PARTIALLY_FILLED','CANCELLED','FAILED') NOT NULL,
	`executedQty` varchar(30),
	`executedPrice` varchar(30),
	`commission` varchar(30),
	`commissionAsset` varchar(10),
	`signalId` int,
	`parentTradeId` bigint,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`executedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autoTrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autoTradingLogs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`level` enum('INFO','WARNING','ERROR') NOT NULL,
	`message` text NOT NULL,
	`tradeId` bigint,
	`signalId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autoTradingLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autoTradingSettings` (
	`userId` int NOT NULL,
	`enabled` boolean DEFAULT false,
	`maxPositionSizePct` int DEFAULT 10,
	`maxOpenPositions` int DEFAULT 3,
	`dailyLossLimitPct` int DEFAULT 5,
	`minConfidence` int DEFAULT 75,
	`allowedSymbols` json,
	`useLimitOrders` boolean DEFAULT true,
	`slippageTolerancePct` int DEFAULT 1,
	`useStopLoss` boolean DEFAULT true,
	`stopLossPct` int DEFAULT 2,
	`useTakeProfit` boolean DEFAULT true,
	`takeProfitPct` int DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autoTradingSettings_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `exchangeConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exchange` varchar(50) NOT NULL DEFAULT 'binance',
	`apiKeyEncrypted` text NOT NULL,
	`apiSecretEncrypted` text NOT NULL,
	`permissions` json,
	`isActive` boolean DEFAULT true,
	`isVerified` boolean DEFAULT false,
	`lastVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exchangeConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_exchange_unique` UNIQUE(`userId`,`exchange`)
);
--> statement-breakpoint
CREATE TABLE `historicalPrices` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`symbolId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`interval` varchar(10) NOT NULL,
	`open` varchar(30) NOT NULL,
	`high` varchar(30) NOT NULL,
	`low` varchar(30) NOT NULL,
	`close` varchar(30) NOT NULL,
	`volume` varchar(30) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicalPrices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbolId` int NOT NULL,
	`predictionDate` timestamp NOT NULL,
	`timeframe` varchar(20) NOT NULL,
	`predictedDirection` enum('up','down','neutral') NOT NULL,
	`predictedPrice` varchar(30),
	`confidenceScore` int NOT NULL,
	`expectedReturn` varchar(20),
	`modelUsed` varchar(50),
	`actualPrice` varchar(30),
	`wasCorrect` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symbols` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`name` text,
	`type` enum('crypto','stock','forex') NOT NULL,
	`exchange` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `symbols_id` PRIMARY KEY(`id`),
	CONSTRAINT `symbols_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `technicalIndicators` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`symbolId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`rsi` varchar(20),
	`macd` varchar(20),
	`macdSignal` varchar(20),
	`macdHistogram` varchar(20),
	`sma50` varchar(30),
	`sma200` varchar(30),
	`ema12` varchar(30),
	`ema26` varchar(30),
	`bollingerUpper` varchar(30),
	`bollingerMiddle` varchar(30),
	`bollingerLower` varchar(30),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `technicalIndicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tradingStrategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`targetRoiPct` int NOT NULL,
	`timeframe` varchar(20) NOT NULL,
	`riskLevel` enum('low','medium','high') NOT NULL,
	`allocation` json,
	`isActive` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradingStrategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`userId` int NOT NULL,
	`riskTolerance` enum('conservative','moderate','aggressive') DEFAULT 'moderate',
	`defaultCapital` varchar(30),
	`preferredAssets` json,
	`notificationsEnabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userWatchlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbolId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userWatchlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_symbol_unique` UNIQUE(`userId`,`symbolId`)
);
--> statement-breakpoint
CREATE INDEX `trade_user_created_idx` ON `autoTrades` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `trade_status_idx` ON `autoTrades` (`status`);--> statement-breakpoint
CREATE INDEX `trade_binance_order_idx` ON `autoTrades` (`binanceOrderId`);--> statement-breakpoint
CREATE INDEX `log_user_created_idx` ON `autoTradingLogs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `log_level_created_idx` ON `autoTradingLogs` (`level`,`createdAt`);--> statement-breakpoint
CREATE INDEX `exchange_user_idx` ON `exchangeConnections` (`userId`);--> statement-breakpoint
CREATE INDEX `symbol_timestamp_idx` ON `historicalPrices` (`symbolId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `historicalPrices` (`timestamp`);--> statement-breakpoint
CREATE INDEX `pred_symbol_date_idx` ON `predictions` (`symbolId`,`predictionDate`);--> statement-breakpoint
CREATE INDEX `confidence_idx` ON `predictions` (`confidenceScore`);--> statement-breakpoint
CREATE INDEX `symbol_idx` ON `symbols` (`symbol`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `symbols` (`type`);--> statement-breakpoint
CREATE INDEX `tech_symbol_timestamp_idx` ON `technicalIndicators` (`symbolId`,`timestamp`);--> statement-breakpoint
CREATE INDEX `strategy_user_idx` ON `tradingStrategies` (`userId`);--> statement-breakpoint
CREATE INDEX `watchlist_user_idx` ON `userWatchlists` (`userId`);