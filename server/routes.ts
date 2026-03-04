import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

declare module "express-session" {
  interface SessionData { isAdmin: boolean; }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.isAdmin) return res.status(401).json({ message: "Unauthorized" });
  next();
}

async function seedDatabase() {
  const config = await storage.getSiteConfig();
  if (!config) {
    await storage.updateSiteConfig({});
  }

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

  const existingSns = await storage.getSnsLinks();
  if (existingSns.length === 0) {
    await storage.createSnsLink({ platform: "Twitter", url: "https://twitter.com/", displayOrder: 0 });
    await storage.createSnsLink({ platform: "GitHub", url: "https://github.com/", displayOrder: 1 });
    await storage.createSnsLink({ platform: "Discord", url: "https://discord.com/", displayOrder: 2 });
    await storage.createSnsLink({ platform: "YouTube", url: "https://youtube.com/", displayOrder: 3 });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed DB on startup
  seedDatabase().catch(console.error);

  // Auth
  app.get("/api/auth/me", (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
  });

  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "shino0314";
    if (password === adminPassword) {
      req.session.isAdmin = true;
      req.session.save((err) => {
        if (err) return res.status(500).json({ message: "Session error" });
        res.json({ ok: true });
      });
    } else {
      res.status(401).json({ message: "パスワードが違います" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  // Site Config
  app.get("/api/site-config", async (req, res) => {
    let config = await storage.getSiteConfig();
    if (!config) config = await storage.updateSiteConfig({});
    res.json(config);
  });

  app.put("/api/site-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.updateSiteConfig(req.body);
      res.json(config);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

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

  app.put(api.profile.update.path, requireAdmin, async (req, res) => {
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

  app.post(api.devices.create.path, requireAdmin, async (req, res) => {
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

  app.put(api.devices.update.path, requireAdmin, async (req, res) => {
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

  app.delete(api.devices.delete.path, requireAdmin, async (req, res) => {
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

  app.post(api.games.create.path, requireAdmin, async (req, res) => {
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

  app.put(api.games.update.path, requireAdmin, async (req, res) => {
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

  app.delete(api.games.delete.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getGame(id);
    if (!existing) {
      return res.status(404).json({ message: "Game not found" });
    }
    await storage.deleteGame(id);
    res.status(204).send();
  });

  // SNS Links
  app.get(api.sns.list.path, async (req, res) => {
    const links = await storage.getSnsLinks();
    res.json(links);
  });

  app.post(api.sns.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.sns.create.input.parse(req.body);
      const link = await storage.createSnsLink(input);
      res.status(201).json(link);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.sns.update.path, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.sns.update.input.parse(req.body);
      const existing = await storage.getSnsLink(id);
      if (!existing) {
        return res.status(404).json({ message: "SNS link not found" });
      }
      const link = await storage.updateSnsLink(id, input);
      res.json(link);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.sns.delete.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getSnsLink(id);
    if (!existing) {
      return res.status(404).json({ message: "SNS link not found" });
    }
    await storage.deleteSnsLink(id);
    res.status(204).send();
  });

  return httpServer;
}
