import Link from "next/link";

const demos = [
  { slug: "raka-alya", names: "Raka & Alya", note: "Nuansa ivory · sage · gold" },
  { slug: "andika-nadira", names: "Andika & Nadira", note: "Nuansa cream · terracotta" },
];

export default function HomePage() {
  return (
    <main className="home-shell">
      <header className="site-header">
        <Link className="wordmark" href="/">RONA<span>®</span></Link>
        <span className="header-note">DIGITAL INVITATION STUDIO</span>
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">FONDASI PLATFORM · VERSI 0.1</p>
          <h1>Hari istimewa,<br /><em>cerita yang bergerak.</em></h1>
          <p className="hero-lede">
            Prototype awal Rona Platform. Satu mesin template, beberapa undangan,
            dengan gerakan dua dimensi yang bisa dinikmati langsung dari HP.
          </p>
          <a className="primary-link" href="#demo">Jelajahi demo <span aria-hidden="true">↓</span></a>
          <p className="small-note">Data dan lokasi pada halaman demo masih contoh, bukan undangan acara nyata.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="art-stem stem-one" />
          <div className="art-stem stem-two" />
          <div className="art-leaf leaf-one" />
          <div className="art-leaf leaf-two" />
          <div className="art-leaf leaf-three" />
          <div className="art-leaf leaf-four" />
          <div className="art-card"><span>the beginning</span><b>R + A</b><small>a moving story</small></div>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="section-heading">
          <div><p className="eyebrow">COBA SEKARANG</p><h2>Satu template, dua cerita.</h2></div>
          <p className="section-subtitle">Buka demo, lalu ketuk tombol atau geser layar untuk berpindah adegan.</p>
        </div>
        <div className="demo-grid">
          {demos.map((demo, index) => (
            <article className={`demo-card demo-card-${index + 1}`} key={demo.slug}>
              <div className="demo-card-art" aria-hidden="true"><span>{index === 0 ? "R" : "A"}</span><i>&</i><span>{index === 0 ? "A" : "N"}</span></div>
              <div className="demo-card-info"><p>{demo.note}</p><h3>{demo.names}</h3><Link href={`/i/${demo.slug}`}>Buka undangan <span aria-hidden="true">↗</span></Link></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer"><span>RONA DIGITAL MOTEKAR</span><span>Prototype · Bukan versi produksi</span></footer>
    </main>
  );
}
