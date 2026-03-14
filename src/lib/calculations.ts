import type { AddonPriceType } from "@prisma/client";

export function calculateNights(checkInDate: string, checkOutDate: string) {
  const inMs = new Date(checkInDate).getTime();
  const outMs = new Date(checkOutDate).getTime();
  const diff = Math.ceil((outMs - inMs) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

export function calculateAddonLineTotal(params: {
  unitPrice: number;
  quantity: number;
  priceType: AddonPriceType | string;
  nights?: number;
  adults?: number;
}) {
  const { unitPrice, quantity, priceType, nights = 1, adults = 1 } = params;

  switch (priceType) {
    case "PER_BOOKING":
      return unitPrice * quantity;
    case "PER_DAY":
    case "PER_NIGHT":
      return unitPrice * quantity * nights;
    case "PER_GUEST":
      return unitPrice * quantity * adults;
    case "PER_HOUR":
    case "PER_QTY":
    default:
      return unitPrice * quantity;
  }
}
