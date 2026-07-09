import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";
import DeleteOrderButton from "@/components/DeleteOrderButton";
import MarkShippedButton from "@/components/MarkShippedButton";
import LogoutButton from "@/components/admin/LogoutButton";
import Link from "next/link";
import { isAdminSession } from "@/lib/admin-auth";
import { getPlanById } from "@/lib/plans";
import { getAllProductsAdmin } from "@/lib/products";

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
    take: 200,
  });

  const contacts = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const allProducts = await getAllProductsAdmin();
  const productPriceBySlug = new Map(allProducts.map((p) => [p.slug, p.price]));
  const priceOf = (m: (typeof messages)[number]) =>
    m.productSlug ? productPriceBySlug.get(m.productSlug) ?? 0 : getPlanById(m.plan)?.price ?? 0;

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidMessages = messages.filter((m) => m.paid);
  const toShipList = paidMessages.filter((m) => !m.shippedAt);
  const shippedList = paidMessages.filter((m) => m.shippedAt);
  const unpaidList = messages.filter((m) => !m.paid);

  // Nombre d'articles par commande groupée (panier) → badge "même colis".
  const orderCounts = new Map<string, number>();
  for (const m of messages) {
    if (m.orderId) orderCounts.set(m.orderId, (orderCounts.get(m.orderId) ?? 0) + 1);
  }

  const total = messages.length;
  const paid = paidMessages.length;
  const newLast24h = messages.filter((m) => m.createdAt >= last24h).length;
  const revenue = paidMessages.reduce((sum, m) => sum + priceOf(m), 0);
  const revenueThisMonth = paidMessages
    .filter((m) => m.createdAt >= monthStart)
    .reduce((sum, m) => sum + priceOf(m), 0);
  const avgOrderValue = paid > 0 ? revenue / paid : 0;
  const boutiqueCount = paidMessages.filter((m) => m.source === "boutique").length;

  const fmtDateTime = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
    " à " +
    new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const fmtEur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8 flex-wrap">
          <Logo size={48} />
          <div className="flex-1 min-w-40">
            <h1 className="text-xl font-black tracking-widest uppercase" style={{ color: "var(--ink)" }}>
              Dashboard Admin
            </h1>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>N&rsquo;OUBLIE JAMAIS</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/account"
              className="px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95"
              style={{ background: "white", color: "var(--ink-muted)", border: "1.5px solid rgba(28,20,16,0.10)" }}
            >
              Mon compte
            </Link>
            <Link
              href="/admin/products"
              className="px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95"
              style={{ background: "white", color: "var(--gold-dark)", border: "1.5px solid rgba(184,134,26,0.30)" }}
            >
              Produits
            </Link>
            <Link
              href="/composer?mode=boutique"
              className="px-4 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 16px rgba(184,134,26,0.28)" }}
            >
              + Commande boutique
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Nouvelles commandes — bandeau si activité récente */}
        {newLast24h > 0 && (
          <div className="rounded-2xl px-5 py-3.5 mb-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(184,134,26,0.12), rgba(212,168,50,0.08))", border: "1.5px solid rgba(184,134,26,0.35)" }}>
            <span className="relative flex w-2.5 h-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "var(--gold)" }} />
              <span className="relative inline-flex rounded-full w-2.5 h-2.5" style={{ background: "var(--gold)" }} />
            </span>
            <p className="text-[13px] font-bold" style={{ color: "var(--gold-dark)" }}>
              {newLast24h} nouvelle{newLast24h > 1 ? "s" : ""} commande{newLast24h > 1 ? "s" : ""} dans les dernières 24 h
            </p>
          </div>
        )}

        {/* Stats principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: "Cartes créées", value: total, alert: false },
            { label: "Payées", value: paid, alert: false },
            { label: "À expédier", value: toShipList.length, alert: toShipList.length > 0 },
            { label: "Expédiées", value: shippedList.length, alert: false },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "white", border: s.alert ? "1.5px solid rgba(184,134,26,0.45)" : "1px solid rgba(184,134,26,0.12)", boxShadow: "0 2px 12px rgba(184,134,26,0.06)" }}>
              <p className="text-2xl font-black" style={{ color: "var(--gold)" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Stats financières */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Revenus totaux", value: fmtEur(revenue) },
            { label: "Revenus ce mois-ci", value: fmtEur(revenueThisMonth) },
            { label: "Panier moyen", value: fmtEur(avgOrderValue) },
            { label: "Ventes boutique", value: boutiqueCount },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "var(--ink)" }}>
              <p className="text-xl font-black" style={{ color: "var(--gold)" }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: "rgba(250,246,239,0.55)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ═══ À expédier ═══ */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: toShipList.length > 0 ? "1.5px solid rgba(184,134,26,0.35)" : "1px solid rgba(184,134,26,0.12)", boxShadow: "0 2px 12px rgba(184,134,26,0.06)" }}>
          <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ background: "white", borderBottom: "1px solid rgba(184,134,26,0.10)" }}>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold-dark)" }}>À expédier</h2>
              <span className="text-[11px] font-bold" style={{ color: "var(--ink-muted)" }}>{toShipList.length}</span>
            </div>
            {toShipList.length > 0 && (
              <a
                href="/api/admin/export-shipping"
                className="px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all active:scale-95"
                style={{ background: "var(--cream)", color: "var(--gold-dark)", border: "1px solid rgba(184,134,26,0.30)" }}
                title="Fichier CSV à importer dans ColiShip (coliship.laposte.fr → Import de commandes)"
              >
                Exporter pour ColiShip
              </a>
            )}
          </div>
          <div style={{ background: "white" }}>
            {toShipList.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "var(--ink-muted)" }}>Tout est expédié — aucune commande en attente.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(184,134,26,0.08)" }}>
                {toShipList.map((m) => {
                  const hasShipping = m.shipAddress || m.shipCity;
                  const isNew = m.createdAt >= last24h;
                  return (
                  <div key={m.id} className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>
                        {m.fromName} → {m.toName}
                      </p>
                      {m.orderId && (orderCounts.get(m.orderId) ?? 0) > 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(139,101,16,0.12)", color: "var(--gold-dark)" }}>
                          Même colis · {orderCounts.get(m.orderId)} articles
                        </span>
                      )}
                      {isNew && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide" style={{ background: "var(--gold)", color: "white" }}>
                          NOUVEAU
                        </span>
                      )}
                      {m.accessCode && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black tracking-widest" style={{ background: "rgba(184,134,26,0.10)", color: "var(--gold-dark)" }}>
                          {m.accessCode}
                        </span>
                      )}
                      <div className="ml-auto">
                        <DeleteOrderButton slug={m.slug} label={`${m.fromName} → ${m.toName}`} />
                      </div>
                    </div>

                    <p className="text-[12px] -mt-1" style={{ color: "var(--ink-muted)" }}>
                      Commandée le <strong style={{ color: "var(--ink)" }}>{fmtDateTime(m.createdAt)}</strong>
                      {" · "}{m.productName ? `${m.productName}${m.productSize ? ` (${m.productSize})` : ""}` : getPlanById(m.plan)?.name ?? m.plan}
                      {" · "}{m.source === "boutique" ? "Vente boutique" : "Commande web"}
                      {m.buyerEmail && <>{" · "}{m.buyerEmail}</>}
                    </p>

                    <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(184,134,26,0.30)" }}>
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(184,134,26,0.08)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6" width={14} height={14}>
                          <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" />
                        </svg>
                        <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "var(--gold-dark)" }}>
                          À préparer — bracelet + carte imprimée
                        </p>
                      </div>
                      <div className="px-4 py-3 flex flex-col gap-3" style={{ background: "white" }}>
                        {/* Bijou à préparer — bien en évidence */}
                        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: "rgba(184,134,26,0.06)" }}>
                          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--gold-dark)" strokeWidth="1.6" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="13" r="6" /><path d="M9 4h6l1.5 3H7.5z" />
                          </svg>
                          <p className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>
                            {m.productName ?? getPlanById(m.plan)?.name ?? "Bijou"}
                            {m.productSize && <span style={{ color: "var(--gold-dark)" }}> · Taille {m.productSize}</span>}
                          </p>
                        </div>
                        {hasShipping ? (
                          <div className="flex items-start gap-2.5">
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" stroke="var(--gold)" strokeWidth="1.6"/>
                              <circle cx="12" cy="10" r="3" stroke="var(--gold)" strokeWidth="1.6"/>
                            </svg>
                            <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink)" }}>
                              <strong>{m.shipName}</strong><br />
                              {m.shipAddress}{m.shipComplement ? `, ${m.shipComplement}` : ""}<br />
                              {m.shipPostalCode} {m.shipCity} · {m.shipCountry}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[12px] italic" style={{ color: "var(--ink-muted)" }}>
                            Pas d&rsquo;adresse — remise en main propre (vente boutique).
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={`/api/order-sheet/${m.slug}`} target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95" style={{ background: "var(--gold-dark)" }}>
                            Bon de commande
                          </a>
                          <Link href={`/api/pdf/${m.slug}`} target="_blank" className="px-3.5 py-2.5 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95" style={{ background: "var(--ink)" }}>
                            Imprimer la carte
                          </Link>
                          <a href={`/api/qr/${m.slug}?download=1`} className="px-3.5 py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-95" style={{ background: "white", color: "var(--gold-dark)", border: "1.5px solid rgba(184,134,26,0.35)" }}>
                            QR code
                          </a>
                          <Link href={`/listen/${m.slug}`} target="_blank" className="px-3.5 py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-95" style={{ background: "white", color: "var(--gold-dark)", border: "1.5px solid rgba(184,134,26,0.35)" }}>
                            Page d&rsquo;écoute
                          </Link>
                        </div>
                        <div className="pt-1">
                          <MarkShippedButton slug={m.slug} shipped={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══ Expédiées ═══ */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid rgba(184,134,26,0.12)", boxShadow: "0 2px 12px rgba(184,134,26,0.06)" }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "white", borderBottom: "1px solid rgba(184,134,26,0.10)" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Expédiées</h2>
            <span className="text-[11px] font-bold" style={{ color: "var(--ink-muted)" }}>{shippedList.length}</span>
          </div>
          <div style={{ background: "white" }}>
            {shippedList.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: "var(--ink-muted)" }}>Aucune expédition pour l&rsquo;instant.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(184,134,26,0.08)" }}>
                {shippedList.map((m) => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16} className="shrink-0">
                      <path d="M5 12l5 5L19 7" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{m.fromName} → {m.toName}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-muted)" }}>Expédiée le {fmtDateTime(m.shippedAt!)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link href={`/listen/${m.slug}`} target="_blank" className="text-[11px] font-semibold" style={{ color: "var(--gold)" }}>Écouter →</Link>
                      <MarkShippedButton slug={m.slug} shipped />
                      <DeleteOrderButton slug={m.slug} label={`${m.fromName} → ${m.toName}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ En attente de paiement ═══ */}
        {unpaidList.length > 0 && (
          <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid rgba(184,134,26,0.12)" }}>
            <div className="px-5 py-3" style={{ background: "white", borderBottom: "1px solid rgba(184,134,26,0.10)" }}>
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>En attente de paiement</h2>
            </div>
            <div className="divide-y" style={{ background: "white", borderColor: "rgba(184,134,26,0.08)" }}>
              {unpaidList.map((m) => (
                <div key={m.id} className="px-5 py-2.5 flex items-center gap-3">
                  <p className="text-[13px] flex-1 min-w-0 truncate" style={{ color: "var(--ink-muted)" }}>
                    {m.fromName} → {m.toName} · {fmtDateTime(m.createdAt)}
                  </p>
                  <DeleteOrderButton slug={m.slug} label={`${m.fromName} → ${m.toName}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages du formulaire de contact */}
        <div className="rounded-2xl overflow-hidden mt-8" style={{ border: "1px solid rgba(184,134,26,0.12)", boxShadow: "0 2px 12px rgba(184,134,26,0.06)" }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "white", borderBottom: "1px solid rgba(184,134,26,0.10)" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Messages de contact</h2>
            <span className="text-[11px] font-bold" style={{ color: "var(--ink-muted)" }}>{contacts.length}</span>
          </div>
          <div style={{ background: "white" }}>
            {contacts.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: "var(--ink-muted)" }}>Aucun message pour l&rsquo;instant.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(184,134,26,0.08)" }}>
                {contacts.map((c) => (
                  <div key={c.id} className="px-5 py-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{c.name}</p>
                      <a href={`mailto:${c.email}`} className="text-[12px] font-semibold" style={{ color: "var(--gold)" }}>{c.email}</a>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: "rgba(184,134,26,0.10)", color: "var(--gold-dark)" }}>{c.subject}</span>
                      <span className="text-[11px] ml-auto" style={{ color: "var(--ink-muted)" }}>
                        {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink-muted)" }}>{c.message}</p>
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
