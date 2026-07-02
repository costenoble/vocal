import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";
import Link from "next/link";
import { isAdminSession } from "@/lib/admin-auth";
import { getPlanById } from "@/lib/plans";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

function LoginForm({ error }: { error?: string }) {
  const inputStyle = {
    background: "white",
    border: "1px solid rgba(184,134,26,0.25)",
    color: "var(--ink)",
  } as const;
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm">
        <div className="rounded-3xl px-8 py-10" style={{ background: "white", border: "1px solid rgba(184,134,26,0.14)", boxShadow: "0 10px 44px rgba(184,134,26,0.10)" }}>
          <form method="POST" action="/api/admin/login" className="flex flex-col items-center gap-5">
            <Logo size={72} />
            <div className="text-center">
              <h1 className="text-lg font-black tracking-widest uppercase" style={{ color: "var(--ink)" }}>Espace admin</h1>
              <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>N&rsquo;OUBLIE JAMAIS</p>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="admin-user" className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--ink-muted)" }}>
                Identifiant
              </label>
              <input
                id="admin-user"
                type="text"
                name="user"
                required
                autoFocus
                autoComplete="username"
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--ink-muted)" }}>
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-xs font-semibold" style={{ color: "#C0392B" }}>
                {error === "ratelimit" ? "Trop de tentatives. Réessayez dans une minute." : "Identifiant ou mot de passe incorrect."}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 18px rgba(184,134,26,0.25)" }}
            >
              Se connecter
            </button>
          </form>
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: "rgba(28,20,16,0.35)" }}>
          Accès réservé — N&rsquo;OUBLIE JAMAIS
        </p>
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  if (!(await isAdminSession())) {
    return <LoginForm error={sp.error} />;
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = messages.length;
  const paid = messages.filter((m) => m.paid).length;
  const revenue = messages
    .filter((m) => m.paid)
    .reduce((sum, m) => {
      const price = m.productSlug
        ? getProductBySlug(m.productSlug)?.price ?? 0
        : getPlanById(m.plan)?.price ?? 0;
      return sum + price;
    }, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Logo size={48} />
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-widest uppercase" style={{ color: "var(--ink)" }}>
              Dashboard Admin
            </h1>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>N&rsquo;OUBLIE JAMAIS</p>
          </div>
          <Link
            href="/composer?mode=boutique"
            className="px-4 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 16px rgba(184,134,26,0.28)" }}
          >
            + Commande boutique
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Cartes créées", value: total },
            { label: "Payées", value: paid },
            { label: "Revenus", value: `${revenue.toFixed(2)}€` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "white", border: "1px solid rgba(184,134,26,0.12)", boxShadow: "0 2px 12px rgba(184,134,26,0.06)" }}>
              <p className="text-2xl font-black" style={{ color: "var(--gold)" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(184,134,26,0.12)", boxShadow: "0 2px 12px rgba(184,134,26,0.06)" }}>
          <div className="px-5 py-3" style={{ background: "white", borderBottom: "1px solid rgba(184,134,26,0.10)" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Toutes les cartes</h2>
          </div>
          <div style={{ background: "white" }}>
            {messages.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "var(--ink-muted)" }}>Aucune carte créée pour l&rsquo;instant.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(184,134,26,0.08)" }}>
                {messages.map((m) => {
                  const hasShipping = m.shipAddress || m.shipCity;
                  return (
                  <div key={m.id} className="px-5 py-3 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                          {m.fromName} → {m.toName}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-muted)" }}>
                          {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                          {m.productName ? ` · ${m.productName}${m.productSize ? ` (${m.productSize})` : ""}` : ` · ${m.plan}`}
                          {m.buyerEmail && ` · ${m.buyerEmail}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.accessCode && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black tracking-widest" style={{ background: "rgba(184,134,26,0.10)", color: "var(--gold-dark)" }}>
                            {m.accessCode}
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: m.paid ? "rgba(22,163,74,0.12)" : "rgba(184,134,26,0.10)",
                            color: m.paid ? "#16a34a" : "var(--gold-dark)",
                          }}
                        >
                          {m.paid ? "Payé" : "En attente"}
                        </span>
                        <Link href={`/listen/${m.slug}`} className="text-[11px] font-semibold" style={{ color: "var(--gold)" }}>
                          Écouter →
                        </Link>
                        <Link href={`/api/pdf/${m.slug}`} className="text-[11px] font-semibold" style={{ color: "var(--gold)" }}>
                          Carte →
                        </Link>
                        <a href={`/api/qr/${m.slug}?download=1`} className="text-[11px] font-semibold" style={{ color: "var(--gold)" }}>
                          QR →
                        </a>
                      </div>
                    </div>
                    {hasShipping && (
                      <div className="rounded-lg px-3 py-2 flex items-start gap-2" style={{ background: "var(--cream)" }}>
                        <svg viewBox="0 0 24 24" width={13} height={13} fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="var(--gold)" strokeWidth="1.5"/>
                        </svg>
                        <p className="text-[11px] leading-snug" style={{ color: "var(--ink-muted)" }}>
                          <strong style={{ color: "var(--ink)" }}>{m.shipName}</strong> — {m.shipAddress}
                          {m.shipComplement ? `, ${m.shipComplement}` : ""}, {m.shipPostalCode} {m.shipCity} · {m.shipCountry}
                        </p>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
