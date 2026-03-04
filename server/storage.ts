import { db } from "./db";
import {
  profiles, devices, games, snsLinks,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type Device, type InsertDevice, type UpdateDeviceRequest,
  type Game, type InsertGame, type UpdateGameRequest,
  type SnsLink, type InsertSnsLink, type UpdateSnsLinkRequest
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  updateProfile(updates: UpdateProfileRequest): Promise<Profile>;

  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, updates: UpdateDeviceRequest): Promise<Device>;
  deleteDevice(id: number): Promise<void>;

  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: UpdateGameRequest): Promise<Game>;
  deleteGame(id: number): Promise<void>;

  getSnsLinks(): Promise<SnsLink[]>;
  getSnsLink(id: number): Promise<SnsLink | undefined>;
  createSnsLink(link: InsertSnsLink): Promise<SnsLink>;
  updateSnsLink(id: number, updates: UpdateSnsLinkRequest): Promise<SnsLink>;
  deleteSnsLink(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).limit(1);
    return profile;
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<Profile> {
    const existing = await this.getProfile();
    if (existing) {
      const [updated] = await db.update(profiles)
        .set(updates)
        .where(eq(profiles.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(profiles)
        .values({ name: updates.name || "名無し", bio: updates.bio || "よろしくお願いします。" })
        .returning();
      return created;
    }
  }

  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const [created] = await db.insert(devices).values(device).returning();
    return created;
  }

  async updateDevice(id: number, updates: UpdateDeviceRequest): Promise<Device> {
    const [updated] = await db.update(devices)
      .set(updates)
      .where(eq(devices.id, id))
      .returning();
    return updated;
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [created] = await db.insert(games).values(game).returning();
    return created;
  }

  async updateGame(id: number, updates: UpdateGameRequest): Promise<Game> {
    const [updated] = await db.update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return updated;
  }

  async deleteGame(id: number): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  async getSnsLinks(): Promise<SnsLink[]> {
    return await db.select().from(snsLinks).orderBy(asc(snsLinks.displayOrder));
  }

  async getSnsLink(id: number): Promise<SnsLink | undefined> {
    const [link] = await db.select().from(snsLinks).where(eq(snsLinks.id, id));
    return link;
  }

  async createSnsLink(link: InsertSnsLink): Promise<SnsLink> {
    const [created] = await db.insert(snsLinks).values(link).returning();
    return created;
  }

  async updateSnsLink(id: number, updates: UpdateSnsLinkRequest): Promise<SnsLink> {
    const [updated] = await db.update(snsLinks)
      .set(updates)
      .where(eq(snsLinks.id, id))
      .returning();
    return updated;
  }

  async deleteSnsLink(id: number): Promise<void> {
    await db.delete(snsLinks).where(eq(snsLinks.id, id));
  }
}

export const storage = new DatabaseStorage();
