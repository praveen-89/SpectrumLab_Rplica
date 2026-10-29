import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s | ${site.name}`,
    default: site.name,
  },
  description: site.description,
  keywords: [
    "IISc",
    "Indian Institute of Science",
    "Bengaluru",
    "Spectrum Lab",
    "Chandra Sekhar Seelamantula",
    "signal processing",
    "image processing",
    "computational imaging",
    "machine learning",
    "deep learning",
    "sampling theory",
    "bio-imaging",
    "medical imaging",
    "AI healthcare",
    "spline theory",
    "finite rate of innovation",
    "denoising",
    "reconstruction",
    "PhD opportunities IISc",
    "generative modeling",
    "flow matching",
    "diffusion",
    "Chaksu AI",
    "TAANU",
    "neuromorphic",
    "radar",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en",
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: "summary",
    site: site.social.twitterHandle,
    creator: site.social.twitterHandle,
  },
  icons: {
    icon: "/assets/favicon/favicon_io/favicon.ico",
  },
  verification: {
    google: "BZruwyNTkZvWoF9dJ-dg_5-QFlyAvFYIZsrjYqTPfc4",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoSlab.variable}`}
    >
      <body>
        <a href="#main-content" className="visually-hidden-focusable">
          Skip to main content
        </a>
        <Providers>
          <Navbar />
          <main id="main-content" className="container mt-5" role="main">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
