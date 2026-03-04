import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GamesListResponse, type GameResponse } from "@shared/routes";
import { type InsertGame, type UpdateGameRequest } from "@shared/schema";

const fallbackGames: GamesListResponse = [
  { id: 1, title: "Apex Legends", platform: "PC", description: "メインでプレイしているバトロワ。マスター目指して練習中！" },
  { id: 2, title: "Cyberpunk 2077", platform: "PC/PS5", description: "世界観とストーリーが最高。ナイトシティの探索が止まらない。" },
  { id: 3, title: "ELDEN RING", platform: "PC", description: "ビルドを考えるのが楽しいアクションRPG。DLCもクリア済み。" },
];

export function useGames() {
  return useQuery({
    queryKey: [api.games.list.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.games.list.path);
        if (!res.ok) return fallbackGames;
        const data = await res.json();
        return data as GamesListResponse;
      } catch {
        return fallbackGames;
      }
    },
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game: InsertGame) => {
      const validated = api.games.create.input.parse(game);
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) throw new Error("Failed to create game");
      const data = await res.json();
      return data as GameResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateGameRequest) => {
      const validated = api.games.update.input.parse(updates);
      const url = buildUrl(api.games.update.path, { id });
      const res = await fetch(url, {
        method: api.games.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) throw new Error("Failed to update game");
      const data = await res.json();
      return data as GameResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.games.delete.path, { id });
      const res = await fetch(url, { method: api.games.delete.method });
      if (!res.ok) throw new Error("Failed to delete game");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
    },
  });
}
