"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  HeartHandshake,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareHeart,
  Palette,
  X,
} from "lucide-react";
import { useOperator } from "@/lib/operator-context";

export default function OperatorNav() {
  const pathname = usePathname();
  const { logout, templates, rsvps } = useOperator();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/operator") return pathname === "/operator";
    return pathname.startsWith(path);
  };

  const navLinks = [
    { label: "Ringkasan", href: "/operator", Icon: LayoutDashboard },
    { label: "Studio Desain", href: "/operator/studio", Icon: Palette },
    {
      label: `Katalog Template (${templates.length})`,
      href: "/operator/templates",
      Icon: Layers,
    },
    {
      label: "Pasangan & Acara",
      href: "/operator/invitations",
      Icon: HeartHandshake,
    },
    {
      label: `RSVP & Ucapan (${rsvps.length})`,
      href: "/operator/rsvps",
      Icon: MessageSquareHeart,
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="operator-topbar">
        <div className="operator-topbar-left">
          <button
            type="button"
            className="operator-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu operator"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <div className="operator-brand-title">
            RONA<span>®</span> <span className="op-brand-sub">Studio</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/"
            className="operator-btn operator-btn-secondary operator-btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Lihat Web Publik</span>
            <ExternalLink size={13} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="operator-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`operator-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="operator-brand-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="operator-brand-title">
              RONA<span>®</span>
            </div>
            <button
              type="button"
              className="op-sidebar-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <span className="operator-brand-tag">Operator Studio Workspace</span>
        </div>

        <nav className="operator-nav" aria-label="Menu Operator">
          <div className="operator-nav-section-title">Menu Utama</div>
          {navLinks.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`operator-nav-item ${isActive(href) ? "active" : ""}`}
            >
              <Icon size={16} className="operator-nav-icon" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}

          <div className="operator-nav-section-title" style={{ marginTop: "20px" }}>
            Halaman Publik
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="operator-nav-item"
          >
            <ExternalLink size={15} className="operator-nav-icon" aria-hidden="true" />
            <span>Landing Page Katalog</span>
          </Link>
        </nav>

        <div className="operator-sidebar-footer">
          <p className="op-footer-meta">
            Penyimpanan: Server JSON Persisten
            <br />
            Siap migrasi ke PostgreSQL kapan saja
          </p>
          <button
            type="button"
            onClick={logout}
            className="op-logout-btn"
          >
            <LogOut size={14} aria-hidden="true" />
            <span>Kunci &amp; Keluar Studio</span>
          </button>
        </div>
      </aside>
    </>
  );
}
