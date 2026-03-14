import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030303] flex items-center justify-center p-6">
      {/* Dynamic Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-xl relative">
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="h-16 w-16 mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 shadow-2xl shadow-blue-500/20">
            <div className="h-full w-full rounded-[22px] bg-black flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            Welcome <span className="text-zinc-500 italic">Back</span>
          </h1>
          <p className="text-zinc-500 font-medium">Elevating your hotel management experience.</p>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700 delay-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-zinc-600 font-medium animate-in fade-in duration-1000 delay-500">
          New to the platform? <Link href="/register" className="text-zinc-300 hover:text-white font-black underline underline-offset-4 transition-all">Start your free trial</Link>
        </p>
      </div>
    </div>
  );
}
