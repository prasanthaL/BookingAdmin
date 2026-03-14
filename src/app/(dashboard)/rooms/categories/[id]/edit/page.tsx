import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { RoomTypeForm } from "@/components/forms/room-type-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const businessId = await getBusinessId();
  if (!businessId) redirect("/login");
  
  const category = await prisma.roomType.findUnique({
    where: { id, businessId: businessId as string },
  });

  if (!category) notFound();

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <div className="animate-in">
        <Link 
          href="/rooms?tab=categories"
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to categories
        </Link>
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl">
          Edit <span className="text-zinc-400">Category</span>
        </h1>
        <p className="mt-2 text-zinc-500 font-medium font-mono text-xs bg-zinc-100 w-fit px-2 py-1 rounded">ID: {id}</p>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-10 bg-white/50 backdrop-blur-sm">
        <RoomTypeForm initialData={JSON.parse(JSON.stringify(category))} id={id} />
      </div>
    </div>
  );
}
