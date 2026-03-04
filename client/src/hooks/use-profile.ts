import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProfileResponse } from "@shared/routes";
import { type UpdateProfileRequest } from "@shared/schema";

const fallbackProfile: ProfileResponse = {
  id: 1,
  name: "ゲーマー太郎",
  bio: "FPSとRPGが大好きなゲーマーです。最近はPCの自作にもハマっています。よろしくお願いします！",
};

export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.profile.get.path);
        if (!res.ok) return fallbackProfile;
        const data = await res.json();
        return data as ProfileResponse;
      } catch {
        return fallbackProfile;
      }
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
      return data as ProfileResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.profile.get.path], data);
    },
  });
}
