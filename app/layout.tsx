import { Roboto, Roboto_Slab } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

// The original site loads "SF Pro Display/Text" via a private Adobe Typekit
// kit we have no access to; -apple-system/BlinkMacSystemFont resolve to the
// same San Francisco family on Apple devices, so the visual result is close
// without that dependency. Roboto is self-hosted here instead of fetched
// from fonts.googleapis.com at request time. "Google Sans" was dropped: it
// only ever appeared as the last fallback in the font stack, never used
// elsewhere, and isn't in next/font/google's fallback-metrics table.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-roboto-slab",
  display: "swap",
});

// Deliberately minimal: the public site's Navbar/Footer/metadata live in
// app/(site)/layout.tsx, not here, so the admin portal (a sibling route
// under app/admin/) never inherits the public site's chrome. Only truly
// shared infrastructure (fonts, theming) belongs at this root.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${robotoSlab.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
