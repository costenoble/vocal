import Logo from "@/components/Logo";
import Link from "next/link";

interface Props {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, updated, children }: Props) {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Top bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark))" }} />

      {/* Header */}
      <header className="px-5 py-4" style={{ borderBottom: "1px solid rgba(184,134,26,0.12)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-[10px] font-black tracking-[0.22em] uppercase" style={{ color: "var(--ink)" }}>
              N&rsquo;OUBLIE JAMAIS
            </span>
          </Link>
          <Link href="/" className="text-[12px] font-medium flex items-center gap-1" style={{ color: "var(--gold)" }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={12} height={12}><path d="M10 3L6 8l4 5"/></svg>
            Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-[10px] font-black tracking-[0.24em] uppercase mb-3" style={{ color: "var(--gold)" }}>
          Informations légales
        </p>
        <h1 className="text-[28px] font-black mb-2 leading-tight" style={{ color: "var(--ink)", fontFamily: "var(--font-playfair)" }}>
          {title}
        </h1>
        <p className="text-[12px] mb-10" style={{ color: "var(--ink-muted)" }}>
          Dernière mise à jour : {updated}
        </p>

        <div className="legal-content">
          {children}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="px-5 py-6 mt-10" style={{ borderTop: "1px solid rgba(184,134,26,0.12)" }}>
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px]" style={{ color: "var(--ink-muted)", opacity: 0.6 }}>
            © {new Date().getFullYear()} N&rsquo;OUBLIE JAMAIS
          </p>
          <div className="flex gap-4">
            <Link href="/cgv" className="text-[11px]" style={{ color: "var(--ink-muted)" }}>CGV</Link>
            <Link href="/mentions-legales" className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Mentions légales</Link>
            <Link href="/confidentialite" className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Confidentialité</Link>
          </div>
        </div>
      </footer>

      <style>{`
        .legal-content h2 {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(184,134,26,0.15);
        }
        .legal-content p {
          font-size: 13px;
          line-height: 1.8;
          color: var(--ink-muted);
          margin-bottom: 1rem;
        }
        .legal-content ul {
          font-size: 13px;
          line-height: 1.8;
          color: var(--ink-muted);
          margin-bottom: 1rem;
          padding-left: 1.25rem;
          list-style: disc;
        }
        .legal-content li {
          margin-bottom: 0.25rem;
        }
        .legal-content strong {
          color: var(--ink);
          font-weight: 600;
        }
        .legal-content a {
          color: var(--gold);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
