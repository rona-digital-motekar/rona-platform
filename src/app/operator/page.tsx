"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Layers,
  MessageSquareHeart,
  Palette,
  Plus,
  Users,
} from "lucide-react";
import { useOperator } from "@/lib/operator-context";

export default function OperatorDashboardPage() {
  const { templates, invitations, rsvps, toggleStatus, isLoading } =
    useOperator();

  const publishedCount = templates.filter((t) => t.status === "published").length;
  const draftCount = templates.filter((t) => t.status === "draft").length;
  const attendingGuests = rsvps
    .filter((r) => r.status === "hadir")
    .reduce((acc, r) => acc + (r.guestCount || 1), 0);

  return (
    <div className="operator-content">
      <div className="operator-page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            Ringkasan Studio
          </p>
          <h1 className="operator-page-title">Pusat Kendali Rona Platform</h1>
          <p className="operator-page-subtitle">
            Kelola rancangan template 3D/2.5D, kelola data pasangan, dan pantau konfirmasi
            kehadiran tamu secara langsung dari satu workspace.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/operator/studio" className="operator-btn operator-btn-primary">
            <Palette size={15} aria-hidden="true" />
            <span>Buka Studio Desain</span>
          </Link>
          <Link href="/operator/invitations" className="operator-btn operator-btn-secondary">
            <Plus size={15} aria-hidden="true" />
            <span>Kelola Pasangan</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Tabular Numerals) */}
      <section className="operator-stat-grid" aria-label="Metrik platform">
        <div className="operator-stat-card stat-primary">
          <span className="operator-stat-label">Template Terbit (Live)</span>
          <div className="operator-stat-num tabular-nums">
            {isLoading ? "—" : publishedCount}
          </div>
          <span className="operator-stat-detail">
            Dari {templates.length} total desain di katalog
          </span>
        </div>

        <div className="operator-stat-card stat-draft">
          <span className="operator-stat-label">Konsep Draft</span>
          <div className="operator-stat-num tabular-nums">
            {isLoading ? "—" : draftCount}
          </div>
          <span className="operator-stat-detail">Belum tampil di Landing Page publik</span>
        </div>

        <div className="operator-stat-card stat-published">
          <span className="operator-stat-label">Undangan Pasangan</span>
          <div className="operator-stat-num tabular-nums">
            {isLoading ? "—" : invitations.length}
          </div>
          <span className="operator-stat-detail">Rute aktif /i/[slug] siap dibagikan</span>
        </div>

        <div className="operator-stat-card stat-demo">
          <span className="operator-stat-label">Konfirmasi RSVP &amp; Doa</span>
          <div className="operator-stat-num tabular-nums">
            {isLoading ? "—" : rsvps.length}
          </div>
          <span className="operator-stat-detail">
            Total {attendingGuests} tamu mengonfirmasi hadir
          </span>
        </div>
      </section>

      {/* Active Templates Table */}
      <section className="operator-card">
        <div className="op-section-head">
          <div>
            <h2>Katalog Template &amp; Sinkronisasi Publik</h2>
            <p>
              Template berstatus <strong>Published</strong> langsung tampil di Landing Page dan
              panggung hero 3D.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/operator/studio"
              className="operator-btn operator-btn-primary operator-btn-sm"
            >
              <Palette size={14} aria-hidden="true" />
              <span>Rancang Template Baru</span>
            </Link>
            <Link
              href="/operator/templates"
              className="operator-btn operator-btn-secondary operator-btn-sm"
            >
              <Layers size={14} aria-hidden="true" />
              <span>Semua Template</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="op-empty-state">Memuat data katalog dari server...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="op-table">
              <thead>
                <tr>
                  <th>Desain Template</th>
                  <th>Engine Visual</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Rute Demo Live</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id}>
                    <td>
                      <div className="op-table-title-cell">
                        <span
                          className="op-color-dot"
                          style={{
                            background: tpl.theme.background,
                            borderColor: tpl.theme.highlight,
                          }}
                        />
                        <div>
                          <strong>{tpl.name}</strong>
                          <span className="op-table-sub">{tpl.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="op-table-sub">
                        {tpl.designConfig?.engine === "atelier-3d"
                          ? "Atelier 3D WebGL"
                          : tpl.designConfig?.engine === "storybook-cinematic"
                          ? "Storybook Cinematic"
                          : "Editorial 2.5D"}
                      </span>
                    </td>
                    <td>{tpl.category}</td>
                    <td>
                      <span
                        className={`op-status-text ${
                          tpl.status === "published" ? "is-published" : "is-draft"
                        }`}
                      >
                        {tpl.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={tpl.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="op-inline-link"
                      >
                        <span>{tpl.demoUrl}</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="op-row-actions">
                        <Link
                          href={`/operator/studio?id=${encodeURIComponent(tpl.id)}`}
                          className="operator-btn operator-btn-secondary operator-btn-sm"
                        >
                          Edit di Studio
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleStatus(tpl.id)}
                          className="operator-btn operator-btn-secondary operator-btn-sm"
                        >
                          {tpl.status === "published" ? "Jadikan Draft" : "Terbitkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bottom 2-Column Split: Couples + Recent RSVPs */}
      <div className="op-overview-split">
        <section className="operator-card">
          <div className="op-section-head">
            <div>
              <h2>Pasangan Aktif</h2>
              <p>Tautan undangan klien &amp; demo.</p>
            </div>
            <Link
              href="/operator/invitations"
              className="operator-btn operator-btn-secondary operator-btn-sm"
            >
              <Users size={14} aria-hidden="true" />
              <span>Kelola</span>
            </Link>
          </div>
          <div className="op-compact-list">
            {invitations.slice(0, 5).map((inv) => (
              <div key={inv.slug} className="op-compact-row">
                <div>
                  <strong>{inv.coupleNames}</strong>
                  <span>
                    {inv.eventDate} · Template {inv.templateSlug}
                  </span>
                </div>
                <Link
                  href={`/i/${inv.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="op-inline-link"
                >
                  <span>/i/{inv.slug}</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="operator-card">
          <div className="op-section-head">
            <div>
              <h2>Ucapan &amp; RSVP Terbaru</h2>
              <p>Kiriman langsung dari halaman undangan.</p>
            </div>
            <Link
              href="/operator/rsvps"
              className="operator-btn operator-btn-secondary operator-btn-sm"
            >
              <MessageSquareHeart size={14} aria-hidden="true" />
              <span>Lihat Semua</span>
            </Link>
          </div>
          {rsvps.length === 0 ? (
            <div className="op-empty-state">Belum ada konfirmasi tamu masuk.</div>
          ) : (
            <div className="op-compact-list">
              {rsvps.slice(0, 4).map((item) => (
                <div key={item.id} className="op-compact-row">
                  <div>
                    <strong>
                      {item.guestName} ({item.status === "hadir" ? `Hadir ${item.guestCount}` : "Berhalangan"})
                    </strong>
                    <span>
                      /{item.invitationSlug}
                      {item.message ? ` · “${item.message}”` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
