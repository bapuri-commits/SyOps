import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getValidRedirect(params: URLSearchParams): string | null {
  const raw = params.get("redirect");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.hostname.endsWith(".syworkspace.cloud") || url.hostname === "syworkspace.cloud") {
      return raw;
    }
  } catch { /* invalid URL */ }
  return null;
}

export default function Login() {
  const { authenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = useMemo(() => getValidRedirect(searchParams), [searchParams]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    if (redirect) {
      window.location.href = redirect;
    } else {
      navigate("/", { replace: true });
    }
  }, [authenticated, navigate, redirect]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      if (redirect) {
        window.location.href = redirect;
      } else {
        navigate("/", { replace: true });
      }
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            Sy<span className="text-accent">Ops</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">로그인</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              required
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-accent"
              placeholder="아이디 입력"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-accent"
              placeholder="비밀번호 입력"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">아이디 또는 비밀번호가 올바르지 않습니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "확인 중..." : "로그인"}
        </button>

        <Link
          to="/"
          className="block text-center text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          &larr; 포털로 돌아가기
        </Link>
      </form>
    </div>
  );
}
