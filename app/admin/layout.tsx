import { Inter } from "next/font/google";
import "@/Admin/frontend/admin.css";

// Loaded here rather than a CSS @import in admin.css — next/font/google
// self-hosts the file and avoids a render-blocking network fetch, the
// same pattern the public site already uses for Roboto (see
// app/(site)/layout.tsx's sibling app/layout.tsx).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
