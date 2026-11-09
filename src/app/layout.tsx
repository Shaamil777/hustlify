import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hustlify – B2B Business Assessment Form",
  description: "Assessment form designed to help Hustlify evaluate business operations, sales & marketing workflows, and automation strategies.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="font-sans antialiased text-slate-800 bg-[#eef2f6] selection:bg-emerald-500/20 selection:text-emerald-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
