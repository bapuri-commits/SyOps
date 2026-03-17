import { Link } from "react-router-dom";

interface Props {
  path: string;
}

export default function Breadcrumb({ path }: Props) {
  const segments = path ? path.split("/").filter(Boolean) : [];

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link
        to="/gallery"
        className="text-gallery-accent-dim transition-colors hover:text-gallery-accent"
      >
        갤러리
      </Link>
      {segments.map((seg, i) => {
        const to = "/gallery/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={to} className="flex items-center gap-1.5">
            <span className="text-gallery-text-muted">/</span>
            {isLast ? (
              <span className="font-medium text-gallery-text">{seg}</span>
            ) : (
              <Link
                to={to}
                className="text-gallery-accent-dim transition-colors hover:text-gallery-accent"
              >
                {seg}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
