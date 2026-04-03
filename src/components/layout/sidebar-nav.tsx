"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bookmark, 
  DoorOpen, 
  Users, 
  PlusSquare, 
  CreditCard,
  BarChart3,
  Zap,
  Settings
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: Bookmark },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/addons", label: "Add-ons", icon: PlusSquare },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/billing/upgrade", label: "Billing & Plans", icon: Zap },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5 px-4 pt-4">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:text-white ${
              isActive 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
              : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            <link.icon className={`h-5 w-5 ${isActive ? "text-white" : "group-hover:text-white"}`} />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/settings"
        className={`group mt-4 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:bg-zinc-900 hover:text-white ${
          pathname === "/settings" ? "bg-zinc-900 text-white" : "text-zinc-400"
        }`}
      >
        <Settings className="h-5 w-5 group-hover:text-white" />
        Settings
      </Link>
    </nav>
  );
}
