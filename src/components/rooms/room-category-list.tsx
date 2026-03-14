"use client";

import Link from "next/link";
import {
  BedDouble,
  Users,
  Trash2,
  Pencil,
  Plus
} from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteRoomTypeAction } from "@/app/actions/entity.actions";

interface RoomCategoryListProps {
  categories: any[];
}

export function RoomCategoryList({ categories }: RoomCategoryListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-zinc-900">Room Categories</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, idx) => (
          <div 
            key={category.id} 
            className={`glass-panel group rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-1 animate-in`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <BedDouble className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Link
                  href={`/rooms/categories/${category.id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <DeleteButton
                  id={category.id}
                  label={category.name}
                  action={deleteRoomTypeAction}
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-black text-zinc-900">{category.name}</h3>
              <p className="mt-1 text-sm font-medium text-zinc-500 line-clamp-2 min-h-[40px]">
                {category.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                  <Users className="h-3.5 w-3.5" />
                  Max {category.capacity}
                </div>
                <div className="h-1 w-1 rounded-full bg-zinc-200"></div>
                <div className="flex items-center gap-1 text-xs font-black text-blue-600">
                  ${String(category.basePrice)}
                  <span className="font-bold text-zinc-400">/night</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl bg-zinc-50/50">
            <BedDouble className="h-12 w-12 text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-medium italic">No room categories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
