import { pgTable, text, serial, decimal, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  date: text("date").notNull(),
  pair: text("pair").notNull(),
  direction: text("direction").notNull(),
  session: text("session").notNull(),
  setup: text("setup").notNull(),
  rr: decimal("rr", { precision: 10, scale: 2 }).notNull(),
  outcome: text("outcome").notNull(),
  notes: text("notes").default(""),
  screenshot: text("screenshot").default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalsTable = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  date: text("date").notNull(),
  type: text("type").notNull().default("daily"),
  mood: text("mood").notNull(),
  followedPlan: boolean("followed_plan").notNull().default(true),
  bestTrade: text("best_trade").default(""),
  mistakes: text("mistakes").default(""),
  lessons: text("lessons").default(""),
  mentalScore: integer("mental_score").notNull().default(7),
  disciplineScore: integer("discipline_score").notNull().default(7),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const noTradeDaysTable = pgTable("no_trade_days", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  date: text("date").notNull(),
  note: text("note").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, userId: true, createdAt: true });
export const insertJournalSchema = createInsertSchema(journalsTable).omit({ id: true, userId: true, createdAt: true });
export const insertNoTradeDaySchema = createInsertSchema(noTradeDaysTable).omit({ id: true, userId: true, createdAt: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Trade = typeof tradesTable.$inferSelect;
export type Journal = typeof journalsTable.$inferSelect;
export type NoTradeDay = typeof noTradeDaysTable.$inferSelect;
