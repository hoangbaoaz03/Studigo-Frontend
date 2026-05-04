import { LearningClient } from "@/components/LearningClient";

export default async function LearningPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return <LearningClient slug={params.slug} />;
}
