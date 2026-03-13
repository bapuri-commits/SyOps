import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/services", label: "서비스" },
  { to: "/projects", label: "프로젝트" },
  { to: "/blog", label: "블로그" },
  { to: "/log", label: "개발로그" },
  { to: "/algorithm", label: "알고리즘" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-white">
          Sy<span className="text-accent">Ops</span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map(({ to, label }) => (
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
          {NAV_ITEMS.map(({ to, label }) => (
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
        </ul>
      )}
    </nav>
  );
}
