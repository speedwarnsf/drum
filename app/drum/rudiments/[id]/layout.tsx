import { Metadata } from "next";
import { ESSENTIAL_RUDIMENTS } from "../../_lib/rudimentLibrary";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rudiment = ESSENTIAL_RUDIMENTS[id];

  if (!rudiment) {
    return { title: "Rudiment Not Found — RepoDrum" };
  }

  const title = `${rudiment.name} — RepoDrum`;
  const description = `${rudiment.name}: ${rudiment.pattern.stickingPattern} | ${rudiment.pattern.description}. Practice at ${rudiment.pattern.suggestedTempo.target} BPM with notation, metronome, and tracking.`;
  const url = `https://repodrum.com/drum/rudiments/${id}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "RepoDrum",
      images: [{ url: "https://repodrum.com/media/repodrumlogo.gif" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["https://repodrum.com/media/repodrumlogo.gif"],
    },
  };
}

export default function RudimentDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
