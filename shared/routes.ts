import { z } from "zod";
import { 
  insertProfileSchema, 
  insertDeviceSchema, 
  insertGameSchema,
  profiles,
  devices,
  games
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile' as const,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profile' as const,
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  devices: {
    list: {
      method: 'GET' as const,
      path: '/api/devices' as const,
      responses: {
        200: z.array(z.custom<typeof devices.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/devices' as const,
      input: insertDeviceSchema,
      responses: {
        201: z.custom<typeof devices.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/devices/:id' as const,
      input: insertDeviceSchema.partial(),
      responses: {
        200: z.custom<typeof devices.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/devices/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  games: {
    list: {
      method: 'GET' as const,
      path: '/api/games' as const,
      responses: {
        200: z.array(z.custom<typeof games.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/games' as const,
      input: insertGameSchema,
      responses: {
        201: z.custom<typeof games.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/games/:id' as const,
      input: insertGameSchema.partial(),
      responses: {
        200: z.custom<typeof games.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/games/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ProfileResponse = z.infer<typeof api.profile.get.responses[200]>;
export type DevicesListResponse = z.infer<typeof api.devices.list.responses[200]>;
export type DeviceResponse = z.infer<typeof api.devices.create.responses[201]>;
export type GamesListResponse = z.infer<typeof api.games.list.responses[200]>;
export type GameResponse = z.infer<typeof api.games.create.responses[201]>;
