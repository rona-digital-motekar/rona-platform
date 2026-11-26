"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { TemplateItem } from "./templates";
import type { InvitationData, RsvpEntry } from "./invitations";

type ApiResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

type OperatorContextType = {
  // Auth state
  authLoading: boolean;
  authenticated: boolean;
  setupRequired: boolean;
  envConfigured: boolean;
  login: (passcode: string) => Promise<ApiResult>;
  setupPin: (passcode: string) => Promise<ApiResult>;
  logout: () => Promise<void>;

  // Data state
  templates: TemplateItem[];
  invitations: InvitationData[];
  rsvps: RsvpEntry[];
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Template mutations
  addTemplate: (
    template: Partial<TemplateItem> & { name: string; slug: string; demoCoupleNames?: string }
  ) => Promise<ApiResult<TemplateItem>>;
  updateTemplate: (
    id: string,
    updates: Partial<TemplateItem>
  ) => Promise<ApiResult<TemplateItem>>;
  toggleStatus: (id: string) => Promise<ApiResult<TemplateItem>>;
  deleteTemplate: (id: string) => Promise<ApiResult>;

  // Invitation / Couple mutations
  saveInvitation: (data: Partial<InvitationData>) => Promise<ApiResult<InvitationData>>;
  deleteInvitation: (slug: string) => Promise<ApiResult>;

  // RSVP mutations
  toggleRsvpApproval: (id: string, approved: boolean) => Promise<ApiResult>;
  deleteRsvp: (id: string) => Promise<ApiResult>;

  // Uploads & AI
  uploadArtwork: (file: File) => Promise<ApiResult<string>>;
  generateAiDesign: (prompt: string) => Promise<ApiResult<Record<string, unknown>>>;
};

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export function OperatorProvider({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [envConfigured, setEnvConfigured] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const buildHeaders = useCallback(
    (includeJson = true): HeadersInit => {
      const headers: Record<string, string> = {
        "X-Requested-With": "RonaOperatorStudio",
      };
      if (includeJson) {
        headers["Content-Type"] = "application/json";
      }
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      return headers;
    },
    [authToken]
  );

  const fetchAllWorkspaceData = useCallback(
    async (overrideToken?: string | null) => {
      setIsLoading(true);
      try {
        const headers: Record<string, string> = {
          "X-Requested-With": "RonaOperatorStudio",
        };
        const tokenToUse = overrideToken ?? authToken;
        if (tokenToUse) {
          headers["Authorization"] = `Bearer ${tokenToUse}`;
        }

        const res = await fetch("/api/templates?scope=all", {
          headers,
          cache: "no-store",
        });
        if (res.status === 401) {
          setAuthenticated(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setTemplates(Array.isArray(data.templates) ? data.templates : []);
          const invRecord = data.invitations || {};
          setInvitations(Object.values(invRecord));
          setRsvps(Array.isArray(data.rsvps) ? data.rsvps : []);
        }
      } catch {
        // handled by UI states
      } finally {
        setIsLoading(false);
      }
    },
    [authToken]
  );

  // Check session on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/operator/auth", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        setAuthenticated(Boolean(data.authenticated));
        setSetupRequired(Boolean(data.setupRequired));
        setEnvConfigured(Boolean(data.envConfigured));
        if (data.authenticated) {
          await fetchAllWorkspaceData(null);
        }
      } catch {
        if (active) setAuthenticated(false);
      } finally {
        if (active) setAuthLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchAllWorkspaceData]);

  const login = useCallback(
    async (passcode: string): Promise<ApiResult> => {
      try {
        const res = await fetch("/api/operator/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "RonaOperatorStudio",
          },
          body: JSON.stringify({ action: "login", passcode }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.setupRequired) setSetupRequired(true);
          return { success: false, error: data.error || "Login gagal." };
        }
        const token = data.token || null;
        setAuthToken(token);
        setAuthenticated(true);
        setSetupRequired(false);
        await fetchAllWorkspaceData(token);
        return { success: true };
      } catch {
        return { success: false, error: "Gagal terhubung ke server." };
      }
    },
    [fetchAllWorkspaceData]
  );

  const setupPin = useCallback(
    async (passcode: string): Promise<ApiResult> => {
      try {
        const res = await fetch("/api/operator/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "RonaOperatorStudio",
          },
          body: JSON.stringify({ action: "setup", passcode }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Aktivasi PIN gagal." };
        }
        const token = data.token || null;
        setAuthToken(token);
        setAuthenticated(true);
        setSetupRequired(false);
        await fetchAllWorkspaceData(token);
        return { success: true };
      } catch {
        return { success: false, error: "Gagal terhubung ke server." };
      }
    },
    [fetchAllWorkspaceData]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/operator/auth", {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // ignore
    }
    setAuthToken(null);
    setAuthenticated(false);
  }, [buildHeaders]);

  const addTemplate = useCallback(
    async (
      payload: Partial<TemplateItem> & { name: string; slug: string; demoCoupleNames?: string }
    ): Promise<ApiResult<TemplateItem>> => {
      try {
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: buildHeaders(true),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal menambah template." };
        }
        await fetchAllWorkspaceData();
        return { success: true, data: data.template };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const updateTemplate = useCallback(
    async (id: string, updates: Partial<TemplateItem>): Promise<ApiResult<TemplateItem>> => {
      try {
        const res = await fetch(`/api/templates/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: buildHeaders(true),
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal memperbarui template." };
        }
        await fetchAllWorkspaceData();
        return { success: true, data: data.template };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const toggleStatus = useCallback(
    async (id: string): Promise<ApiResult<TemplateItem>> => {
      const target = templates.find((t) => t.id === id);
      if (!target) return { success: false, error: "Template tidak ditemukan." };
      const nextStatus = target.status === "published" ? "draft" : "published";
      return updateTemplate(id, { status: nextStatus });
    },
    [templates, updateTemplate]
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<ApiResult> => {
      try {
        const res = await fetch(`/api/templates/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: buildHeaders(false),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal menghapus template." };
        }
        await fetchAllWorkspaceData();
        return { success: true };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const saveInvitation = useCallback(
    async (payload: Partial<InvitationData>): Promise<ApiResult<InvitationData>> => {
      try {
        const res = await fetch("/api/invitations", {
          method: "POST",
          headers: buildHeaders(true),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal menyimpan data pasangan." };
        }
        await fetchAllWorkspaceData();
        return { success: true, data: data.invitation };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const deleteInvitation = useCallback(
    async (slug: string): Promise<ApiResult> => {
      try {
        const res = await fetch(`/api/invitations?slug=${encodeURIComponent(slug)}`, {
          method: "DELETE",
          headers: buildHeaders(false),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal menghapus undangan." };
        }
        await fetchAllWorkspaceData();
        return { success: true };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const toggleRsvpApproval = useCallback(
    async (id: string, approved: boolean): Promise<ApiResult> => {
      try {
        const res = await fetch("/api/rsvps", {
          method: "PATCH",
          headers: buildHeaders(true),
          body: JSON.stringify({ id, approved }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal memperbarui RSVP." };
        }
        await fetchAllWorkspaceData();
        return { success: true };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const deleteRsvp = useCallback(
    async (id: string): Promise<ApiResult> => {
      try {
        const res = await fetch(`/api/rsvps?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: buildHeaders(false),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal menghapus RSVP." };
        }
        await fetchAllWorkspaceData();
        return { success: true };
      } catch {
        return { success: false, error: "Gagal menghubungi server." };
      }
    },
    [buildHeaders, fetchAllWorkspaceData]
  );

  const uploadArtwork = useCallback(
    async (file: File): Promise<ApiResult<string>> => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/uploads", {
          method: "POST",
          headers: buildHeaders(false),
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal mengunggah gambar." };
        }
        return { success: true, data: data.url };
      } catch {
        return { success: false, error: "Gagal mengunggah berkas ke server." };
      }
    },
    [buildHeaders]
  );

  const generateAiDesign = useCallback(
    async (prompt: string): Promise<ApiResult<Record<string, unknown>>> => {
      try {
        const res = await fetch("/api/operator/ai-design", {
          method: "POST",
          headers: buildHeaders(true),
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal menghasilkan desain AI." };
        }
        return { success: true, data: data.blueprint };
      } catch {
        return { success: false, error: "Gagal menghubungi layanan AI." };
      }
    },
    [buildHeaders]
  );

  return (
    <OperatorContext.Provider
      value={{
        authLoading,
        authenticated,
        setupRequired,
        envConfigured,
        login,
        setupPin,
        logout,
        templates,
        invitations,
        rsvps,
        isLoading,
        refreshData: () => fetchAllWorkspaceData(null),
        addTemplate,
        updateTemplate,
        toggleStatus,
        deleteTemplate,
        saveInvitation,
        deleteInvitation,
        toggleRsvpApproval,
        deleteRsvp,
        uploadArtwork,
        generateAiDesign,
      }}
    >
      {children}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  const ctx = useContext(OperatorContext);
  if (!ctx) {
    throw new Error("useOperator harus digunakan di dalam OperatorProvider");
  }
  return ctx;
}
