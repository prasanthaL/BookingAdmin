import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { RoomForm } from "@/components/forms/room-form";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getBusinessId();
  if (!businessId) redirect("/login");

  const [room, roomTypes] = await Promise.all([
    prisma.room.findUnique({ 
      where: { id, businessId: businessId as string } 
    }),
    prisma.roomType.findMany({ 
      where: { businessId: businessId as string },
      orderBy: { name: "asc" } 
    }),
  ]);

  if (!room) notFound();

  const initialData = {
    id: room.id,
    roomNumber: room.roomNumber,
    roomTypeId: room.roomTypeId,
    status: room.status,
    floor: room.floor ?? undefined,
    notes: room.notes ?? "",
  };

  return (
    <div className="mx-auto max-w-5xl">
      <RoomForm 
        roomTypes={JSON.parse(JSON.stringify(roomTypes))} 
        initialData={JSON.parse(JSON.stringify(initialData))} 
      />
    </div>
  );
}
