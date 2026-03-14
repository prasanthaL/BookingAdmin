import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import Link from "next/link";
import { Plus, PlusSquare, LayoutGrid, Pencil } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteAddonAction } from "@/app/actions/entity.actions";

export default async function AddonsPage() {
  const businessId = await getBusinessId();
  const addons = await prisma.addon.findMany({
    where: { businessId: businessId as string },
    orderBy: { name: "asc" },
  });

  const serializedAddons = JSON.parse(JSON.stringify(addons));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Add-ons</h1>
          <p className="mt-1 text-zinc-500 font-medium">Manage extra services attached to bookings.</p>
        </div>
        <Link
          href="/addons/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {serializedAddons.map((addon: any) => (
          <div key={addon.id} className="glass-panel group relative overflow-hidden rounded-3xl p-6 hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                <PlusSquare className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900">{addon.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{addon.category}</p>
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/addons/${addon.id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-amber-50 hover:text-amber-600"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton id={addon.id} label={addon.name} action={deleteAddonAction} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                <LayoutGrid className="h-3.5 w-3.5" />
                {addon.priceType.replaceAll("_", " ")}
              </div>
              <p className="text-xl font-black text-zinc-900">{formatMoney(String(addon.unitPrice))}</p>
            </div>
          </div>
        ))}
        {serializedAddons.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center">
            <PlusSquare className="mx-auto h-12 w-12 text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-medium italic">No add-ons created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
