"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Gift,
  Heart,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import Invitation3DStage from "@/components/three/Invitation3DStage";
import type { InvitationData, RsvpEntry } from "@/lib/invitations";
import {
  FONT_PAIRING_MAP,
  type SectionBlockType,
  type TemplateItem,
} from "@/lib/templates";
import { resolveArtworkSource } from "@/lib/template-artworks";

type Atelier3DTemplateProps = {
  invitation: InvitationData;
  template: TemplateItem;
  initialRsvps?: RsvpEntry[];
  previewMode?: boolean;
};

export default function Atelier3DTemplate({
  invitation,
  template,
  initialRsvps = [],
  previewMode = false,
}: Atelier3DTemplateProps) {
  const sections = useMemo(() => {
    const visible = template.designConfig.sections.filter((s) => s.visible);
    if (visible.length === 0) {
      return [
        { id: "sec_cover", type: "cover" as SectionBlockType, label: "Sampul", visible: true },
      ];
    }
    return visible;
  }, [template.designConfig.sections]);

  const [step, setStep] = useState(0);
  const safeStep = Math.min(step, sections.length - 1);
  const currentSection = sections[safeStep];

  const [rsvps, setRsvps] = useState<RsvpEntry[]>(initialRsvps);
  const [guestName, setGuestName] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<"hadir" | "berhalangan">("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [explode3D, setExplode3D] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setStep(Math.max(0, Math.min(sections.length - 1, index)));
    },
    [sections.length]
  );

  const next = useCallback(() => goTo(safeStep + 1), [goTo, safeStep]);
  const prev = useCallback(() => goTo(safeStep - 1), [goTo, safeStep]);

  useEffect(() => {
    if (previewMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, previewMode]);

  function onTouchStart(e: TouchEvent<HTMLElement>) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
    touchStartY.current = e.changedTouches[0]?.clientY ?? null;
  }

  function onTouchEnd(e: TouchEvent<HTMLElement>) {
    const endX = e.changedTouches[0]?.clientX;
    const endY = e.changedTouches[0]?.clientY;
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      endX === undefined ||
      endY === undefined
    ) {
      return;
    }
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;
    if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  async function handleSubmitRsvp(e: React.FormEvent) {
    e.preventDefault();
    setRsvpFeedback(null);

    if (previewMode) {
      setRsvpFeedback("Mode pratinjau studio aktif. Konfirmasi tamu asli tersimpan di rute publik.");
      return;
    }

    if (guestName.trim().length < 2) {
      setRsvpFeedback("Mohon isi nama lengkap Anda terlebih dahulu.");
      return;
    }

    setRsvpLoading(true);
    try {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationSlug: invitation.slug,
          guestName: guestName.trim(),
          status: rsvpStatus,
          guestCount,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRsvpFeedback(data.error || "Gagal mengirim konfirmasi.");
      } else {
        setRsvps((prevList) => [data.rsvp, ...prevList]);
        setGuestName("");
        setMessage("");
        setRsvpFeedback("Terima kasih, konfirmasi kehadiran dan doa Anda telah tersimpan.");
      }
    } catch {
      setRsvpFeedback("Terjadi gangguan jaringan saat mengirim konfirmasi.");
    } finally {
      setRsvpLoading(false);
    }
  }

  function handleCopyAccount(accountNumber: string, bankName: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber).catch(() => undefined);
    }
    setCopiedBank(bankName);
    window.setTimeout(() => setCopiedBank(null), 2200);
  }

  const fontPair = FONT_PAIRING_MAP[template.designConfig.fontPairing] || FONT_PAIRING_MAP["playfair-dm"];
  const artwork = resolveArtworkSource(
    template.designConfig.artworkKey,
    template.slug,
    template.thumbnailClass
  );
  const sealText =
    template.designConfig.monogramSealText ||
    `${invitation.firstNameA.slice(0, 1)} · ${invitation.firstNameB.slice(0, 1)}`;

  const timelineData =
    invitation.storyTimeline && invitation.storyTimeline.length > 0
      ? invitation.storyTimeline
      : [
          {
            year: "2023",
            title: "Pertemuan Pertama",
            story: "Langkah awal perkenalan yang membawa kami hingga hari istimewa ini.",
          },
          {
            year: "2026",
            title: "Menuju Pelaminan",
            story: "Dengan restu orang tua, kami memulai perjalanan rumah tangga bersama.",
          },
        ];

  const galleryData =
    invitation.gallery && invitation.gallery.length > 0
      ? invitation.gallery
      : [
          { id: "g1", title: "Potret Awal", note: "Momen hangat penuh harapan" },
          { id: "g2", title: "Satu Langkah", note: "Menuju hari bahagia" },
        ];

  const giftAccounts =
    invitation.giftAccounts && invitation.giftAccounts.length > 0
      ? invitation.giftAccounts
      : [
          {
            bankName: "Bank BCA",
            accountNumber: "7770492184",
            accountHolder: invitation.firstNameA,
          },
        ];

  return (
    <main
      className={`atelier-shell texture-${template.designConfig.paperTexture}`}
      style={
        {
          "--at-bg": template.theme.background,
          "--at-deep": template.theme.deep,
          "--at-accent": template.theme.accent,
          "--at-gold": template.theme.highlight,
          "--at-soft": template.theme.soft,
          "--at-display": fontPair.displayCss,
          "--at-body": fontPair.bodyCss,
        } as React.CSSProperties
      }
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={`Undangan Digital ${invitation.coupleNames}`}
    >
      {/* Top Bar */}
      <header className="atelier-topbar">
        {previewMode ? (
          <span className="atelier-brand">
            RONA<span>®</span>
          </span>
        ) : (
          <Link href="/" className="atelier-brand">
            RONA<span>®</span>
          </Link>
        )}
        <span className="atelier-top-meta">{currentSection.label}</span>
        <span className="atelier-counter">
          {String(safeStep + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
        </span>
      </header>

      {/* Progress Line */}
      <div className="atelier-progress">
        <div
          className="atelier-progress-fill"
          style={{ width: `${((safeStep + 1) / sections.length) * 100}%` }}
        />
      </div>

      {/* Main Content Stage */}
      <div className="atelier-viewport">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={`${currentSection.id}-${safeStep}`}
            className="atelier-scene-card"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.985 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 1. COVER 3D / 2.5D */}
            {currentSection.type === "cover" && (
              <div className="atelier-cover-grid">
                <div className="atelier-cover-3d">
                  <Invitation3DStage
                    backgroundHex={template.theme.background}
                    deepHex={template.theme.deep}
                    accentHex={template.theme.accent}
                    highlightHex={template.theme.highlight}
                    softHex={template.theme.soft}
                    ornament3D={template.designConfig.ornament3D}
                    particles={template.designConfig.particles}
                    monogramText={sealText}
                    coupleNames={invitation.coupleNames}
                    eventDate={invitation.eventDate}
                    explode={explode3D}
                    height={previewMode ? 280 : 380}
                    onCardClick={() => setExplode3D((prevVal) => (prevVal > 0 ? 0 : 1))}
                  />
                  <button
                    type="button"
                    className="atelier-explode-btn"
                    onClick={() => setExplode3D((prevVal) => (prevVal > 0 ? 0 : 1))}
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    <span>{explode3D > 0 ? "Rapatkan Lapisan 3D" : "Urai Lapisan 3D"}</span>
                  </button>
                </div>

                <div className="atelier-cover-copy">
                  <p className="atelier-kicker">{template.name}</p>
                  <h1 className="atelier-couple-title">
                    {invitation.firstNameA} <em>&amp;</em> {invitation.firstNameB}
                  </h1>
                  <p className="atelier-date-line">{invitation.eventDate}</p>
                  <p className="atelier-greeting">{invitation.greeting}</p>
                  <button
                    type="button"
                    className="atelier-open-btn"
                    onClick={next}
                    disabled={sections.length <= 1}
                  >
                    <span>Buka Undangan</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. COUPLE PROFILES */}
            {currentSection.type === "couple" && (
              <div className="atelier-centered-block">
                <p className="atelier-kicker">Mempelai Berbahagia</p>
                <h2 className="atelier-heading">Dua Jiwa Dalam Satu Doa</h2>
                <div className="atelier-couple-pair">
                  <div className="atelier-person-card">
                    <div className="atelier-monogram-circle">
                      {invitation.firstNameA.slice(0, 1)}
                    </div>
                    <h3>{invitation.firstNameA}</h3>
                    {invitation.parentNamesA && <p>{invitation.parentNamesA}</p>}
                  </div>
                  <div className="atelier-couple-join" aria-hidden="true">
                    <Heart size={18} />
                  </div>
                  <div className="atelier-person-card">
                    <div className="atelier-monogram-circle">
                      {invitation.firstNameB.slice(0, 1)}
                    </div>
                    <h3>{invitation.firstNameB}</h3>
                    {invitation.parentNamesB && <p>{invitation.parentNamesB}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* 3. QUOTE */}
            {currentSection.type === "quote" && (
              <div className="atelier-centered-block atelier-quote-block">
                <p className="atelier-kicker">Catatan Hati</p>
                <blockquote className="atelier-quote-text">
                  &ldquo;{invitation.quote}&rdquo;
                </blockquote>
                <div className="atelier-quote-rule" aria-hidden="true" />
                <span className="atelier-quote-sign">{invitation.coupleNames}</span>
              </div>
            )}

            {/* 4. TIMELINE */}
            {currentSection.type === "timeline" && (
              <div className="atelier-centered-block">
                <p className="atelier-kicker">Jejak Cerita</p>
                <h2 className="atelier-heading">Linimasa Perjalanan</h2>
                <div className="atelier-timeline-list">
                  {timelineData.map((item, idx) => (
                    <article key={`${item.year}-${idx}`} className="atelier-timeline-row">
                      <span className="atelier-year-tag">{item.year}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.story}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 5. EVENTS */}
            {currentSection.type === "events" && (
              <div className="atelier-centered-block">
                <p className="atelier-kicker">Waktu &amp; Lokasi</p>
                <h2 className="atelier-heading">Rangkaian Hari Istimewa</h2>
                <div className="atelier-events-grid">
                  {[invitation.akad, invitation.reception].map((ev) => (
                    <article key={ev.title} className="atelier-event-card">
                      <h3>{ev.title}</h3>
                      <p className="atelier-event-row">
                        <Calendar size={14} aria-hidden="true" />
                        <span>
                          {ev.dateLabel} · {ev.timeLabel}
                        </span>
                      </p>
                      <p className="atelier-event-row">
                        <MapPin size={14} aria-hidden="true" />
                        <span>
                          <strong>{ev.venue}</strong> — {ev.address}
                        </span>
                      </p>
                      {ev.mapsUrl && (
                        <a
                          href={ev.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="atelier-maps-link"
                        >
                          Buka Petunjuk Arah →
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 6. GALLERY */}
            {currentSection.type === "gallery" && (
              <div className="atelier-centered-block">
                <p className="atelier-kicker">Galeri Visual</p>
                <h2 className="atelier-heading">Kepingan Kenangan</h2>
                <div className="atelier-gallery-grid">
                  {galleryData.map((item) => (
                    <figure key={item.id} className="atelier-gallery-card">
                      <div className="atelier-gallery-thumb">
                        <Image
                          src={item.imageUrl || artwork}
                          alt={item.title}
                          fill
                          sizes="220px"
                          referrerPolicy="no-referrer"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <figcaption>
                        <strong>{item.title}</strong>
                        <span>{item.note}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {/* 7. DIGITAL GIFT */}
            {currentSection.type === "gift" && (
              <div className="atelier-centered-block">
                <p className="atelier-kicker">Tanda Kasih</p>
                <h2 className="atelier-heading">Amplop &amp; Doa Restu</h2>
                <p className="atelier-subcopy">
                  Kehadiran Anda adalah hadiah terindah. Bagi keluarga atau sahabat yang ingin
                  mengirimkan tanda kasih jarak jauh, berikut detail rekening resmi mempelai.
                </p>
                <div className="atelier-gift-grid">
                  {giftAccounts.map((acc) => (
                    <div key={`${acc.bankName}-${acc.accountNumber}`} className="atelier-gift-card">
                      <div className="atelier-gift-head">
                        <Gift size={16} aria-hidden="true" />
                        <strong>{acc.bankName}</strong>
                      </div>
                      <p className="atelier-gift-number">{acc.accountNumber}</p>
                      <p className="atelier-gift-holder">a.n. {acc.accountHolder}</p>
                      <button
                        type="button"
                        className="atelier-copy-btn"
                        onClick={() => handleCopyAccount(acc.accountNumber, acc.bankName)}
                      >
                        {copiedBank === acc.bankName ? (
                          <>
                            <Check size={13} aria-hidden="true" /> Tersalin
                          </>
                        ) : (
                          <>
                            <Copy size={13} aria-hidden="true" /> Salin Nomor
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. RSVP & WISHES */}
            {currentSection.type === "rsvp" && (
              <div className="atelier-centered-block atelier-rsvp-block">
                <p className="atelier-kicker">Konfirmasi Kehadiran</p>
                <h2 className="atelier-heading">Kirim Doa &amp; RSVP</h2>

                <form onSubmit={handleSubmitRsvp} className="atelier-rsvp-form">
                  <div className="atelier-rsvp-row">
                    <input
                      type="text"
                      placeholder="Nama lengkap Anda..."
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="atelier-input"
                      required
                    />
                    <select
                      value={rsvpStatus}
                      onChange={(e) =>
                        setRsvpStatus(e.target.value === "berhalangan" ? "berhalangan" : "hadir")
                      }
                      className="atelier-input"
                      aria-label="Status kehadiran"
                    >
                      <option value="hadir">Saya Akan Hadir</option>
                      <option value="berhalangan">Berhalangan Hadir</option>
                    </select>
                    {rsvpStatus === "hadir" && (
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="atelier-input"
                        aria-label="Jumlah tamu"
                      >
                        <option value={1}>1 Orang</option>
                        <option value={2}>2 Orang</option>
                        <option value={3}>3 Orang</option>
                        <option value={4}>4 Orang</option>
                      </select>
                    )}
                  </div>

                  <div className="atelier-rsvp-row">
                    <input
                      type="text"
                      placeholder="Tuliskan doa terbaik untuk kedua mempelai..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="atelier-input"
                    />
                    <button
                      type="submit"
                      className="atelier-open-btn"
                      disabled={rsvpLoading}
                    >
                      <Send size={14} aria-hidden="true" />
                      <span>{rsvpLoading ? "Mengirim..." : "Kirim Konfirmasi"}</span>
                    </button>
                  </div>
                </form>

                {rsvpFeedback && <p className="atelier-rsvp-feedback">{rsvpFeedback}</p>}

                {rsvps.length > 0 && (
                  <div className="atelier-wishes-wall">
                    {rsvps.slice(0, 6).map((item) => (
                      <div key={item.id} className="atelier-wish-item">
                        <div className="atelier-wish-meta">
                          <strong>{item.guestName}</strong>
                          <span>
                            {item.status === "hadir"
                              ? `Hadir (${item.guestCount})`
                              : "Berhalangan"}
                          </span>
                        </div>
                        {item.message && <p>&ldquo;{item.message}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Bottom Dock Navigation */}
      <nav className="atelier-bottom-nav" aria-label="Navigasi adegan undangan">
        <button
          type="button"
          onClick={prev}
          disabled={safeStep === 0}
          className="atelier-nav-btn"
          aria-label="Halaman sebelumnya"
        >
          <ArrowLeft size={15} aria-hidden="true" />
        </button>

        <div className="atelier-nav-dots">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => goTo(idx)}
              className={`atelier-nav-dot ${idx === safeStep ? "active" : ""}`}
              aria-label={`Buka ${sec.label}`}
              aria-current={idx === safeStep ? "step" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={safeStep === sections.length - 1}
          className="atelier-nav-btn"
          aria-label="Halaman berikutnya"
        >
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </nav>
    </main>
  );
}
