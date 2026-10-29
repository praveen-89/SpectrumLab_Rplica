import type { Metadata } from "next";
import { Google_Sans, Roboto, Roboto_Slab } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Providers from "@/components/Providers";

// The original site loads "SF Pro Display/Text" via a private Adobe Typekit
// kit we have no access to; -apple-system/BlinkMacSystemFont resolve to the
// same San Francisco family on Apple devices, so the visual result is close
// without that dependency. Google Sans and Roboto are self-hosted here
// instead of fetched from fonts.googleapis.com at request time.
const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

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
  metadataBase: new URL("https://spectrum.ee.iisc.ac.in"),
  title: {
    template: "%s | Spectrum Lab",
    default: "Spectrum Lab",
  },
  description:
    "Spectrum Lab at IISc Bengaluru, led by Prof. Chandra Sekhar Seelamantula, conducts cutting-edge research in signal processing, computational imaging, machine learning, and AI for healthcare.",
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
  authors: [{ name: "Spectrum Lab" }],
  openGraph: {
    type: "website",
    locale: "en",
    title: "Spectrum Lab",
    description:
      "Spectrum Lab at IISc Bengaluru, led by Prof. Chandra Sekhar Seelamantula, conducts cutting-edge research in signal processing, computational imaging, machine learning, and AI for healthcare.",
  },
  twitter: {
    card: "summary",
    site: "@SpectrumLabIISc",
    creator: "@SpectrumLabIISc",
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
      className={`${googleSans.variable} ${roboto.variable} ${robotoSlab.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
