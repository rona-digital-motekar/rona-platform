"use client";

import InvitationExperience from "@/components/InvitationExperience";
import StorybookCinematicTemplate from "@/components/templates/StorybookCinematicTemplate";
import Atelier3DTemplate from "@/components/templates/Atelier3DTemplate";
import type { InvitationData, RsvpEntry } from "@/lib/invitations";
import { INITIAL_TEMPLATES, normalizeTemplateItem, type TemplateItem } from "@/lib/templates";

type TemplateDispatcherProps = {
  invitation: InvitationData;
  template?: TemplateItem;
  initialRsvps?: RsvpEntry[];
  previewMode?: boolean;
};

export default function TemplateDispatcher({
  invitation,
  template,
  initialRsvps = [],
  previewMode = false,
}: TemplateDispatcherProps) {
  const resolvedTemplate =
    template ||
    normalizeTemplateItem(
      INITIAL_TEMPLATES.find((t) => t.slug === invitation.templateSlug) || INITIAL_TEMPLATES[0]
    );

  const engine = resolvedTemplate.designConfig?.engine;

  if (engine === "atelier-3d") {
    return (
      <Atelier3DTemplate
        invitation={invitation}
        template={resolvedTemplate}
        initialRsvps={initialRsvps}
        previewMode={previewMode}
      />
    );
  }

  if (
    engine === "storybook-cinematic" ||
    invitation.templateSlug === "rona-storybook-cinematic"
  ) {
    return (
      <StorybookCinematicTemplate
        invitation={invitation}
        template={resolvedTemplate}
        initialRsvps={initialRsvps}
        previewMode={previewMode}
      />
    );
  }

  return (
    <InvitationExperience
      invitation={invitation}
      template={resolvedTemplate}
      initialRsvps={initialRsvps}
      previewMode={previewMode}
    />
  );
}
