import { z } from "zod";

export const guestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  nicPassport: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  priceType: z.enum([
    "PER_BOOKING",
    "PER_DAY",
    "PER_NIGHT",
    "PER_GUEST",
    "PER_HOUR",
    "PER_QTY",
  ]),
  unitPrice: z.coerce.number().min(0, "Price must be at least 0"),
  description: z.string().optional().or(z.literal("")),
});

export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  status: z.enum([
    "AVAILABLE",
    "RESERVED",
    "OCCUPIED",
    "DIRTY",
    "CLEANING",
    "MAINTENANCE",
  ]).default("AVAILABLE"),
  floor: z.coerce.number().int().optional(),
  notes: z.string().optional().or(z.literal("")),
});

export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
});

export const roomTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  basePrice: z.coerce.number().min(0, "Price must be at least 0"),
});


export type GuestInput = z.infer<typeof guestSchema>;
export type AddonInput = z.infer<typeof addonSchema>;
export type RoomInput = z.output<typeof roomSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;

