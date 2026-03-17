import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/services", label: "서비스" },
  { to: "/projects", label: "프로젝트" },
  { to: "/blog", label: "블로그" },
  { to: "/log", label: "개발로그" },
  { to: "/algorithm", label: "알고리즘" },
  // { to: "/gallery", label: "갤러리", adminOnly: true },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { authenticated, initializing, username, role, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-white">
          Sy<span className="text-accent">Ops</span>
        </Link>

        {/* Desktop nav + auth */}
        <div className="hidden items-center gap-1 sm:flex">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.filter((item) => !("adminOnly" in item && item.adminOnly) || role === "admin").map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    pathname.startsWith(to)
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <span className="mx-2 h-4 w-px bg-border-subtle" />

          {!initializing && (
            authenticated ? (
              <div className="flex items-center gap-2">
                {role === "admin" && (
                  <Link
                    to="/dashboard"
                    className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                      pathname.startsWith("/dashboard")
                        ? "bg-accent/10 font-medium text-accent"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    관리
                  </Link>
                )}
                <span className="text-xs text-slate-500">{username}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-2.5 py-1.5 text-sm text-slate-400 transition-colors hover:text-red-400"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-md px-2.5 py-1.5 text-sm text-slate-400 transition-colors hover:text-accent"
              >
                로그인
              </Link>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden rounded-md p-1.5 text-slate-400 hover:text-white"
          aria-label="메뉴"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul className="border-t border-border-subtle px-4 pb-3 sm:hidden">
          {NAV_ITEMS.filter((item) => !("adminOnly" in item && item.adminOnly) || role === "admin").map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname.startsWith(to)
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}

          <li className="mt-1 border-t border-border-subtle pt-2">
            {!initializing && (
              authenticated ? (
                <div className="space-y-1">
                  {role === "admin" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-slate-400 hover:text-white"
                    >
                      관리
                    </Link>
                  )}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-slate-500">{username}</span>
                    <button
                      onClick={() => { setOpen(false); handleLogout(); }}
                      className="text-sm text-slate-400 hover:text-red-400"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-slate-400 hover:text-accent"
                >
                  로그인
                </Link>
              )
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
