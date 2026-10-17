import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 · HALAMAN BELUM ADA</p>
      <h1>Cerita ini belum ditemukan.</h1>
      <p>Slug undangan tidak cocok dengan data demo yang tersedia.</p>
      <Link className="primary-link" href="/">Kembali ke Rona</Link>
    </main>
  );
}
