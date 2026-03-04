import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type DevicesListResponse, type DeviceResponse } from "@shared/routes";
import { type InsertDevice, type UpdateDeviceRequest } from "@shared/schema";

const fallbackDevices: DevicesListResponse = [
  { id: 1, name: "Custom PC (白統一)", category: "Desktop", specs: "Core i7 13700K / RTX 4080 / 32GB RAM" },
  { id: 2, name: "Logicool G PRO X SUPERLIGHT", category: "Mouse", specs: "ワイヤレス / 63g 軽量" },
  { id: 3, name: "Wooting 60HE", category: "Keyboard", specs: "ラピッドトリガー搭載 / 60%サイズ" },
  { id: 4, name: "BenQ ZOWIE XL2546K", category: "Monitor", specs: "24.5インチ / 240Hz / TNパネル" },
];

export function useDevices() {
  return useQuery({
    queryKey: [api.devices.list.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.devices.list.path);
        if (!res.ok) return fallbackDevices;
        const data = await res.json();
        return data as DevicesListResponse;
      } catch {
        return fallbackDevices;
      }
    },
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (device: InsertDevice) => {
      const validated = api.devices.create.input.parse(device);
      const res = await fetch(api.devices.create.path, {
        method: api.devices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) throw new Error("Failed to create device");
      const data = await res.json();
      return data as DeviceResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateDeviceRequest) => {
      const validated = api.devices.update.input.parse(updates);
      const url = buildUrl(api.devices.update.path, { id });
      const res = await fetch(url, {
        method: api.devices.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) throw new Error("Failed to update device");
      const data = await res.json();
      return data as DeviceResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.devices.delete.path, { id });
      const res = await fetch(url, { method: api.devices.delete.method });
      if (!res.ok) throw new Error("Failed to delete device");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
    },
  });
}
