"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Eye, EyeOff, RefreshCw } from "lucide-react";

const areaLabels: Record<string, string> = {
  SECRETARIA: "Secretaria",
  COMERCIAL: "Comercial",
  TI: "TI",
  FINANCEIRO: "Financeiro",
};

const areaColors: Record<string, string> = {
  SECRETARIA: "text-[#6c5ce7] bg-[#6c5ce7]/10",
  COMERCIAL: "text-[#00cec9] bg-[#00cec9]/10",
  TI: "text-[#fdcb6e] bg-[#fdcb6e]/10",
  FINANCEIRO: "text-[#e17055] bg-[#e17055]/10",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", area: "SECRETARIA" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard/tasks");
      return;
    }
    fetchUsers();
  }, [status, user]);

  async function fetchUsers() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao criar usuário");
      setCreating(false);
      return;
    }

    setUsers((prev) => [data, ...prev]);
    setForm({ name: "", email: "", password: "", area: "SECRETARIA" });
    setShowCreate(false);
    setCreating(false);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-[#6c5ce7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gradient">Gerenciar Usuários</h1>
            <p className="text-xs text-[#707090] mt-0.5">
              Crie e gerencie contas de acesso ao sistema
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Novo Usuário
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="glass rounded-xl p-5 mb-6 border border-[#6c5ce7]/20 space-y-4"
          >
            <h3 className="text-sm font-semibold text-[#e0e0ff]">Criar Novo Usuário</h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#a0a0c0] mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-3 py-2 text-sm text-[#e0e0ff] placeholder:text-[#505070] focus:outline-none focus:border-[#6c5ce7]/50"
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#a0a0c0] mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-3 py-2 text-sm text-[#e0e0ff] placeholder:text-[#505070] focus:outline-none focus:border-[#6c5ce7]/50"
                  placeholder="email@colegio.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#a0a0c0] mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-3 py-2 text-sm text-[#e0e0ff] placeholder:text-[#505070] focus:outline-none focus:border-[#6c5ce7]/50 pr-8"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#505070] hover:text-[#a0a0c0]"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#a0a0c0] mb-1">Área</label>
                <select
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-3 py-2 text-sm text-[#e0e0ff] focus:outline-none focus:border-[#6c5ce7]/50"
                >
                  <option value="SECRETARIA">Secretaria</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="TI">TI</option>
                  <option value="FINANCEIRO">Financeiro</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? "Criando..." : "Criar Usuário"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[#505070] hover:text-[#a0a0c0] px-3 py-2 text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="glass rounded-xl border border-[#6c5ce7]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#6c5ce7]/10">
                  <th className="text-left px-4 py-3 text-[#a0a0c0] font-medium text-xs">Nome</th>
                  <th className="text-left px-4 py-3 text-[#a0a0c0] font-medium text-xs">Email</th>
                  <th className="text-left px-4 py-3 text-[#a0a0c0] font-medium text-xs">Área</th>
                  <th className="text-left px-4 py-3 text-[#a0a0c0] font-medium text-xs">Status</th>
                  <th className="text-left px-4 py-3 text-[#a0a0c0] font-medium text-xs">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#6c5ce7]/5 hover:bg-[#ffffff05] transition-colors">
                    <td className="px-4 py-3 text-[#e0e0ff]">{u.name}</td>
                    <td className="px-4 py-3 text-[#a0a0c0]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${areaColors[u.area] || ""}`}>
                        {areaLabels[u.area] || u.area}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${u.active ? "text-[#00b894]" : "text-[#e17055]"}`}>
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#505070] text-xs">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#505070] text-sm">
                      Nenhum usuário cadastrado ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
