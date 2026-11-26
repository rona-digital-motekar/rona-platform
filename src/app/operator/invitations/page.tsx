"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useOperator } from "@/lib/operator-context";
import type { InvitationData } from "@/lib/invitations";

export default function OperatorInvitationsPage() {
  const {
    invitations,
    templates,
    saveInvitation,
    deleteInvitation,
    isLoading,
  } = useOperator();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [slug, setSlug] = useState("");
  const [firstNameA, setFirstNameA] = useState("");
  const [firstNameB, setFirstNameB] = useState("");
  const [parentNamesA, setParentNamesA] = useState("");
  const [parentNamesB, setParentNamesB] = useState("");
  const [templateSlug, setTemplateSlug] = useState(
    templates[0]?.slug || "rona-atelier-royal-3d"
  );
  const [eventDate, setEventDate] = useState("Sabtu, 20 Februari 2027");
  const [greeting, setGreeting] = useState(
    "Dengan penuh rasa syukur, kami mengundang kehadiran Anda"
  );
  const [quote, setQuote] = useState(
    "Dua hati yang saling memilih untuk melangkah bersama selamanya."
  );
  const [akadTime, setAkadTime] = useState("08.30 – 10.00 WIB");
  const [akadVenue, setAkadVenue] = useState("Pendopo Utama");
  const [akadAddress, setAkadAddress] = useState("Bandung, Jawa Barat");
  const [receptionTime, setReceptionTime] = useState("11.30 – 14.30 WIB");
  const [receptionVenue, setReceptionVenue] = useState("Taman Resepsi");
  const [receptionAddress, setReceptionAddress] = useState("Bandung, Jawa Barat");
  const [bankName, setBankName] = useState("Bank BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  function openCreate() {
    setSlug("");
    setFirstNameA("");
    setFirstNameB("");
    setParentNamesA("");
    setParentNamesB("");
    setTemplateSlug(templates[0]?.slug || "rona-atelier-royal-3d");
    setEventDate("Sabtu, 20 Februari 2027");
    setGreeting("Dengan penuh rasa syukur, kami mengundang kehadiran Anda");
    setQuote("Dua hati yang saling memilih untuk melangkah bersama selamanya.");
    setAkadTime("08.30 – 10.00 WIB");
    setAkadVenue("Pendopo Utama");
    setAkadAddress("Bandung, Jawa Barat");
    setReceptionTime("11.30 – 14.30 WIB");
    setReceptionVenue("Taman Resepsi");
    setReceptionAddress("Bandung, Jawa Barat");
    setBankName("Bank BCA");
    setAccountNumber("7770492184");
    setAccountHolder("");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEdit(inv: InvitationData) {
    setSlug(inv.slug);
    setFirstNameA(inv.firstNameA);
    setFirstNameB(inv.firstNameB);
    setParentNamesA(inv.parentNamesA || "");
    setParentNamesB(inv.parentNamesB || "");
    setTemplateSlug(inv.templateSlug);
    setEventDate(inv.eventDate);
    setGreeting(inv.greeting);
    setQuote(inv.quote);
    setAkadTime(inv.akad.timeLabel);
    setAkadVenue(inv.akad.venue);
    setAkadAddress(inv.akad.address);
    setReceptionTime(inv.reception.timeLabel);
    setReceptionVenue(inv.reception.venue);
    setReceptionAddress(inv.reception.address);
    setBankName(inv.giftAccounts?.[0]?.bankName || "Bank BCA");
    setAccountNumber(inv.giftAccounts?.[0]?.accountNumber || "");
    setAccountHolder(inv.giftAccounts?.[0]?.accountHolder || inv.firstNameA);
    setFormError(null);
    setIsModalOpen(true);
  }

  function handleAutoSlug(a: string, b: string) {
    setFirstNameA(a);
    setFirstNameB(b);
    if (!slug || slug === `${firstNameA}-${firstNameB}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-")) {
      const next = `${a}-${b}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(next);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const chosenTpl = templates.find((t) => t.slug === templateSlug);

    setSaving(true);
    const res = await saveInvitation({
      slug: slug.trim(),
      firstNameA: firstNameA.trim(),
      firstNameB: firstNameB.trim(),
      coupleNames: `${firstNameA.trim()} & ${firstNameB.trim()}`,
      parentNamesA: parentNamesA.trim(),
      parentNamesB: parentNamesB.trim(),
      templateId: chosenTpl?.id,
      templateSlug: chosenTpl?.slug || templateSlug,
      eventDate: eventDate.trim(),
      greeting: greeting.trim(),
      quote: quote.trim(),
      akad: {
        title: "Akad Nikah",
        dateLabel: eventDate.trim(),
        timeLabel: akadTime.trim(),
        venue: akadVenue.trim(),
        address: akadAddress.trim(),
      },
      reception: {
        title: "Resepsi",
        dateLabel: eventDate.trim(),
        timeLabel: receptionTime.trim(),
        venue: receptionVenue.trim(),
        address: receptionAddress.trim(),
      },
      giftAccounts: accountNumber.trim()
        ? [
            {
              bankName: bankName.trim() || "Bank BCA",
              accountNumber: accountNumber.trim(),
              accountHolder: accountHolder.trim() || firstNameA.trim(),
            },
          ]
        : [],
    });
    setSaving(false);

    if (!res.success) {
      setFormError(res.error || "Gagal menyimpan undangan pasangan.");
      return;
    }
    setIsModalOpen(false);
  }

  function copyLink(targetSlug: string) {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/i/${targetSlug}`
        : `/i/${targetSlug}`;
    navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopiedSlug(targetSlug);
    window.setTimeout(() => setCopiedSlug(null), 2000);
  }

  return (
    <div className="operator-content">
      <div className="operator-page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            Manajemen Klien &amp; Acara
          </p>
          <h1 className="operator-page-title">Pasangan &amp; Rute Undangan</h1>
          <p className="operator-page-subtitle">
            Buat undangan khusus untuk setiap pasangan, pilih desain template yang dipakai,
            dan salin tautan unik untuk langsung dibagikan ke tamu.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="operator-btn operator-btn-primary"
        >
          <Plus size={15} aria-hidden="true" />
          <span>Tambah Pasangan Baru</span>
        </button>
      </div>

      <section className="operator-card">
        {isLoading ? (
          <div className="op-empty-state">Memuat daftar pasangan...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="op-table">
              <thead>
                <tr>
                  <th>Pasangan</th>
                  <th>Template Dipakai</th>
                  <th>Tanggal Acara</th>
                  <th>Rute Undangan</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.slug}>
                    <td>
                      <strong>{inv.coupleNames}</strong>
                      <span className="op-table-sub">{inv.akad.venue}</span>
                    </td>
                    <td>
                      <code className="operator-template-slug">{inv.templateSlug}</code>
                    </td>
                    <td>{inv.eventDate}</td>
                    <td>
                      <Link
                        href={`/i/${inv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="op-inline-link"
                      >
                        <span>/i/{inv.slug}</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="op-row-actions">
                        <button
                          type="button"
                          onClick={() => copyLink(inv.slug)}
                          className="operator-btn operator-btn-secondary operator-btn-sm"
                        >
                          {copiedSlug === inv.slug ? (
                            <>
                              <Check size={13} aria-hidden="true" /> Tersalin
                            </>
                          ) : (
                            <>
                              <Copy size={13} aria-hidden="true" /> Salin Link
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(inv)}
                          className="operator-btn operator-btn-secondary operator-btn-sm"
                        >
                          Edit
                        </button>
                        {confirmDeleteSlug === inv.slug ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteInvitation(inv.slug);
                              setConfirmDeleteSlug(null);
                            }}
                            className="operator-btn operator-btn-danger operator-btn-sm"
                          >
                            Hapus Ya
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSlug(inv.slug)}
                            className="operator-btn operator-btn-danger operator-btn-sm"
                            aria-label={`Hapus ${inv.coupleNames}`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="operator-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="operator-modal" onClick={(e) => e.stopPropagation()}>
            <div className="operator-modal-header">
              <h2 className="operator-modal-title">Data Pasangan &amp; Acara</h2>
              <button
                type="button"
                className="operator-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="operator-modal-body">
                {formError && <div className="op-auth-error">{formError}</div>}

                <div className="op-grid-2">
                  <div className="operator-form-group">
                    <label className="operator-form-label">Nama Panggilan Pria *</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={firstNameA}
                      onChange={(e) => handleAutoSlug(e.target.value, firstNameB)}
                      placeholder="Contoh: Reza"
                      required
                    />
                  </div>
                  <div className="operator-form-group">
                    <label className="operator-form-label">Nama Panggilan Wanita *</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={firstNameB}
                      onChange={(e) => handleAutoSlug(firstNameA, e.target.value)}
                      placeholder="Contoh: Tania"
                      required
                    />
                  </div>
                </div>

                <div className="op-grid-2">
                  <div className="operator-form-group">
                    <label className="operator-form-label">Slug URL Undangan (/i/...) *</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={slug}
                      onChange={(e) =>
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
                      }
                      placeholder="reza-tania"
                      required
                    />
                  </div>
                  <div className="operator-form-group">
                    <label className="operator-form-label">Pilih Template Desain *</label>
                    <select
                      className="operator-form-select"
                      value={templateSlug}
                      onChange={(e) => setTemplateSlug(e.target.value)}
                    >
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.slug}>
                          {tpl.name} ({tpl.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="op-grid-2">
                  <div className="operator-form-group">
                    <label className="operator-form-label">Orang Tua Mempelai Pria</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={parentNamesA}
                      onChange={(e) => setParentNamesA(e.target.value)}
                      placeholder="Putra dari Bpk. ... & Ibu ..."
                    />
                  </div>
                  <div className="operator-form-group">
                    <label className="operator-form-label">Orang Tua Mempelai Wanita</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={parentNamesB}
                      onChange={(e) => setParentNamesB(e.target.value)}
                      placeholder="Putri dari Bpk. ... & Ibu ..."
                    />
                  </div>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Tanggal Acara Utama *</label>
                  <input
                    type="text"
                    className="operator-form-input"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Kutipan / Doa Pembuka</label>
                  <textarea
                    className="operator-form-textarea"
                    rows={2}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                  />
                </div>

                <div className="op-grid-2">
                  <div className="operator-form-group">
                    <label className="operator-form-label">Lokasi &amp; Waktu Akad</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={akadVenue}
                      onChange={(e) => setAkadVenue(e.target.value)}
                      placeholder="Nama gedung/masjid"
                    />
                    <input
                      type="text"
                      className="operator-form-input"
                      style={{ marginTop: "6px" }}
                      value={akadTime}
                      onChange={(e) => setAkadTime(e.target.value)}
                      placeholder="08.00 – 10.00 WIB"
                    />
                    <input
                      type="text"
                      className="operator-form-input"
                      style={{ marginTop: "6px" }}
                      value={akadAddress}
                      onChange={(e) => setAkadAddress(e.target.value)}
                      placeholder="Alamat lengkap"
                    />
                  </div>

                  <div className="operator-form-group">
                    <label className="operator-form-label">Lokasi &amp; Waktu Resepsi</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={receptionVenue}
                      onChange={(e) => setReceptionVenue(e.target.value)}
                      placeholder="Nama ballroom/taman"
                    />
                    <input
                      type="text"
                      className="operator-form-input"
                      style={{ marginTop: "6px" }}
                      value={receptionTime}
                      onChange={(e) => setReceptionTime(e.target.value)}
                      placeholder="11.00 – 14.30 WIB"
                    />
                    <input
                      type="text"
                      className="operator-form-input"
                      style={{ marginTop: "6px" }}
                      value={receptionAddress}
                      onChange={(e) => setReceptionAddress(e.target.value)}
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>

                <div className="op-grid-3">
                  <div className="operator-form-group">
                    <label className="operator-form-label">Bank Amplop Digital</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="operator-form-group">
                    <label className="operator-form-label">Nomor Rekening</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="operator-form-group">
                    <label className="operator-form-label">Atas Nama</label>
                    <input
                      type="text"
                      className="operator-form-input"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="operator-modal-footer">
                <button
                  type="button"
                  className="operator-btn operator-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="operator-btn operator-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Undangan Pasangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
