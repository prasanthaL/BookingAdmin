"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid login details or access blocked.");
        return;
      }

      toast.success("Login successful.");
      router.push("/auth/redirect");
      router.refresh();
    });
  };

  return (
    <div className="relative z-10">
      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Email Address</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@company.com"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-400 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Password</Label>
            <button type="button" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Forgot?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors z-20">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="pl-12 h-14 bg-white border-white/20 text-black rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-400 font-medium"
            />
          </div>
        </div>

        <Button 
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100" 
          disabled={pending} 
          type="submit"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              Sign In to Dashboard
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
