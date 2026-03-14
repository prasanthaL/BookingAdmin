import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { AddonForm } from "@/components/forms/addon-form";

export default async function EditAddonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getBusinessId();
  if (!businessId) redirect("/login");

  const addon = await prisma.addon.findUnique({ 
    where: { id, businessId: businessId as string } 
  });

  if (!addon) notFound();

  const initialData = {
    id: addon.id,
    name: addon.name,
    category: addon.category,
    priceType: addon.priceType as "PER_BOOKING" | "PER_DAY" | "PER_NIGHT" | "PER_GUEST" | "PER_HOUR" | "PER_QTY",
    unitPrice: Number(addon.unitPrice),
    description: addon.description ?? "",
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AddonForm initialData={initialData} />
    </div>
  );
}
