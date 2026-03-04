import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProfileResponse } from "@shared/routes";
import { type UpdateProfileRequest } from "@shared/schema";

function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      return parseWithLogging<ProfileResponse>(api.profile.get.responses[200], data, "profile.get");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: UpdateProfileRequest) => {
      const validated = api.profile.update.input.parse(updates);
      const res = await fetch(api.profile.update.path, {
        method: api.profile.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) throw new Error("Invalid profile data");
        throw new Error("Failed to update profile");
      }
      
      const data = await res.json();
      return parseWithLogging<ProfileResponse>(api.profile.update.responses[200], data, "profile.update");
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.profile.get.path], data);
    },
  });
}
