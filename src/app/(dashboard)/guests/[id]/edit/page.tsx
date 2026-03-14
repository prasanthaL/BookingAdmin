import { prisma } from "@/lib/prisma";
import { getBusinessId } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { GuestForm } from "@/components/forms/guest-form";

export default async function EditGuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const businessId = await getBusinessId();
  if (!businessId) redirect("/login");

  const guest = await prisma.guest.findUnique({ 
    where: { id, businessId: businessId as string } 
  });

  if (!guest) notFound();

  const initialData = {
    id: guest.id,
    fullName: guest.fullName,
    phone: guest.phone,
    email: guest.email ?? "",
    nicPassport: guest.nicPassport ?? "",
    nationality: guest.nationality ?? "",
    address: guest.address ?? "",
    notes: guest.notes ?? "",
  };

  return (
    <div className="mx-auto max-w-5xl">
      <GuestForm initialData={initialData} />
    </div>
  );
}
