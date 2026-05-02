import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Larp till you're Larped",
  description: "A premium browser strategy game about becoming internet-famous without getting exposed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
