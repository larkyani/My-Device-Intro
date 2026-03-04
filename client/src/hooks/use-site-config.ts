import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SiteConfig, InsertSiteConfig } from "@shared/schema";

export function useSiteConfig() {
  return useQuery<SiteConfig>({
    queryKey: ["/api/site-config"],
    queryFn: () => fetch("/api/site-config").then((r) => r.json()),
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<InsertSiteConfig>) => {
      const res = await fetch("/api/site-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json() as Promise<SiteConfig>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/site-config"], data);
    },
  });
}
