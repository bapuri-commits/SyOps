import { useState, useEffect, useRef } from "react";
import Lightbox from "./Lightbox";

interface MediaFile {
  name: string;
  type: string;
  size: number;
  modified: string;
}

interface Props {
  files: MediaFile[];
  basePath: string;
  thumbSrc: (name: string) => string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

function ThumbImage({
  file,
  thumbUrl,
  authFetch,
  onClick,
}: {
  file: MediaFile;
  thumbUrl: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onClick: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const revokeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    authFetch(thumbUrl).then(async (res) => {
      if (cancelled) return;
      if (!res.ok) { setFailed(true); return; }
      const blob = await res.blob();
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      revokeRef.current = url;
      setBlobUrl(url);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
    };
  }, [thumbUrl, authFetch]);

  return (
    <button
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded-xl border border-gallery-border bg-gallery-card transition-all duration-200 hover:border-gallery-accent/40 hover:shadow-lg hover:shadow-gallery-accent/5"
    >
      {blobUrl ? (
        <img
          src={blobUrl}
          alt={file.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gallery-text-muted">
          <span className="text-2xl">{file.type === "video" ? "🎬" : "🖼️"}</span>
          <span className="text-xs">미리보기 없음</span>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gallery-accent/30 border-t-gallery-accent" />
        </div>
      )}
      {file.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs text-white">{file.name}</p>
      </div>
    </button>
  );
}

export default function MediaGrid({ files, basePath, thumbSrc, authFetch }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (files.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file, i) => (
          <ThumbImage
            key={file.name}
            file={file}
            thumbUrl={thumbSrc(file.name)}
            authFetch={authFetch}
            onClick={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          files={files}
          index={lightboxIndex}
          basePath={basePath}
          authFetch={authFetch}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
