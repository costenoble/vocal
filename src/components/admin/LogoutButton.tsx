"use client";

export default function LogoutButton() {
  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    window.location.href = "/admin";
  };

  return (
    <button
      onClick={logout}
      className="px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95"
      style={{ background: "white", color: "var(--ink-muted)", border: "1.5px solid rgba(28,20,16,0.10)" }}
    >
      Déconnexion
    </button>
  );
}
