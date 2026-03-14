"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { registerHotelAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Hotel, AtSign, User, Phone, Lock, Sparkles, Building2 } from "lucide-react";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerHotelAction as any, initialState);
  const [slug, setSlug] = useState("");
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    if (!state?.message) return;
    if (state.success) toast.success(state.message);
    else {
      if (state.errors) {
        // Flattened errors display
        const firstError = Object.values(state.errors)[0] as string[];
        toast.error(firstError[0] || state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHotelName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  return (
    <form action={formAction} className="relative z-10 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Hotel / Guest House Name</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <Hotel className="h-4 w-4" />
            </div>
            <Input
              name="hotelName"
              value={hotelName}
              onChange={handleNameChange}
              placeholder="Grand Palace Hotel"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Business Slug (URL)</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <Building2 className="h-4 w-4" />
            </div>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="grand-palace"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm font-medium"
            />
          </div>
        </div>


        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Admin Full Name</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <User className="h-4 w-4" />
            </div>
            <Input
              name="fullName"
              placeholder="John Doe"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Phone Number</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <Phone className="h-4 w-4" />
            </div>
            <Input
              name="phone"
              placeholder="+1 (555) 000-0000"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Work Email</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <AtSign className="h-4 w-4" />
            </div>
            <Input
              name="email"
              type="email"
              placeholder="admin@hotel.com"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Password</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center">
        <Button 
          disabled={pending} 
          type="submit"
          className="w-full h-15 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all py-8"
        >
          {pending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-lg">Start 14-Day Free Trial</span>
              <span className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                No credit card required <Sparkles className="h-3 w-3" />
              </span>
            </div>
          )}
        </Button>
        <p className="mt-6 text-zinc-500 text-sm font-medium">
          Already have an account? <a href="/login" className="text-blue-400 hover:text-blue-300 font-bold">Sign in here</a>
        </p>
      </div>
    </form>
  );
}
