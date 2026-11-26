import { notFound } from "next/navigation";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";
import { getInvitationPageBundle } from "@/lib/server/store";

export const dynamic = "force-dynamic";

type InvitationPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;
  const bundle = await getInvitationPageBundle(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <TemplateDispatcher
      invitation={bundle.invitation}
      template={bundle.template}
      initialRsvps={bundle.rsvps}
    />
  );
}
