import FeedbackForm from "./FeedbackForm";

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { memberId } = await params;
  const { name } = await searchParams;

  return <FeedbackForm memberId={memberId} name={name} />;
}
