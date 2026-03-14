import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import Link from "next/link";
import { User, Plus, Phone, Mail, FileText, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteGuestAction } from "@/app/actions/entity.actions";

export default async function GuestsPage() {
  const businessId = await getBusinessId();
  const guests = await prisma.guest.findMany({
    where: { businessId: businessId as string },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Guests</h1>
          <p className="mt-1 text-zinc-500 font-medium">Guest list and relationship management.</p>
        </div>
        <Link
          href="/guests/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Register Guest
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {guests.map((guest) => (
          <div key={guest.id} className="glass-panel group rounded-3xl p-6 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 transition-transform group-hover:scale-110">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate text-lg font-bold text-zinc-900">{guest.fullName}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <FileText className="h-3 w-3" />
                  {guest.nicPassport || "NO ID"}
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/guests/${guest.id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton id={guest.id} label={guest.fullName} action={deleteGuestAction} />
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5">
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-600">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                {guest.phone}
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-600">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                {guest.email || "No email provided"}
              </div>
            </div>
          </div>
        ))}
        {guests.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center">
            <User className="mx-auto h-12 w-12 text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-medium italic">No guests registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
