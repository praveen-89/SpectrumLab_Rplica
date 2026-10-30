import type { Metadata } from "next";
import { readData } from "@/lib/content/data";
import { recognitionItemSchema } from "@/lib/content/schemas";
import RecognitionList from "@/components/RecognitionList";

const DESCRIPTION = "A showcase of the prestigious awards, fellowships, and honors received by our lab members.";

export const metadata: Metadata = {
  title: "Recognition",
  description: DESCRIPTION,
  alternates: { canonical: "/recognition/" },
};

export default async function RecognitionPage() {
  const items = await readData("recognition.json", recognitionItemSchema);

  return (
    <div className="post">
      <header className="post-header">
        <h1 className="post-title">Recognition</h1>
        <p className="post-description">{DESCRIPTION}</p>
      </header>
      <div className="post-content">
        <p>
          The Spectrum Lab has been recognized through various awards and fellowships. Our team members have
          received prestigious honors for their research contributions, academic excellence, and innovative work
          in signal processing, machine learning, and computational imaging.
        </p>
      </div>
      <article>
        <RecognitionList items={items} />
      </article>
    </div>
  );
}
