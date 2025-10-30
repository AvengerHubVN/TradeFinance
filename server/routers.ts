import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as binance from "./binance";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User preferences
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getUserPreferences(ctx.user.id);
      return prefs || {
        userId: ctx.user.id,
        riskTolerance: 'moderate' as const,
        defaultCapital: '10000',
        preferredAssets: ['crypto'],
        notificationsEnabled: true,
      };
    }),

    update: protectedProcedure
      .input(z.object({
        riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
        defaultCapital: z.string().optional(),
        preferredAssets: z.array(z.string()).optional(),
        notificationsEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserPreferences({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Watchlist
  watchlist: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserWatchlist(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        symbolId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addToWatchlist(ctx.user.id, input.symbolId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({
        symbolId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromWatchlist(ctx.user.id, input.symbolId);
        return { success: true };
      }),
  }),

  // Symbols
  symbols: router({
    list: publicProcedure.query(async () => {
      return db.getAllSymbols();
    }),

    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getSymbolById(input.id);
      }),

    getBySymbol: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        return db.getSymbolBySymbol(input.symbol);
      }),
  }),

  // Market data
  market: router({
    // Get current price for a symbol
    getCurrentPrice: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const price = await binance.getCurrentPrice(input.symbol);
          return { symbol: input.symbol, price };
        } catch (error) {
          console.error('Error fetching price:', error);
          return { symbol: input.symbol, price: '0' };
        }
      }),

    // Get 24h ticker data
    get24hTicker: publicProcedure
      .input(z.object({
        symbol: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const ticker = await binance.get24hTicker(input.symbol);
          return ticker;
        } catch (error) {
          console.error('Error fetching ticker:', error);
          return null;
        }
      }),

    // Get prices for multiple symbols
    getMultiplePrices: publicProcedure
      .input(z.object({
        symbols: z.array(z.string()),
      }))
      .query(async ({ input }) => {
        const prices: Record<string, string> = {};
        
        for (const symbol of input.symbols) {
          try {
            const price = await binance.getCurrentPrice(symbol);
            prices[symbol] = price;
          } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            prices[symbol] = '0';
          }
        }
        
        return prices;
      }),

    // Get historical klines
    getKlines: publicProcedure
      .input(z.object({
        symbol: z.string(),
        interval: z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w']),
        limit: z.number().optional().default(100),
      }))
      .query(async ({ input }) => {
        try {
          const klines = await binance.getKlines({
            symbol: input.symbol,
            interval: input.interval,
            limit: input.limit,
          });
          return klines;
        } catch (error) {
          console.error('Error fetching klines:', error);
          return [];
        }
      }),
  }),

  // Predictions
  predictions: router({
    getLatest: publicProcedure
      .input(z.object({
        symbolId: z.number(),
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        return db.getLatestPredictions(input.symbolId, input.limit);
      }),
  }),

  // Historical prices
  prices: router({
    getHistory: publicProcedure
      .input(z.object({
        symbolId: z.number(),
        interval: z.string(),
        limit: z.number().optional().default(100),
      }))
      .query(async ({ input }) => {
        return db.getHistoricalPrices(input.symbolId, input.interval, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
