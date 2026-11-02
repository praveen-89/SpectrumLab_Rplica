import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSite } from "@/lib/site";
import { getNavEntries } from "@/lib/nav";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
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
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navEntries = await getNavEntries();

  return (
    <>
      <a href="#main-content" className="visually-hidden-focusable">
        Skip to main content
      </a>
      <Navbar navEntries={navEntries} />
      <main id="main-content" className="fixed-top-nav container mt-5" role="main">
        {children}
      </main>
      <Footer />
    </>
  );
}
