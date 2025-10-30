import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
