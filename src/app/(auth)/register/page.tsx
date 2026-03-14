import { RegisterForm } from "@/components/auth/register-form";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030303] flex items-center justify-center p-6 py-20">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:3s]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
      </div>

      <div className="w-full max-w-4xl relative">
        <div className="flex flex-col items-center mb-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles className="h-3 w-3" />
            Empowering Independent Hotels
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-4">
            Scale your <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Hospitality</span>
          </h1>
          <p className="text-zinc-500 font-medium max-w-lg mx-auto">
            Everything you need to manage bookings, guests, and revenue in one powerful, multi-tenant dashboard.
          </p>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-12 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700 delay-100 shadow-2xl shadow-black/50">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32 text-white" />
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
