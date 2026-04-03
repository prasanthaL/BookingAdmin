import { Zap, ShieldCheck, Check } from "lucide-react";
import { DodoCheckoutButton } from "@/components/payments/dodo-checkout-button";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const plans = [
    {
      name: "Starter",
      planKey: "STARTER",
      price: "$29",
      description: "Perfect for boutique guest houses",
      features: ["Up to 10 Rooms", "Single User", "Basic Reports", "Email Support"],
      color: "blue",
    },
    {
      name: "Professional",
      planKey: "PROFESSIONAL",
      price: "$79",
      description: "Best for growing hotels",
      features: [
        "Unlimited Rooms",
        "Unlimited Users",
        "Advanced Analytics",
        "Priority Support",
        "Custom Add-ons",
      ],
      color: "emerald",
      popular: true,
    },
    {
      name: "Enterprise",
      planKey: "ENTERPRISE",
      price: "Custom",
      description: "For hotel chains and resorts",
      features: [
        "Multi-branch Support",
        "SLA Guarantee",
        "Dedicated Account Manager",
        "White-label Options",
      ],
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6 py-20 flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full text-center mb-12 md:mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">
          <Zap className="h-3 w-3" />
          Trial Completed
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic px-4">
          Level Up Your{" "}
          <span className="text-zinc-500 underline decoration-blue-500 underline-offset-8">
            Operations
          </span>
        </h1>
        <p className="text-zinc-500 font-medium max-w-2xl mx-auto text-base md:text-lg leading-relaxed px-6">
          Your trial has ended. Select a plan below to keep using our premium management tools and
          grow your hospitality business.
        </p>
      </div>

      <div className="relative z-10 grid gap-8 md:grid-cols-3 max-w-6xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-panel relative flex flex-col rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border transition-all duration-500 hover:-translate-y-2 ${
              plan.popular
                ? "border-blue-500/50 bg-blue-500/5 md:scale-105 z-20 shadow-2xl shadow-blue-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-black mb-1 tracking-tight">{plan.name}</h2>
              <p className="text-zinc-500 text-sm font-medium">{plan.description}</p>
            </div>

            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
              {plan.price !== "Custom" && <span className="text-zinc-500 font-bold">/mo</span>}
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                  <div
                    className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-blue-500" : "bg-zinc-800"
                    }`}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            {plan.price === "Custom" ? (
              <Button
                className="w-full h-14 rounded-2xl font-black transition-all bg-white/10 hover:bg-white/20 text-white border border-white/10"
              >
                Contact Sales
              </Button>
            ) : (
              <DodoCheckoutButton
                plan={plan.planKey}
                label="Upgrade Now"
                className={`w-full h-14 rounded-2xl font-black transition-all ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="mt-20 text-zinc-600 text-sm font-medium flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        Secure payments powered by Dodo Payments. Cancel anytime.
      </p>
    </div>
  );
}
