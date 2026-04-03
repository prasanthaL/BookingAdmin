"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DodoCheckoutButtonProps {
  plan: string;
  label?: string;
  className?: string;
}

export function DodoCheckoutButton({ plan, label = "Upgrade Now", className }: DodoCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to start checkout");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("No checkout URL returned from Dodo Payments.");
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Redirecting...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
