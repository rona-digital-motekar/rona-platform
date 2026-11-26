import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  INITIAL_TEMPLATES,
  normalizeTemplateItem,
  type TemplateItem,
} from "@/lib/templates";
import {
  INITIAL_INVITATIONS,
  INITIAL_RSVPS,
  type InvitationData,
  type RsvpEntry,
} from "@/lib/invitations";

export type RonaStoreData = {
  version: number;
  templates: TemplateItem[];
  invitations: Record<string, InvitationData>;
  rsvps: RsvpEntry[];
  auth: {
    passcodeHash: string | null;
    claimedAt: string | null;
  };
};

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.resolve(DATA_DIR, "rona-store.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function createSeedStore(): RonaStoreData {
  return {
    version: 1,
    templates: INITIAL_TEMPLATES.map((t) => normalizeTemplateItem(t)),
    invitations: { ...INITIAL_INVITATIONS },
    rsvps: [...INITIAL_RSVPS],
    auth: {
      passcodeHash: null,
      claimedAt: null,
    },
  };
}

async function writeStoreAtomic(data: RonaStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = path.resolve(
    DATA_DIR,
    `rona-store.${crypto.randomBytes(6).toString("hex")}.tmp`
  );
  await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmpFile, STORE_PATH);
}

export async function readStore(): Promise<RonaStoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<RonaStoreData>;
    const seed = createSeedStore();

    const templates =
      Array.isArray(parsed.templates) && parsed.templates.length > 0
        ? parsed.templates.map((t) => normalizeTemplateItem(t))
        : seed.templates;

    const invitations =
      parsed.invitations && typeof parsed.invitations === "object"
        ? { ...seed.invitations, ...parsed.invitations }
        : seed.invitations;

    const rsvps = Array.isArray(parsed.rsvps) ? parsed.rsvps : seed.rsvps;

    const auth = parsed.auth || { passcodeHash: null, claimedAt: null };

    return {
      version: parsed.version ?? 1,
      templates,
      invitations,
      rsvps,
      auth,
    };
  } catch {
    const seed = createSeedStore();
    await writeStoreAtomic(seed);
    return seed;
  }
}

export async function mutateStore<T>(
  mutator: (current: RonaStoreData) => Promise<{ next: RonaStoreData; result: T }> | { next: RonaStoreData; result: T }
): Promise<T> {
  const task = writeQueue.then(async () => {
    const current = await readStore();
    const { next, result } = await mutator(current);
    await writeStoreAtomic(next);
    return result;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}

export async function getPublicCatalogData() {
  const store = await readStore();
  const publishedTemplates = store.templates.filter((t) => t.status === "published");
  return {
    templates: publishedTemplates,
    invitations: store.invitations,
    rsvpCount: store.rsvps.filter((r) => r.approved).length,
  };
}

export async function getInvitationPageBundle(slug: string) {
  const store = await readStore();
  const invitation = store.invitations[slug] ?? null;
  if (!invitation) return null;

  const template =
    store.templates.find(
      (t) =>
        (invitation.templateId && t.id === invitation.templateId) ||
        t.slug === invitation.templateSlug
    ) ||
    store.templates[0] ||
    normalizeTemplateItem(INITIAL_TEMPLATES[0]);

  const rsvps = store.rsvps.filter(
    (r) => r.invitationSlug === slug && r.approved
  );

  return {
    invitation,
    template,
    rsvps,
  };
}
