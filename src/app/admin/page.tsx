import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function checkAuth() {
  const hdrs = await headers();
  const key = hdrs.get("x-admin-key") || "";
  // Check via cookie or query param handled in middleware
  return key === process.env.ADMIN_KEY;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const sp = await searchParams;
  const key = sp.key || "";

  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    redirect("/");
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
      const prices: Record<string, number> = { essentiel: 9.9, precieux: 14.9, coffret: 34.9 };
      return sum + (prices[m.plan] ?? 0);
    }, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Logo size={48} />
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase" style={{ color: "var(--ink)" }}>
              Dashboard Admin
            </h1>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>N&rsquo;OUBLIE JAMAIS</p>
          </div>
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
                {messages.map((m) => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                        {m.fromName} → {m.toName}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-muted)" }}>
                        {new Date(m.createdAt).toLocaleDateString("fr-FR")} · {m.plan}
                        {m.buyerEmail && ` · ${m.buyerEmail}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: m.paid ? "rgba(22,163,74,0.12)" : "rgba(184,134,26,0.10)",
                          color: m.paid ? "#16a34a" : "var(--gold-dark)",
                        }}
                      >
                        {m.paid ? "Payé" : "Gratuit"}
                      </span>
                      <Link
                        href={`/listen/${m.slug}`}
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--gold)" }}
                      >
                        Écouter →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
