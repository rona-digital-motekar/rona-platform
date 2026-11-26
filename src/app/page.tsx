import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import HeroWebGLStage from "@/components/landing/HeroWebGLStage";
import DepthAnatomySection from "@/components/landing/DepthAnatomySection";
import PublicTemplateCatalog from "@/components/PublicTemplateCatalog";
import { getPublicCatalogData } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { templates, invitations, rsvpCount } = await getPublicCatalogData();
  const featuredDemoUrl = templates[0]?.demoUrl || "/i/bagas-clarissa";

  return (
    <div className="home-canvas">
      <div className="home-shell">
        {/* Top Bar Contract: Brand wordmark — Concise nav links — 1 Primary CTA (Zero Operator Links) */}
        <header className="site-header">
          <Link className="wordmark" href="/">
            RONA<span>®</span>
          </Link>

          <nav className="site-nav" aria-label="Navigasi utama">
            <a href="#katalog">Katalog</a>
            <a href="#dimensi">Dimensi 3D</a>
            <a href="#keunggulan">Filosofi Studio</a>
          </nav>

          <Link className="header-cta" href={featuredDemoUrl}>
            <span>Buka Demo</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </header>

        <main>
          {/* Hero Section: Editorial Statement + Interactive Three.js 3D Diorama */}
          <section className="home-hero">
            <div className="hero-copy">
              <p className="eyebrow">Studio Undangan Digital · Ruang 3D &amp; 2.5D</p>
              <h1>
                Hari istimewa,{" "}
                <em>cerita yang hidup dalam ruang.</em>
              </h1>
              <p className="hero-lede">
                Rona merancang undangan digital berkarakter arsitektur kertas—memadukan
                objek segel lilin 3D interaktif, lapisan 2.5D berlapis cahaya, serta buku tamu
                langsung yang ramah di setiap layar ponsel.
              </p>

              <div className="hero-actions">
                <a className="primary-link" href="#katalog">
                  <span>Jelajahi Katalog ({templates.length})</span>
                  <ArrowDown size={15} aria-hidden="true" />
                </a>
                <Link className="secondary-link" href="/i/dimas-sarah">
                  <span>Coba Demo Storybook</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>

              <div className="hero-proof-line">
                <span>{templates.length} Tema Terbit</span>
                <span aria-hidden="true">·</span>
                <span>{Object.keys(invitations).length} Undangan Aktif</span>
                <span aria-hidden="true">·</span>
                <span>{rsvpCount} Ucapan Tamu Tersimpan</span>
              </div>
            </div>

            <HeroWebGLStage templates={templates} invitations={invitations} />
          </section>

          {/* Interactive 2.5D Depth Layers Explorer */}
          <DepthAnatomySection />

          {/* Live Server-Synced Published Template Catalog */}
          <PublicTemplateCatalog
            initialTemplates={templates}
            invitationsMap={invitations}
          />

          {/* Studio Craftsmanship & Principles */}
          <section className="craft-section" id="keunggulan">
            <div className="craft-quote-col">
              <p className="eyebrow">Filosofi Studio</p>
              <blockquote>
                Undangan pernikahan semestinya tidak terasa seperti formulir kaku, melainkan
                sebuah kenang-kenangan hangat yang menyambut tamu sejak sentuhan pertama.
              </blockquote>
            </div>

            <div className="craft-list-col">
              <div className="craft-item">
                <span className="craft-num">01</span>
                <div>
                  <h3>Ruang 3D &amp; Gerak Pegas Alami</h3>
                  <p>
                    Segel lilin logam dan lembaran kertas merespons gerak tangan dengan kurva
                    pegas yang lembut, tetap ringan pada peramban ponsel.
                  </p>
                </div>
              </div>

              <div className="craft-item">
                <span className="craft-num">02</span>
                <div>
                  <h3>Katalog Terintegrasi Real-Time</h3>
                  <p>
                    Setiap tema yang diracik dan diterbitkan di studio Rona langsung memiliki
                    rute demo hidup serta dapat dipasangkan dengan cerita pasangan mana pun.
                  </p>
                </div>
              </div>

              <div className="craft-item">
                <span className="craft-num">03</span>
                <div>
                  <h3>Konfirmasi &amp; Doa Tersimpan</h3>
                  <p>
                    Tamu dapat memilih kehadiran, jumlah rombongan, dan menulis doa yang
                    langsung tersimpan ke buku tamu mempelai tanpa pengisian ulang yang rumit.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Quiet Public Footer */}
        <footer className="site-footer">
          <span>Rona Digital Motekar</span>
          <span>Studio Undangan Digital · Edisi 3D &amp; 2.5D</span>
        </footer>
      </div>
    </div>
  );
}
