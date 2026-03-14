import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Hotel Booking Admin",
  description: "Hotel / guest house admin booking system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
