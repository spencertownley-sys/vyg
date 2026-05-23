import { z } from "zod";

const cabinClassSchema = z.enum(["Interior", "Oceanview", "Balcony", "Mini-Suite", "Suite"]);

export const canonicalSailingSchema = z.object({
  sail_id: z.string().min(1),
  ship_name: z.string().min(1),
  line_name: z.string().min(1),
  departure_port: z.string().min(1),
  arrival_port: z.string().min(1),
  departure_dt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  arrival_dt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sail_duration: z.number().int().min(1).max(365),
  destination: z.string().min(1),
  ports_of_call: z.array(z.string()),
  fares: z.record(z.string(), z.number().positive()).optional().default({}),
  charter_flag: z.boolean(),
  charter_name: z.string().optional(),
  source_url: z.string().url().optional().or(z.string().length(0)).optional(),
  booking_url: z.string().optional(),
});

export type ValidatedCanonicalSailing = z.infer<typeof canonicalSailingSchema>;
