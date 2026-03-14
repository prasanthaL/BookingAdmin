"use client";

import { useState } from "react";
import { Sparkles, Hotel, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { Button } from "@/components/ui/button";

interface SuperSidebarProps {
  user: {
    name?: string | null;
  };
}

export function SuperSidebar({ user }: SuperSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/super-admin", label: "Overview", icon: LayoutDashboard },
    { href: "/super-admin/hotels", label: "Hotels", icon: Hotel },
    { href: "/super-admin/settings", label: "System", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/5 flex items-center justify-between px-4 z-40 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-black tracking-tight text-lg text-white">Admin<span className="text-zinc-500">Center</span></span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/5" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 border-r border-white/5 bg-black/50 backdrop-blur-3xl flex flex-col p-8 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-xl text-white">Admin<span className="text-zinc-500">Center</span></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Super Admin</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-500 hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2 flex-grow">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group font-bold ${
                  isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <link.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 px-4 py-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-black text-white">SA</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold truncate max-w-[140px] text-white">{user.name}</span>
              <span className="text-[10px] text-zinc-500 truncate max-w-[140px] uppercase font-bold tracking-widest leading-none mt-1">Global Root</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
