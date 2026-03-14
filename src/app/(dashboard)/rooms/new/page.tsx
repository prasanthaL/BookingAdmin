import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { RoomForm } from "@/components/forms/room-form";

export const metadata = {
  title: "Add New Room - GrandHotel",
};

export default async function NewRoomPage() {
  const businessId = await getBusinessId();
  const roomTypes = await prisma.roomType.findMany({
    where: { businessId: businessId as string },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <RoomForm roomTypes={roomTypes} />;
}
