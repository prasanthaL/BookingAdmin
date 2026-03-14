import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import Link from "next/link";
import { Suspense } from "react";
import { 
  Plus, 
  DoorOpen, 
  BedDouble,
  Pencil,
  LayoutGrid,
} from "lucide-react";
import { RoomsSearch } from "@/components/rooms/rooms-search";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteRoomAction } from "@/app/actions/entity.actions";
import { RoomCategoryList } from "@/components/rooms/room-category-list";
import { redirect } from "next/navigation";

interface RoomsPageProps {
  searchParams: Promise<{ q?: string; type?: string; tab?: string }>;
}

export default async function RoomsPage(props: RoomsPageProps) {
  const searchParams = await props.searchParams;
  const { q, type, tab = "inventory" } = searchParams;
  const businessId = await getBusinessId();
  if (!businessId) redirect("/login");

  const [rooms, roomTypes] = await Promise.all([
    prisma.room.findMany({
      where: {
        businessId,
        AND: [
          q
            ? {
                OR: [
                  { roomNumber: { contains: q, mode: "insensitive" } },
                  { roomType: { name: { contains: q, mode: "insensitive" } } },
                ],
              }
            : {},
          type ? { roomTypeId: type } : {},
        ],
      },
      include: { roomType: true },
      orderBy: { roomNumber: "asc" },
    }),
    prisma.roomType.findMany({ 
      where: { businessId },
      orderBy: { name: "asc" } 
    }),
  ]);

  const serializedRooms = JSON.parse(JSON.stringify(rooms));
  const serializedRoomTypes = JSON.parse(JSON.stringify(roomTypes));

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-in">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl">
            Room <span className="text-zinc-400">Management</span>
          </h1>
          <p className="mt-2 text-zinc-500 font-medium italic">Configure your hotel inventory and categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={tab === "categories" ? "/rooms/categories/new" : "/rooms/new"}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <Plus className="h-4 w-4 relative" />
            <span className="relative">{tab === "categories" ? "New Category" : "Add Room"}</span>
          </Link>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 w-fit rounded-[1.25rem] animate-in delay-100">
        <Link
          href="/rooms?tab=inventory"
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            tab === "inventory"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Inventory
        </Link>
        <Link
          href="/rooms?tab=categories"
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            tab === "categories"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <BedDouble className="h-4 w-4" />
          Categories
        </Link>
      </div>

      <div className="animate-in delay-200">
        {tab === "inventory" ? (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {serializedRoomTypes.map((type: any) => (
                <div key={type.id} className={`glass-panel group rounded-3xl p-6 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                      <BedDouble className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{type.name}</p>
                      <p className="text-lg font-black text-zinc-900">${String(type.basePrice)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="glass-panel rounded-3xl p-2 bg-white/50 backdrop-blur-sm">
              <Suspense>
                <RoomsSearch roomTypes={serializedRoomTypes} />
              </Suspense>
            </div>

            {/* Rooms Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {serializedRooms.map((room: any, idx: number) => (
                <div 
                  key={room.id} 
                  className="glass-panel group rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 hover:-translate-y-1 animate-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black tracking-tighter text-zinc-900">Nº {room.roomNumber}</h3>
                        <span className={`h-1.5 w-1.5 rounded-full ${room.status === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-300'}`}></span>
                      </div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{room.roomType.name}</p>
                    </div>
                    <div className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${
                      room.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                        : 'bg-zinc-50 text-zinc-500 ring-zinc-200'
                    }`}>
                      {room.status}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 font-black">
                        {room.floor || 1}
                      </div>
                      Floor
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link
                        href={`/rooms/${room.id}/edit`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white"
                        title="Edit Room"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={room.id} label={`Room ${room.roomNumber}`} action={deleteRoomAction} />
                    </div>
                  </div>
                </div>
              ))}
              
              {serializedRooms.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-4 py-32 text-center glass-panel rounded-[2.5rem] bg-zinc-50/50 border-dashed">
                  <div className="mx-auto h-20 w-20 rounded-[2rem] bg-zinc-100 flex items-center justify-center text-zinc-300 mb-6">
                    <DoorOpen className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">No rooms found</h3>
                  <p className="text-zinc-400 font-medium italic mt-1">Try adjusting your filters or add a new room.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <RoomCategoryList categories={serializedRoomTypes} />
        )}
      </div>
    </div>
  );
}
