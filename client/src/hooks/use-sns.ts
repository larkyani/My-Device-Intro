import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type SnsListResponse, type SnsResponse } from "@shared/routes";
import { type InsertSnsLink, type UpdateSnsLinkRequest } from "@shared/schema";

export function useSnsLinks() {
  return useQuery({
    queryKey: [api.sns.list.path],
    queryFn: async () => {
      const res = await fetch(api.sns.list.path);
      if (!res.ok) throw new Error("Failed to fetch SNS links");
      return res.json() as Promise<SnsListResponse>;
    },
  });
}

export function useCreateSnsLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (link: InsertSnsLink) => {
      const validated = api.sns.create.input.parse(link);
      const res = await fetch(api.sns.create.path, {
        method: api.sns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to create SNS link");
      return res.json() as Promise<SnsResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sns.list.path] });
    },
  });
}

export function useUpdateSnsLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateSnsLinkRequest) => {
      const validated = api.sns.update.input.parse(updates);
      const url = buildUrl(api.sns.update.path, { id });
      const res = await fetch(url, {
        method: api.sns.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to update SNS link");
      return res.json() as Promise<SnsResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sns.list.path] });
    },
  });
}

export function useDeleteSnsLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sns.delete.path, { id });
      const res = await fetch(url, { method: api.sns.delete.method });
      if (!res.ok) throw new Error("Failed to delete SNS link");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sns.list.path] });
    },
  });
}
