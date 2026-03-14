import { z } from "zod";

export const bookingAddonInputSchema = z.object({
  addonId: z.string().min(1, "Add-on is required"),
  serviceDate: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
  priceType: z.enum([
    "PER_BOOKING",
    "PER_DAY",
    "PER_NIGHT",
    "PER_GUEST",
    "PER_HOUR",
    "PER_QTY",
  ]),
  notes: z.string().max(500).optional(),
});

const createBookingBaseSchema = z
  .object({
    guestId: z.string().min(1, "Guest is required"),
    roomId: z.string().min(1, "Room is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    adults: z.coerce.number().int().min(1, "At least 1 adult is required"),
    children: z.coerce.number().int().min(0).default(0),
    discount: z.coerce.number().min(0).default(0),
    advanceAmount: z.coerce.number().min(0).default(0),
    notes: z.string().max(1000).optional(),
    addons: z.array(bookingAddonInputSchema).default([]),
  });

export const createBookingSchema = createBookingBaseSchema.refine(
  (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
  {
    path: ["checkOutDate"],
    message: "Check-out must be after check-in",
  }
);

export type CreateBookingInput = z.input<typeof createBookingBaseSchema>;
export type CreateBookingOutput = z.output<typeof createBookingBaseSchema>;
