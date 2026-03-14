"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/register.schema";
import { signIn } from "@/auth";

export async function registerHotelAction(prevState: any, formData: FormData) {
  const raw = {
    hotelName: String(formData.get("hotelName") ?? ""),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    plan: String(formData.get("plan") ?? "STARTER"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the form errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
  if (emailExists) {
    return { success: false, message: "Email already exists." };
  }

  const slugExists = await prisma.business.findUnique({ where: { slug: data.slug } });
  if (slugExists) {
    return { success: false, message: "Business slug already exists." };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const business = await prisma.business.create({
    data: {
      name: data.hotelName,
      slug: data.slug,
      contactEmail: data.email,
      contactPhone: data.phone,
      plan: data.plan,
      trialStartsAt: now,
      trialEndsAt,
      accessStatus: "TRIAL",
      subscriptions: {
        create: {
          plan: data.plan,
          status: "TRIALING",
          provider: "MANUAL",
          trialStartsAt: now,
          trialEndsAt,
        },
      },
      users: {
        create: {
          name: data.fullName,
          email: data.email,
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
      },
    },
    include: {
      users: true,
    },
  });

  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
  } catch (error) {
    console.error("Auto sign-in failed:", error);
  }

  redirect("/dashboard");
}
