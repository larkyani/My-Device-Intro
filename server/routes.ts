import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const profile = await storage.getProfile();
  if (!profile) {
    await storage.updateProfile({
      name: "ゲーマー太郎",
      bio: "FPSとRPGが大好きなゲーマーです。最近はPCの自作にもハマっています。よろしくお願いします！",
    });
  }

  const existingDevices = await storage.getDevices();
  if (existingDevices.length === 0) {
    await storage.createDevice({ name: "Custom PC (白統一)", category: "Desktop", specs: "Core i7 13700K / RTX 4080 / 32GB RAM" });
    await storage.createDevice({ name: "Logicool G PRO X SUPERLIGHT", category: "Mouse", specs: "ワイヤレス / 63g 軽量" });
    await storage.createDevice({ name: "Wooting 60HE", category: "Keyboard", specs: "ラピッドトリガー搭載 / 60%サイズ" });
    await storage.createDevice({ name: "BenQ ZOWIE XL2546K", category: "Monitor", specs: "24.5インチ / 240Hz / TNパネル" });
  }

  const existingGames = await storage.getGames();
  if (existingGames.length === 0) {
    await storage.createGame({ title: "Apex Legends", platform: "PC", description: "メインでプレイしているバトロワ。マスター目指して練習中！" });
    await storage.createGame({ title: "Cyberpunk 2077", platform: "PC/PS5", description: "世界観とストーリーが最高。ナイトシティの探索が止まらない。" });
    await storage.createGame({ title: "ELDEN RING", platform: "PC", description: "ビルドを考えるのが楽しいアクションRPG。DLCもクリア済み。" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed DB on startup
  seedDatabase().catch(console.error);

  // Profile
  app.get(api.profile.get.path, async (req, res) => {
    let profile = await storage.getProfile();
    if (!profile) {
      profile = await storage.updateProfile({
        name: "名無し",
        bio: "よろしくお願いします。",
      });
    }
    res.json(profile);
  });

  app.put(api.profile.update.path, async (req, res) => {
    try {
      const input = api.profile.update.input.parse(req.body);
      const profile = await storage.updateProfile(input);
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Devices
  app.get(api.devices.list.path, async (req, res) => {
    const devices = await storage.getDevices();
    res.json(devices);
  });

  app.post(api.devices.create.path, async (req, res) => {
    try {
      const input = api.devices.create.input.parse(req.body);
      const device = await storage.createDevice(input);
      res.status(201).json(device);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.devices.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.devices.update.input.parse(req.body);
      const existing = await storage.getDevice(id);
      if (!existing) {
        return res.status(404).json({ message: "Device not found" });
      }
      const device = await storage.updateDevice(id, input);
      res.json(device);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.devices.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getDevice(id);
    if (!existing) {
      return res.status(404).json({ message: "Device not found" });
    }
    await storage.deleteDevice(id);
    res.status(204).send();
  });

  // Games
  app.get(api.games.list.path, async (req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  app.post(api.games.create.path, async (req, res) => {
    try {
      const input = api.games.create.input.parse(req.body);
      const game = await storage.createGame(input);
      res.status(201).json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.games.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.games.update.input.parse(req.body);
      const existing = await storage.getGame(id);
      if (!existing) {
        return res.status(404).json({ message: "Game not found" });
      }
      const game = await storage.updateGame(id, input);
      res.json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.games.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getGame(id);
    if (!existing) {
      return res.status(404).json({ message: "Game not found" });
    }
    await storage.deleteGame(id);
    res.status(204).send();
  });

  return httpServer;
}
