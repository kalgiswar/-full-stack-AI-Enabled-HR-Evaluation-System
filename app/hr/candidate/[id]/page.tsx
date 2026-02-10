import CandidateDetailView from "@/HR/components/CandidateDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatePage({ params }: PageProps) {
  const { id } = await params;

  return <CandidateDetailView candidateId={id} />;
}
