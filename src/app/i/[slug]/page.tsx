import { notFound } from "next/navigation";
import InvitationExperience from "@/components/InvitationExperience";
import { invitations } from "@/lib/invitations";

type InvitationPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(invitations).map((slug) => ({ slug }));
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;
  const invitation = invitations[slug];

  if (!invitation) notFound();

  return <InvitationExperience invitation={invitation} />;
}
