"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import Link from "next/link";
import type { InvitationData, RsvpEntry } from "@/lib/invitations";
import { FONT_PAIRING_MAP, type TemplateItem } from "@/lib/templates";

type Props = {
  invitation: InvitationData;
  template?: TemplateItem;
  initialRsvps?: RsvpEntry[];
  previewMode?: boolean;
};

const scenes = ["Pembuka", "Mempelai", "Cerita", "Acara", "Konfirmasi"];

export default function InvitationExperience({
  invitation,
  template,
  initialRsvps = [],
  previewMode = false,
}: Props) {
  const [scene, setScene] = useState(0);
  const [rsvp, setRsvp] = useState<"hadir" | "berhalangan" | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>(initialRsvps);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((nextScene: number) => {
    setScene(Math.max(0, Math.min(scenes.length - 1, nextScene)));
  }, []);

  const next = useCallback(() => goTo(scene + 1), [goTo, scene]);
  const previous = useCallback(() => goTo(scene - 1), [goTo, scene]);

  useEffect(() => {
    if (previewMode) return;
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, previous, previewMode]);

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    touchStartY.current = event.changedTouches[0]?.clientY ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    const endX = event.changedTouches[0]?.clientX;
    const endY = event.changedTouches[0]?.clientY;
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
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) next();
      else previous();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  async function handleSubmitRsvp(e: React.FormEvent) {
    e.preventDefault();
    setRsvpMessage(null);
    if (previewMode) {
      setRsvpMessage("Mode pratinjau aktif. Tamu di URL undangan live tersimpan ke server.");
      return;
    }
    if (!guestName.trim()) {
      setRsvpMessage("Mohon masukkan nama Anda terlebih dahulu.");
      return;
    }

    setRsvpSending(true);
    try {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationSlug: invitation.slug,
          guestName: guestName.trim(),
          status: rsvp || "hadir",
          guestCount: 1,
          message: guestMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRsvpMessage(data.error || "Gagal menyimpan RSVP.");
      } else {
        setRsvps((prev) => [data.rsvp, ...prev]);
        setGuestName("");
        setGuestMessage("");
        setRsvpMessage("Terima kasih, konfirmasi kehadiran Anda telah tersimpan.");
      }
    } catch {
      setRsvpMessage("Gagal terhubung ke server.");
    } finally {
      setRsvpSending(false);
    }
  }

  const fontPair = template
    ? FONT_PAIRING_MAP[template.designConfig.fontPairing]
    : undefined;

  const dynamicStyle = template
    ? ({
        "--palette-bg": template.theme.background,
        "--palette-deep": template.theme.deep,
        "--palette-accent": template.theme.accent,
        "--palette-highlight": template.theme.highlight,
        "--palette-soft": template.theme.soft,
        fontFamily: fontPair?.bodyCss,
      } as React.CSSProperties)
    : undefined;

  return (
    <main
      className={`invite-shell palette-${invitation.slug}`}
      style={dynamicStyle}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <header className="invite-topbar">
        {previewMode ? (
          <span className="invite-brand">
            RONA<span>®</span>
          </span>
        ) : (
          <Link href="/" className="invite-brand">
            RONA<span>®</span>
          </Link>
        )}
        <span className="invite-top-label">UNDANGAN DIGITAL</span>
        <span className="scene-count">{String(scene + 1).padStart(2, "0")} / 05</span>
      </header>

      <div className="scene-progress" aria-label={`Adegan ${scene + 1} dari ${scenes.length}`}>
        <span style={{ width: `${((scene + 1) / scenes.length) * 100}%` }} />
      </div>

      <section
        className={`invite-scene scene-${scene}`}
        key={`${invitation.slug}-${scene}`}
        aria-live="polite"
      >
        <div className="scene-texture" aria-hidden="true" />
        {scene === 0 && (
          <div className="scene-content cover-content">
            <div className="floral-stamp" aria-hidden="true">
              <span>❧</span>
            </div>
            <p className="eyebrow">THE WEDDING OF</p>
            <h1
              className="couple-title"
              style={fontPair ? { fontFamily: fontPair.displayCss } : undefined}
            >
              {invitation.firstNameA}
              <i>&amp;</i>
              {invitation.firstNameB}
            </h1>
            <p className="cover-date">{invitation.eventDate}</p>
            <div className="thin-rule" />
            <p className="cover-greeting">{invitation.greeting}</p>
            <button type="button" className="open-invitation" onClick={next}>
              Buka undangan <span aria-hidden="true">↗</span>
            </button>
            <p className="swipe-hint">atau geser untuk memulai</p>
          </div>
        )}

        {scene === 1 && (
          <div className="scene-content couple-content">
            <p className="eyebrow">DENGAN PENUH SUKACITA</p>
            <h2 style={fontPair ? { fontFamily: fontPair.displayCss } : undefined}>
              Mempertemukan
              <br />
              <em>dua perjalanan.</em>
            </h2>
            <div className="couple-portraits" aria-hidden="true">
              <div className="portrait portrait-left">
                <span>{invitation.firstNameA.slice(0, 1)}</span>
              </div>
              <div className="portrait portrait-right">
                <span>{invitation.firstNameB.slice(0, 1)}</span>
              </div>
              <div className="portrait-join">&amp;</div>
            </div>
            <p className="couple-names">{invitation.coupleNames}</p>
            <p className="body-copy">
              Dengan restu keluarga, kami mengundang Anda menjadi bagian dari hari yang berarti bagi
              kami.
            </p>
          </div>
        )}

        {scene === 2 && (
          <div className="scene-content story-content">
            <p className="eyebrow">SEBUAH CERITA</p>
            <div className="story-mark" aria-hidden="true">
              &ldquo;
            </div>
            <h2 style={fontPair ? { fontFamily: fontPair.displayCss } : undefined}>
              {invitation.quote}
            </h2>
            <div className="story-line" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="body-copy">
              Bukan tentang cerita yang sempurna, tapi tentang memilih untuk melangkah bersama,
              setiap hari.
            </p>
          </div>
        )}

        {scene === 3 && (
          <div className="scene-content event-content">
            <p className="eyebrow">CATAT TANGGALNYA</p>
            <h2 style={fontPair ? { fontFamily: fontPair.displayCss } : undefined}>
              Hari yang
              <br />
              <em>kami nantikan.</em>
            </h2>
            <div className="event-date-pill">{invitation.eventDate}</div>
            <div className="event-grid">
              {[invitation.akad, invitation.reception].map((event) => (
                <article className="event-card" key={event.title}>
                  <span className="event-kicker">KAMI MENGUNDANG ANDA</span>
                  <h3>{event.title}</h3>
                  <p>{event.dateLabel}</p>
                  <p>{event.timeLabel}</p>
                  <div className="event-separator" />
                  <strong>{event.venue}</strong>
                  <p className="event-address">{event.address}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {scene === 4 && (
          <div className="scene-content rsvp-content">
            <div className="floral-stamp small-stamp" aria-hidden="true">
              <span>❧</span>
            </div>
            <p className="eyebrow">KONFIRMASI KEHADIRAN</p>
            <h2 style={fontPair ? { fontFamily: fontPair.displayCss } : undefined}>
              Sampai jumpa
              <br />
              <em>di hari bahagia.</em>
            </h2>

            <div className="rsvp-actions">
              <button
                type="button"
                className={rsvp === "hadir" ? "rsvp-button selected" : "rsvp-button"}
                onClick={() => setRsvp("hadir")}
              >
                Saya akan hadir
              </button>
              <button
                type="button"
                className={rsvp === "berhalangan" ? "rsvp-button selected" : "rsvp-button"}
                onClick={() => setRsvp("berhalangan")}
              >
                Mohon maaf, berhalangan
              </button>
            </div>

            <form onSubmit={handleSubmitRsvp} className="editorial-rsvp-form">
              <input
                type="text"
                placeholder="Nama lengkap Anda..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="editorial-rsvp-input"
                required
              />
              <input
                type="text"
                placeholder="Ucapan singkat..."
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                className="editorial-rsvp-input"
              />
              <button type="submit" className="rsvp-button selected" disabled={rsvpSending}>
                {rsvpSending ? "Menyimpan..." : "Kirim RSVP"}
              </button>
            </form>

            {rsvpMessage && <p className="rsvp-response">{rsvpMessage}</p>}
            {rsvps.length > 0 && (
              <p className="rsvp-response" style={{ marginTop: "8px" }}>
                {rsvps.length} tamu telah mengirim ucapan &amp; konfirmasi.
              </p>
            )}

            <div className="closing-signature">
              Dengan kasih, <strong>{invitation.coupleNames}</strong>
            </div>
          </div>
        )}
      </section>

      <nav className="scene-navigation" aria-label="Navigasi undangan">
        <button
          type="button"
          className="nav-arrow"
          onClick={previous}
          disabled={scene === 0}
          aria-label="Adegan sebelumnya"
        >
          ←
        </button>
        <div className="scene-dots">
          {scenes.map((label, index) => (
            <button
              type="button"
              key={label}
              onClick={() => goTo(index)}
              className={index === scene ? "scene-dot active" : "scene-dot"}
              aria-label={`Buka adegan ${label}`}
              aria-current={index === scene ? "step" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="nav-arrow"
          onClick={next}
          disabled={scene === scenes.length - 1}
          aria-label="Adegan berikutnya"
        >
          →
        </button>
      </nav>
      <p className="edge-note">SWIPE · TAP · EXPLORE</p>
    </main>
  );
}
