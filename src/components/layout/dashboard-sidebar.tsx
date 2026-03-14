"use client";

import { useState } from "react";
import { Building2, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { LogoutButton } from "./logout-button";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  business: {
    name: string;
    id: string;
  };
  user: {
    name?: string | null;
    email?: string | null;
  };
  role: string;
  initials: string;
}

export function DashboardSidebar({ business, user, role, initials }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-40 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white truncate max-w-[150px]">
            {business.name}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-10 h-10 p-0 text-white hover:bg-zinc-900" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-zinc-950 text-zinc-400 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center px-6 border-b border-zinc-900 lg:border-none">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white truncate max-w-[160px]">
              {business.name}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto w-9 h-9 p-0 text-zinc-500 hover:text-white hover:bg-zinc-900 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-4 py-4">
          <button className="flex w-full items-center justify-between rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-zinc-800 transition-all hover:bg-zinc-800">
            <span className="truncate">{business.name}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100vh-140px)]">
          <SidebarNav />

          <div className="mt-auto px-4 pb-6">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-900/50 p-3 ring-1 ring-zinc-800/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-white">{user.name}</p>
                <p className="truncate text-[10px] text-zinc-500">{user.email}</p>
                <p className="truncate text-[10px] text-zinc-600 capitalize">{role.toLowerCase()}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
