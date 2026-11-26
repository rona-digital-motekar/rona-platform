"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { InvitationData, RsvpEntry } from "@/lib/invitations";
import { FONT_PAIRING_MAP, type TemplateItem } from "@/lib/templates";

type Props = {
  invitation: InvitationData;
  template?: TemplateItem;
  initialRsvps?: RsvpEntry[];
  previewMode?: boolean;
};

const CHAPTERS = [
  { id: 0, title: "Sampul Cerita", label: "BAB I · BUKU CERITA" },
  { id: 1, title: "Dua Insan", label: "BAB II · MEMPELAI" },
  { id: 2, title: "Perjalanan Kasih", label: "BAB III · KISAH KAMI" },
  { id: 3, title: "Agenda Hari Bahagia", label: "BAB IV · WAKTU & TEMPAT" },
  { id: 4, title: "Album Kenangan", label: "BAB V · GALERI FOTO" },
  { id: 5, title: "Konfirmasi & Doa", label: "BAB VI · RSVP & DOA" },
];

export default function StorybookCinematicTemplate({
  invitation,
  template,
  initialRsvps = [],
  previewMode = false,
}: Props) {
  const [chapter, setChapter] = useState(0);
  const [rsvpStatus, setRsvpStatus] = useState<"hadir" | "berhalangan" | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [wishes, setWishes] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [rsvpEntries, setRsvpEntries] = useState<RsvpEntry[]>(initialRsvps);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((target: number) => {
    setChapter(Math.max(0, Math.min(CHAPTERS.length - 1, target)));
    if (typeof window !== "undefined" && !previewMode) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [previewMode]);

  const nextChapter = useCallback(() => {
    setChapter((prev) => Math.min(CHAPTERS.length - 1, prev + 1));
    if (typeof window !== "undefined" && !previewMode) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [previewMode]);

  const prevChapter = useCallback(() => {
    setChapter((prev) => Math.max(0, prev - 1));
    if (typeof window !== "undefined" && !previewMode) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [previewMode]);

  useEffect(() => {
    if (previewMode) return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") nextChapter();
      if (e.key === "ArrowLeft" || e.key === "PageUp") prevChapter();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextChapter, prevChapter, previewMode]);

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

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) nextChapter();
      else prevChapter();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitNotice(null);

    if (previewMode) {
      setSubmitNotice("Mode pratinjau studio: pengiriman RSVP tersimpan pada rute undangan live.");
      return;
    }

    const cleanName = guestName.trim() || "Tamu Undangan";
    if (!wishes.trim() && !rsvpStatus) {
      setSubmitNotice("Pilih status kehadiran atau tuliskan doa Anda terlebih dahulu.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationSlug: invitation.slug,
          guestName: cleanName,
          status: rsvpStatus || "hadir",
          guestCount: Number(guestCount) || 1,
          message: wishes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitNotice(data.error || "Gagal menyimpan ucapan.");
      } else {
        setRsvpEntries((prev) => [data.rsvp, ...prev]);
        setWishes("");
        setGuestName("");
        setSubmitNotice("Terima kasih! Doa dan konfirmasi Anda telah tercatat di buku tamu.");
      }
    } catch {
      setSubmitNotice("Terjadi gangguan jaringan saat mengirim konfirmasi.");
    } finally {
      setIsSending(false);
    }
  };

  const timelineData =
    invitation.storyTimeline && invitation.storyTimeline.length > 0
      ? invitation.storyTimeline
      : [
          {
            year: "2021",
            title: "Pertemuan Awal",
            story: "Sebuah percakapan hangat yang membuka lembaran pertama cerita perjalanan kami.",
          },
          {
            year: "2023",
            title: "Tumbuh Bersama",
            story: "Belajar memahami, saling mendukung, dan memupuk komitmen dalam setiap langkah.",
          },
          {
            year: "2026",
            title: "Menuju Keabadian",
            story: "Merajut impian bersama dalam ikatan suci pernikahan dengan doa restu keluarga.",
          },
        ];

  const galleryData =
    invitation.gallery && invitation.gallery.length > 0
      ? invitation.gallery
      : [
          { id: "g1", title: "Momen Pertama", note: "Senyum tanpa rekayasa" },
          { id: "g2", title: "Langkah Bersama", note: "Menemukan arti pulang" },
          { id: "g3", title: "Hari Bahagia", note: "Menatap masa depan" },
        ];

  const fontPair = template
    ? FONT_PAIRING_MAP[template.designConfig.fontPairing]
    : undefined;

  const dynamicStyle = template
    ? ({
        "--sb-paper": template.theme.background,
        "--sb-ink": template.theme.deep,
        "--sb-terracotta": template.theme.accent,
        "--sb-gold": template.theme.highlight,
        "--sb-washi": template.theme.soft,
        fontFamily: fontPair?.bodyCss,
      } as React.CSSProperties)
    : undefined;

  return (
    <main
      className="storybook-shell"
      style={dynamicStyle}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={`Undangan Buku Cerita ${invitation.coupleNames}`}
    >
      {/* Top Bar Navigation */}
      <header className="storybook-topbar">
        {previewMode ? (
          <span className="storybook-brand">
            RONA<span>®</span> <small>STORYBOOK</small>
          </span>
        ) : (
          <Link href="/" className="storybook-brand">
            RONA<span>®</span> <small>STORYBOOK</small>
          </Link>
        )}
        <span className="storybook-chapter-indicator">
          {CHAPTERS[chapter].label}
        </span>
        <span className="storybook-page-counter">
          Lembar {String(chapter + 1).padStart(2, "0")} / 06
        </span>
      </header>

      {/* Progress Thread */}
      <div
        className="storybook-progress"
        aria-label={`Lembar ${chapter + 1} dari ${CHAPTERS.length}`}
      >
        <div
          className="storybook-progress-bar"
          style={{ width: `${((chapter + 1) / CHAPTERS.length) * 100}%` }}
        />
      </div>

      {/* Main Scene Viewport with 2.5D Spring Page Turn */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="storybook-stage"
          key={`storybook-${chapter}`}
          initial={{ opacity: 0, y: 18, scale: 0.985, rotateX: 5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: -12, scale: 0.985, rotateX: -4 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.85 }}
          style={{ transformPerspective: 1200 }}
        >
          {/* BAB I: COVER BUKU CERITA */}
          {chapter === 0 && (
            <div className="storybook-card-sheet cover-sheet">
              <div className="storybook-washi washi-top" aria-hidden="true" />
              <div className="storybook-seal" aria-hidden="true">
                <span>❧</span>
              </div>
              <p className="storybook-kicker">BUKU CERITA CINTA · EDISI KHUSUS</p>
              <h1 className="storybook-title">
                {invitation.firstNameA}
                <span className="storybook-ampersand">&amp;</span>
                {invitation.firstNameB}
              </h1>
              <p className="storybook-date-ribbon">{invitation.eventDate}</p>
              <div className="storybook-rule" />
              <p className="storybook-greeting-lede">{invitation.greeting}</p>
              <button
                id="btn-open-storybook"
                data-testid="open-invitation-btn"
                type="button"
                className="storybook-open-btn"
                onClick={nextChapter}
                aria-label="Buka lembaran undangan ke bab berikutnya"
              >
                Buka Lembaran Undangan <span aria-hidden="true">→</span>
              </button>
              <p className="storybook-hint">Atau geser layar untuk membalik halaman</p>
            </div>
          )}

          {/* BAB II: PROFIL DUA INSAN */}
          {chapter === 1 && (
            <div className="storybook-card-sheet couple-sheet">
              <div className="storybook-washi washi-center" aria-hidden="true" />
              <p className="storybook-kicker">MEMPERTEMUKAN DUA KISAH</p>
              <h2 className="storybook-heading">
                Dua Hati,
                <br />
                <em>Satu Ikatan Suci.</em>
              </h2>

              <div className="storybook-polaroid-pair">
                <div className="storybook-polaroid polaroid-groom">
                  <div className="storybook-tape tape-groom" aria-hidden="true" />
                  <div className="polaroid-photo">
                    <span className="polaroid-monogram">
                      {invitation.firstNameA ? invitation.firstNameA[0] : "P"}
                    </span>
                  </div>
                  <div className="polaroid-caption">
                    <strong>{invitation.firstNameA}</strong>
                    <small>{invitation.parentNamesA || "Mempelai Pria"}</small>
                  </div>
                </div>

                <div className="storybook-knot" aria-hidden="true">
                  &amp;
                </div>

                <div className="storybook-polaroid polaroid-bride">
                  <div className="storybook-tape tape-bride" aria-hidden="true" />
                  <div className="polaroid-photo">
                    <span className="polaroid-monogram">
                      {invitation.firstNameB ? invitation.firstNameB[0] : "W"}
                    </span>
                  </div>
                  <div className="polaroid-caption">
                    <strong>{invitation.firstNameB}</strong>
                    <small>{invitation.parentNamesB || "Mempelai Wanita"}</small>
                  </div>
                </div>
              </div>

              <p className="storybook-body-quote">
                &ldquo;Dengan penuh rasa syukur dan restu keluarga besar kami, kami memohon kehadiran
                dan doa baik Anda untuk mengiringi langkah baru ini.&rdquo;
              </p>
            </div>
          )}

          {/* BAB III: TIMELINE PERJALANAN CINTA */}
          {chapter === 2 && (
            <div className="storybook-card-sheet story-sheet">
              <div className="storybook-washi washi-top" aria-hidden="true" />
              <p className="storybook-kicker">CATATAN PERJALANAN KAMI</p>
              <h2 className="storybook-heading">
                Babak Demi Babak,
                <br />
                <em>Menuju Janji Suci.</em>
              </h2>
              <p className="storybook-sublead">{invitation.quote}</p>

              <div className="storybook-timeline">
                {timelineData.map((item, idx) => (
                  <article key={`${item.year}-${idx}`} className="storybook-timeline-item">
                    <div className="timeline-badge">
                      <span>{item.year}</span>
                    </div>
                    <div className="timeline-content">
                      <h3>{item.title}</h3>
                      <p>{item.story}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* BAB IV: DETAIL WAKTU & TEMPAT ACARA */}
          {chapter === 3 && (
            <div className="storybook-card-sheet event-sheet">
              <div className="storybook-washi washi-center" aria-hidden="true" />
              <p className="storybook-kicker">AGENDA HARI ISTIMEWA</p>
              <h2 className="storybook-heading">
                Waktu &amp; Tempat
                <br />
                <em>Kami Mengundang Anda.</em>
              </h2>
              <div className="storybook-date-pill">{invitation.eventDate}</div>

              <div className="storybook-event-grid">
                <div className="storybook-event-box">
                  <span className="event-kicker-tag">UPACARA SAKRAL</span>
                  <h3>{invitation.akad.title}</h3>
                  <p className="event-time">{invitation.akad.timeLabel}</p>
                  <div className="storybook-divider" />
                  <strong className="event-venue-name">{invitation.akad.venue}</strong>
                  <p className="event-address-text">{invitation.akad.address}</p>
                </div>

                <div className="storybook-event-box">
                  <span className="event-kicker-tag">PERAYAAN SYUKUR</span>
                  <h3>{invitation.reception.title}</h3>
                  <p className="event-time">{invitation.reception.timeLabel}</p>
                  <div className="storybook-divider" />
                  <strong className="event-venue-name">{invitation.reception.venue}</strong>
                  <p className="event-address-text">{invitation.reception.address}</p>
                </div>
              </div>

              <p className="storybook-event-note">
                * Kehadiran Anda tepat waktu adalah kehormatan besar bagi kami sekeluarga.
              </p>
            </div>
          )}

          {/* BAB V: ALBUM FOTO SCRAPBOOK */}
          {chapter === 4 && (
            <div className="storybook-card-sheet gallery-sheet">
              <div className="storybook-washi washi-top" aria-hidden="true" />
              <p className="storybook-kicker">KUMPULAN KENANGAN KAMI</p>
              <h2 className="storybook-heading">
                Kepingan Momen
                <br />
                <em>Di Balik Lembaran Cerita.</em>
              </h2>

              <div className="storybook-scrapbook-grid">
                {galleryData.map((photo, i) => (
                  <div
                    key={photo.id}
                    className={`scrapbook-item item-${(i % 3) + 1} ${
                      activePhoto === i ? "active-inspect" : ""
                    }`}
                    onClick={() => setActivePhoto(activePhoto === i ? null : i)}
                  >
                    <div className="scrapbook-tape-corner" aria-hidden="true" />
                    <div className="scrapbook-art-placeholder">
                      <span className="scrapbook-icon">✦</span>
                      <span className="scrapbook-tag">{photo.title}</span>
                    </div>
                    <div className="scrapbook-note">
                      <p>&ldquo;{photo.note}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="storybook-hint">Ketuk foto untuk melihat catatan kenangan</p>
            </div>
          )}

          {/* BAB VI: KONFIRMASI KEHADIRAN & DOA */}
          {chapter === 5 && (
            <div className="storybook-card-sheet rsvp-sheet">
              <div className="storybook-washi washi-center" aria-hidden="true" />
              <div className="storybook-seal small-seal" aria-hidden="true">
                <span>❧</span>
              </div>
              <p className="storybook-kicker">LEMBAR KONFIRMASI &amp; DOA</p>
              <h2 className="storybook-heading">
                Sampai Berjumpa
                <br />
                <em>Di Lembaran Bahagia.</em>
              </h2>
              <p className="storybook-body-quote">
                Doa tulus serta kehadiran Anda merupakan berkah tak terhingga bagi lembaran awal
                kehidupan baru kami.
              </p>

              {/* RSVP Selection Buttons */}
              <div className="storybook-rsvp-actions">
                <button
                  type="button"
                  className={`storybook-rsvp-btn ${rsvpStatus === "hadir" ? "selected" : ""}`}
                  onClick={() => setRsvpStatus("hadir")}
                >
                  ✓ Saya Berkenan Hadir
                </button>
                <button
                  type="button"
                  className={`storybook-rsvp-btn ${rsvpStatus === "berhalangan" ? "selected" : ""}`}
                  onClick={() => setRsvpStatus("berhalangan")}
                >
                  ✕ Mohon Maaf, Berhalangan
                </button>
              </div>

              {rsvpStatus === "hadir" && (
                <div className="storybook-guest-selector">
                  <label htmlFor="guest-select">Jumlah Tamu yang Hadir:</label>
                  <select
                    id="guest-select"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="storybook-select"
                  >
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                  </select>
                </div>
              )}

              {/* Form Ucapan Doa */}
              <form onSubmit={handleSendWish} className="storybook-wishes-form">
                <label htmlFor="guest-name-input" className="storybook-wishes-label">
                  Nama Lengkap &amp; Doa untuk Kedua Mempelai:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    id="guest-name-input"
                    type="text"
                    placeholder="Nama lengkap Anda..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="storybook-input"
                    required
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      id="wishes-input"
                      type="text"
                      placeholder="Semoga senantiasa berbahagia dan diberkahi..."
                      value={wishes}
                      onChange={(e) => setWishes(e.target.value)}
                      className="storybook-input"
                    />
                    <button type="submit" className="storybook-send-btn" disabled={isSending}>
                      {isSending ? "Mengirim..." : "Kirim Doa"}
                    </button>
                  </div>
                </div>
              </form>

              {submitNotice && <p className="storybook-feedback-notice">{submitNotice}</p>}

              {rsvpEntries.length > 0 && (
                <div className="storybook-wishes-list">
                  <span className="storybook-wishes-heading">
                    Buku Tamu ({rsvpEntries.length}):
                  </span>
                  {rsvpEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="storybook-wish-bubble">
                      <strong>{entry.guestName}</strong> ({entry.status === "hadir" ? "Hadir" : "Berhalangan"})
                      {entry.message ? ` — “${entry.message}”` : ""}
                    </div>
                  ))}
                </div>
              )}

              <div className="storybook-signature">
                <span className="signature-salut">Dengan penuh kasih dan rasa hormat,</span>
                <strong>{invitation.coupleNames}</strong>
                <small>Beserta Seluruh Keluarga Besar</small>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Scene Navigation Bar */}
      <nav className="storybook-bottom-nav" aria-label="Navigasi Lembaran Buku">
        <button
          type="button"
          onClick={prevChapter}
          disabled={chapter === 0}
          className="storybook-nav-arrow"
          aria-label="Balik ke bab sebelumnya"
        >
          ← Lembar Sebelumnya
        </button>

        <div className="storybook-nav-dots">
          {CHAPTERS.map((ch, idx) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => goTo(idx)}
              className={`storybook-nav-dot ${idx === chapter ? "active" : ""}`}
              aria-label={`Buka ${ch.title}`}
              aria-current={idx === chapter ? "step" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextChapter}
          disabled={chapter === CHAPTERS.length - 1}
          className="storybook-nav-arrow"
          aria-label="Lanjut ke bab berikutnya"
        >
          Lembar Berikutnya →
        </button>
      </nav>
    </main>
  );
}
