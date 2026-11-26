"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useOperator } from "@/lib/operator-context";

export default function OperatorAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authLoading, authenticated, setupRequired, login, setupPin } =
    useOperator();

  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="op-auth-backdrop">
        <div className="op-auth-card">
          <p className="op-auth-kicker">Rona Operator Studio</p>
          <h1>Memeriksa Sesi Studio...</h1>
          <p className="op-auth-desc">Menghubungkan ke server persisten Rona Digital Motekar.</p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (setupRequired) {
      if (passcode.trim().length < 4) {
        setError("PIN atau kata sandi minimal 4 karakter.");
        return;
      }
      if (passcode.trim() !== confirmPasscode.trim()) {
        setError("Konfirmasi PIN tidak cocok.");
        return;
      }
      setSubmitting(true);
      const res = await setupPin(passcode.trim());
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || "Aktivasi PIN gagal.");
      }
      return;
    }

    if (!passcode.trim()) {
      setError("Masukkan PIN atau kata sandi Operator.");
      return;
    }
    setSubmitting(true);
    const res = await login(passcode.trim());
    setSubmitting(false);
    if (!res.success) {
      setError(res.error || "PIN tidak sesuai.");
    }
  }

  return (
    <div className="op-auth-backdrop">
      <div className="op-auth-card">
        <div className="op-auth-icon-box" aria-hidden="true">
          {setupRequired ? <KeyRound size={22} /> : <Lock size={22} />}
        </div>

        <p className="op-auth-kicker">Rona Digital Motekar · Area Internal</p>
        <h1>
          {setupRequired
            ? "Buat PIN Operator Awal"
            : "Masuk ke Operator Studio"}
        </h1>
        <p className="op-auth-desc">
          {setupRequired
            ? "Belum ada PIN Operator yang ditetapkan. Buat PIN atau kata sandi admin pertama untuk mengamankan studio desain, data pasangan, dan RSVP tamu."
            : "Masukkan PIN atau kata sandi Operator untuk membuka Canva Studio, katalog template, dan manajemen undangan."}
        </p>

        {error && (
          <div className="op-auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="op-auth-form">
          <div className="op-field">
            <label htmlFor="op-pin-input">
              {setupRequired ? "PIN / Kata Sandi Baru (min. 4 karakter)" : "PIN / Kata Sandi Operator"}
            </label>
            <input
              id="op-pin-input"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Masukkan PIN rahasia studio..."
              autoComplete={setupRequired ? "new-password" : "current-password"}
              required
            />
          </div>

          {setupRequired && (
            <div className="op-field">
              <label htmlFor="op-pin-confirm">Konfirmasi PIN / Kata Sandi</label>
              <input
                id="op-pin-confirm"
                type="password"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Ulangi PIN yang sama..."
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="op-btn-primary op-auth-submit"
            disabled={submitting}
          >
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              {submitting
                ? "Memproses..."
                : setupRequired
                ? "Aktifkan PIN & Buka Studio"
                : "Buka Operator Studio"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
