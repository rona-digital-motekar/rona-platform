"use client";

import { useMemo, useState } from "react";
import { Download, Eye, EyeOff, Trash2 } from "lucide-react";
import { useOperator } from "@/lib/operator-context";

export default function OperatorRsvpsPage() {
  const { rsvps, invitations, toggleRsvpApproval, deleteRsvp, isLoading } =
    useOperator();
  const [slugFilter, setSlugFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return rsvps.filter((r) => {
      const matchSlug = slugFilter === "ALL" || r.invitationSlug === slugFilter;
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSlug && matchStatus;
    });
  }, [rsvps, slugFilter, statusFilter]);

  const attendingTotal = useMemo(
    () =>
      filtered
        .filter((r) => r.status === "hadir")
        .reduce((sum, r) => sum + (r.guestCount || 1), 0),
    [filtered]
  );

  function exportCsv() {
    const header = ["Nama Tamu", "Undangan", "Status", "Jumlah Tamu", "Ucapan", "Waktu"];
    const rows = filtered.map((r) => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      r.invitationSlug,
      r.status,
      String(r.guestCount),
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.createdAt,
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rona-rsvp-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="operator-content">
      <div className="operator-page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            Buku Tamu &amp; Kehadiran
          </p>
          <h1 className="operator-page-title">RSVP &amp; Ucapan Tamu</h1>
          <p className="operator-page-subtitle">
            Setiap konfirmasi dan doa yang dikirim tamu di halaman undangan publik masuk ke
            daftar ini untuk dimoderasi atau diekspor.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="operator-btn operator-btn-secondary"
          disabled={filtered.length === 0}
        >
          <Download size={15} aria-hidden="true" />
          <span>Unduh CSV</span>
        </button>
      </div>

      {/* Filters & Summary */}
      <div className="operator-filter-bar">
        <div className="op-filter-controls">
          <select
            value={slugFilter}
            onChange={(e) => setSlugFilter(e.target.value)}
            className="operator-form-select"
            aria-label="Filter undangan"
          >
            <option value="ALL">Semua Pasangan</option>
            {invitations.map((inv) => (
              <option key={inv.slug} value={inv.slug}>
                {inv.coupleNames} (/i/{inv.slug})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="operator-form-select"
            aria-label="Filter status kehadiran"
          >
            <option value="ALL">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="berhalangan">Berhalangan</option>
          </select>
        </div>

        <div className="op-rsvp-summary tabular-nums">
          <span>{filtered.length} Entri</span>
          <span aria-hidden="true">·</span>
          <span>{attendingTotal} Total Tamu Hadir</span>
        </div>
      </div>

      <section className="operator-card">
        {isLoading ? (
          <div className="op-empty-state">Memuat data RSVP...</div>
        ) : filtered.length === 0 ? (
          <div className="op-empty-state">
            Belum ada data RSVP yang cocok dengan filter saat ini.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="op-table">
              <thead>
                <tr>
                  <th>Nama Tamu</th>
                  <th>Undangan</th>
                  <th>Kehadiran</th>
                  <th style={{ textAlign: "right" }}>Jumlah</th>
                  <th>Ucapan &amp; Doa</th>
                  <th>Tampil Publik</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.guestName}</strong>
                    </td>
                    <td>
                      <code className="operator-template-slug">/i/{item.invitationSlug}</code>
                    </td>
                    <td>
                      <span
                        className={`op-status-text ${
                          item.status === "hadir" ? "is-published" : "is-draft"
                        }`}
                      >
                        {item.status === "hadir" ? "Hadir" : "Berhalangan"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }} className="tabular-nums">
                      {item.guestCount}
                    </td>
                    <td style={{ maxWidth: "340px" }}>
                      {item.message || <span className="op-table-sub">—</span>}
                    </td>
                    <td>{item.approved ? "Tampil" : "Disembunyikan"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="op-row-actions">
                        <button
                          type="button"
                          onClick={() => toggleRsvpApproval(item.id, !item.approved)}
                          className="operator-btn operator-btn-secondary operator-btn-sm"
                          title={item.approved ? "Sembunyikan dari halaman publik" : "Tampilkan di publik"}
                        >
                          {item.approved ? (
                            <EyeOff size={13} aria-hidden="true" />
                          ) : (
                            <Eye size={13} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRsvp(item.id)}
                          className="operator-btn operator-btn-danger operator-btn-sm"
                          aria-label={`Hapus ucapan dari ${item.guestName}`}
                        >
                          <Trash2 size={13} aria-hidden="true" />
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
    </div>
  );
}
