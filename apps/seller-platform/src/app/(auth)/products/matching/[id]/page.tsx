import MatchingResultsDetails from "./components/MatchingResultsDetails";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchingResultsDetails id={id} />;
}
