import { RoomTypeForm } from "@/components/forms/room-type-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
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
          New <span className="text-zinc-400">Category</span>
        </h1>
        <p className="mt-2 text-zinc-500 font-medium">Define a new room type for your hotel inventory.</p>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-10 bg-white/50 backdrop-blur-sm">
        <RoomTypeForm />
      </div>
    </div>
  );
}
