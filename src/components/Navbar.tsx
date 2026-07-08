"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { School, LayoutDashboard, Users, LogOut, ListTodo } from "lucide-react";

const areaLabels: Record<string, string> = {
  SECRETARIA: "Secretaria",
  COMERCIAL: "Comercial",
  TI: "TI",
  FINANCEIRO: "Financeiro",
};

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user as any;

  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="glass border-b border-[#6c5ce7]/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#e0e0ff] hover:text-[#6c5ce7] transition-colors"
          >
            <School className="w-5 h-5" />
            <span className="font-semibold text-sm hidden sm:inline">
              Veritas II
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/dashboard/tasks")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                pathname === "/dashboard/tasks"
                  ? "bg-[#6c5ce7]/20 text-[#6c5ce7]"
                  : "text-[#a0a0c0] hover:text-[#e0e0ff] hover:bg-[#ffffff05]"
              }`}
            >
              <ListTodo size={16} />
              Tarefas
            </button>

            {isAdmin && (
              <button
                onClick={() => router.push("/dashboard/admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === "/dashboard/admin"
                    ? "bg-[#6c5ce7]/20 text-[#6c5ce7]"
                    : "text-[#a0a0c0] hover:text-[#e0e0ff] hover:bg-[#ffffff05]"
                }`}
              >
                <Users size={16} />
                Usuários
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm text-[#e0e0ff] leading-tight">{user.name}</p>
              <p className="text-xs text-[#6c5ce7]">{areaLabels[user.area] || user.area}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#a0a0c0] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
