"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TeamUser {
  id: string;
  username: string;
  name: string;
  createdAt: string;
}

interface Props {
  me: { id: string; username: string; name: string };
  initialUsers: TeamUser[];
}

const card = {
  background: "white",
  border: "1px solid rgba(184,134,26,0.14)",
  boxShadow: "0 2px 12px rgba(184,134,26,0.06)",
} as const;

const inputStyle = {
  background: "var(--cream)",
  border: "1px solid rgba(184,134,26,0.22)",
  color: "var(--ink)",
} as const;

const labelCls = "text-[11px] font-bold tracking-[0.1em] uppercase";
const inputCls = "px-3.5 py-3 rounded-xl text-[14px] outline-none w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls} style={{ color: "var(--ink-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function AccountManager({ me, initialUsers }: Props) {
  const router = useRouter();

  // ── Mon compte ──
  const [name, setName] = useState(me.name);
  const [username, setUsername] = useState(me.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingMe, setSavingMe] = useState(false);
  const [meMsg, setMeMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Équipe ──
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [nuName, setNuName] = useState("");
  const [nuUsername, setNuUsername] = useState("");
  const [nuPassword, setNuPassword] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [teamMsg, setTeamMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const saveMe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMe(true);
    setMeMsg(null);
    const changesUsername = username.trim() !== me.username;
    const changesPassword = newPassword.length > 0;
    const payload: Record<string, string> = { name: name.trim() };
    if (changesUsername) payload.username = username.trim();
    if (changesPassword) payload.newPassword = newPassword;
    if ((changesUsername || changesPassword) && !currentPassword) {
      setMeMsg({ ok: false, text: "Saisissez votre mot de passe actuel pour confirmer." });
      setSavingMe(false);
      return;
    }
    payload.currentPassword = currentPassword;

    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setMeMsg({ ok: true, text: "Modifications enregistrées." });
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch (err) {
      setMeMsg({ ok: false, text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSavingMe(false);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setTeamMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nuName.trim(), username: nuUsername.trim(), password: nuPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setUsers((prev) => [...prev, json.user]);
      setNuName(""); setNuUsername(""); setNuPassword("");
      setTeamMsg({ ok: true, text: "Membre ajouté." });
    } catch (err) {
      setTeamMsg({ ok: false, text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setAddingUser(false);
    }
  };

  const removeUser = async (u: TeamUser) => {
    if (!window.confirm(`Supprimer l'accès de « ${u.name || u.username} » ?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { alert(json.error || "Suppression impossible."); return; }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      alert("Erreur réseau.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Mon compte ── */}
      <div className="rounded-2xl p-6" style={card}>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--gold)" }}>
          Mes identifiants
        </h2>
        <form onSubmit={saveMe} noValidate className="flex flex-col gap-4">
          <Field label="Nom affiché">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Votre nom" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Identifiant de connexion">
            <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} style={inputStyle} />
          </Field>

          <div className="h-px my-1" style={{ background: "rgba(184,134,26,0.12)" }} />
          <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>
            Pour changer votre identifiant ou votre mot de passe, confirmez avec votre mot de passe actuel.
          </p>

          <Field label="Mot de passe actuel">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Nouveau mot de passe (facultatif)">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Laisser vide pour ne pas changer" className={inputCls} style={inputStyle} />
          </Field>

          {meMsg && (
            <p className="text-[12px] font-semibold" style={{ color: meMsg.ok ? "#16a34a" : "#C0392B" }}>{meMsg.text}</p>
          )}

          <button type="submit" disabled={savingMe} className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))", boxShadow: "0 4px 18px rgba(184,134,26,0.25)" }}>
            {savingMe ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>

      {/* ── Équipe ── */}
      <div className="rounded-2xl p-6" style={card}>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
          Équipe
        </h2>
        <p className="text-[12px] mb-5" style={{ color: "var(--ink-muted)" }}>
          Les personnes ci-dessous peuvent se connecter à l&rsquo;espace de gestion.
        </p>

        <div className="flex flex-col divide-y mb-6" style={{ borderColor: "rgba(184,134,26,0.10)" }}>
          {users.map((u) => (
            <div key={u.id} className="py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(184,134,26,0.10)" }}>
                <span className="text-[13px] font-black" style={{ color: "var(--gold-dark)" }}>
                  {(u.name || u.username).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                  {u.name || u.username}
                  {u.id === me.id && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(184,134,26,0.12)", color: "var(--gold-dark)" }}>vous</span>}
                </p>
                <p className="text-[12px]" style={{ color: "var(--ink-muted)" }}>identifiant : {u.username}</p>
              </div>
              {u.id !== me.id && (
                <button onClick={() => removeUser(u)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0"
                  style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)" }} aria-label={`Supprimer ${u.username}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.7" strokeLinecap="round" width={13} height={13}>
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--cream)" }}>
          <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--ink-muted)" }}>
            Ajouter un membre
          </p>
          <form onSubmit={addUser} noValidate className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={nuName} onChange={(e) => setNuName(e.target.value)} placeholder="Nom" maxLength={80} className={inputCls} style={inputStyle} />
              <input value={nuUsername} onChange={(e) => setNuUsername(e.target.value)} placeholder="Identifiant" className={inputCls} style={inputStyle} />
            </div>
            <input type="password" value={nuPassword} onChange={(e) => setNuPassword(e.target.value)} placeholder="Mot de passe (6 caractères min.)" autoComplete="new-password" className={inputCls} style={inputStyle} />
            {teamMsg && (
              <p className="text-[12px] font-semibold" style={{ color: teamMsg.ok ? "#16a34a" : "#C0392B" }}>{teamMsg.text}</p>
            )}
            <button type="submit" disabled={addingUser} className="w-full py-3 rounded-xl font-bold text-[13px] transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "var(--ink)", color: "var(--cream)" }}>
              {addingUser ? "Ajout…" : "Ajouter ce membre"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
