import { Button } from "@/components/ui/button";
import { ShieldAlert, Mail } from "lucide-react";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ef444415,transparent_50%)]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-8 animate-bounce">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter text-white mb-4">Access Restricted</h1>
        <p className="text-zinc-500 font-medium mb-10">
          Your account or business access has been suspended or deactivated. 
          Please contact our support team to resolve this issue.
        </p>

        <div className="space-y-4">
          <Button className="w-full h-14 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Support
          </Button>
          <Link href="/login" className="block text-zinc-500 hover:text-white transition-colors text-sm font-bold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
