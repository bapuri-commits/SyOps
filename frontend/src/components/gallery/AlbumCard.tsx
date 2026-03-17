import { Link } from "react-router-dom";

interface Props {
  name: string;
  itemCount: number;
  basePath: string;
}

export default function AlbumCard({ name, itemCount, basePath }: Props) {
  const to = basePath ? `/gallery/${basePath}/${name}` : `/gallery/${name}`;

  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-gallery-border bg-gallery-card p-5 transition-all duration-200 hover:border-gallery-accent/40 hover:bg-gallery-card-hover hover:shadow-lg hover:shadow-gallery-accent/5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gallery-accent/10 text-xl">
        📁
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-gallery-text transition-colors group-hover:text-gallery-accent">
          {name}
        </p>
        <p className="mt-0.5 text-xs text-gallery-text-muted">
          {itemCount}개 항목
        </p>
      </div>
    </Link>
  );
}
