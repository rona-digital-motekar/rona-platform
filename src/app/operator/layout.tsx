import type { Metadata } from "next";
import { OperatorProvider } from "@/lib/operator-context";
import OperatorAuthGate from "@/components/operator/OperatorAuthGate";
import OperatorNav from "@/components/operator/OperatorNav";

export const metadata: Metadata = {
  title: "Operator Studio | Rona Digital Motekar",
  description:
    "Workspace operator terpadu untuk merancang template undangan 2.5D/3D, mengelola pasangan, dan memantau RSVP tamu.",
};

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OperatorProvider>
      <OperatorAuthGate>
        <div className="operator-shell">
          <OperatorNav />
          <main className="operator-main">{children}</main>
        </div>
      </OperatorAuthGate>
    </OperatorProvider>
  );
}
