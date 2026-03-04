import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Profile ---
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfileRequest = Partial<InsertProfile>;

// --- Devices ---
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  specs: text("specs").notNull(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true });
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type UpdateDeviceRequest = Partial<InsertDevice>;

// --- Games ---
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  description: text("description").notNull(),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type UpdateGameRequest = Partial<InsertGame>;

// --- SNS Links ---
export const snsLinks = pgTable("sns_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertSnsLinkSchema = createInsertSchema(snsLinks).omit({ id: true });
export type SnsLink = typeof snsLinks.$inferSelect;
export type InsertSnsLink = z.infer<typeof insertSnsLinkSchema>;
export type UpdateSnsLinkRequest = Partial<InsertSnsLink>;
