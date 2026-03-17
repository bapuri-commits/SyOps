import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface UserInfo {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
}

export default function UserManagementPanel() {
  const { authFetch, username: currentUsername } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [createError, setCreateError] = useState("");
  const [resetTarget, setResetTarget] = useState<number | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authFetch("/api/auth/users");
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function showMsg(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleCreate() {
    setCreateError("");
    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError("아이디와 비밀번호를 입력하세요");
      return;
    }
    try {
      const res = await authFetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword, role: newRole }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewUsername("");
        setNewPassword("");
        setNewRole("user");
        showMsg("계정 생성 완료");
        fetchUsers();
      } else {
        const data = await res.json();
        setCreateError(data.detail || "생성 실패");
      }
    } catch {
      setCreateError("연결 실패");
    }
  }

  async function toggleActive(user: UserInfo) {
    try {
      const res = await authFetch(`/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) {
        showMsg(`${user.username} ${user.is_active ? "비활성화" : "활성화"} 완료`);
        fetchUsers();
      } else {
        showMsg("상태 변경 실패");
      }
    } catch {
      showMsg("연결 실패");
    }
  }

  async function handleResetPassword() {
    if (!resetTarget || resetPw.length < 4) return;
    try {
      const res = await authFetch(`/api/auth/users/${resetTarget}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: resetPw }),
      });
      if (res.ok) {
        setResetTarget(null);
        setResetPw("");
        showMsg("비밀번호 초기화 완료");
      } else {
        showMsg("비밀번호 변경 실패");
      }
    } catch {
      showMsg("연결 실패");
    }
  }

  const inputClass = "w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-accent";
  const btnClass = "rounded-md border border-border-subtle px-2.5 py-1 text-xs transition-colors";

  return (
    <div className="space-y-3">
      {/* Header + Create */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">계정 관리</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={`${btnClass} ${showCreate ? "border-red-400/40 text-red-400" : "text-slate-400 hover:border-accent/40 hover:text-accent"}`}
        >
          {showCreate ? "취소" : "계정 생성"}
        </button>
      </div>

      {message && (
        <div className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs text-emerald-400">{message}</div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-border-subtle bg-surface-card p-4 space-y-3">
          <input type="text" placeholder="아이디" value={newUsername} onChange={e => setNewUsername(e.target.value)} className={inputClass} />
          <input type="password" placeholder="비밀번호 (4자 이상)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} />
          <select value={newRole} onChange={e => setNewRole(e.target.value)} className={inputClass}>
            <option value="user">일반 사용자</option>
            <option value="admin">관리자</option>
          </select>
          {createError && <p className="text-xs text-red-400">{createError}</p>}
          <button onClick={handleCreate} className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface hover:opacity-90">
            생성
          </button>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="h-20 animate-pulse rounded-xl border border-border-subtle bg-surface-card" />
      ) : (
        users.map(user => (
          <div key={user.id} className="rounded-xl border border-border-subtle bg-surface-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-sm font-semibold text-white">{user.username}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${user.role === "admin" ? "bg-amber-400/15 text-amber-400" : "bg-slate-400/15 text-slate-400"}`}>
                  {user.role}
                </span>
              </div>
              {user.username !== currentUsername && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setResetTarget(resetTarget === user.id ? null : user.id); setResetPw(""); }}
                    className={`${btnClass} text-slate-400 hover:border-accent/40 hover:text-accent`}
                  >
                    비밀번호
                  </button>
                  <button
                    onClick={() => toggleActive(user)}
                    className={`${btnClass} ${user.is_active ? "text-slate-400 hover:border-red-400/40 hover:text-red-400" : "text-slate-400 hover:border-emerald-400/40 hover:text-emerald-400"}`}
                  >
                    {user.is_active ? "비활성화" : "활성화"}
                  </button>
                </div>
              )}
            </div>

            {resetTarget === user.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="password"
                  placeholder="새 비밀번호 (4자 이상)"
                  value={resetPw}
                  onChange={e => setResetPw(e.target.value)}
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  onClick={handleResetPassword}
                  disabled={resetPw.length < 4}
                  className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-surface hover:opacity-90 disabled:opacity-40"
                >
                  변경
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
