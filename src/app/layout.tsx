import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hustlify – B2B Business Assessment Form",
  description: "Assessment form designed to help Hustlify evaluate business operations, sales & marketing workflows, and automation strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-800 bg-slate-50 selection:bg-amber-500/20 selection:text-amber-900 min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
