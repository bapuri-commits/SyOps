import { useEffect, useRef, useCallback, useState } from "react";
import VideoPlayer from "./VideoPlayer";

interface MediaFile {
  name: string;
  type: string;
}

interface Props {
  files: MediaFile[];
  index: number;
  basePath: string;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ files, index, basePath, authFetch, onClose, onNavigate }: Props) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const blobUrlsRef = useRef(blobUrls);
  blobUrlsRef.current = blobUrls;

  const current = files[index];
  const prefix = basePath ? `${basePath}/` : "";

  useEffect(() => {
    const name = current?.name;
    if (!name || blobUrlsRef.current[name]) return;

    let cancelled = false;
    authFetch(`/api/gallery/files/${prefix}${name}`).then(async (res) => {
      if (cancelled || !res.ok) return;
      const blob = await res.blob();
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      setBlobUrls((prev) => ({ ...prev, [name]: url }));
    });
    return () => { cancelled = true; };
  }, [current?.name, prefix, authFetch]);

  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach(URL.revokeObjectURL);
    };
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(index - 1);
  }, [index, onNavigate]);

  const goNext = useCallback(() => {
    if (index < files.length - 1) onNavigate(index + 1);
  }, [index, files.length, onNavigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  function onPointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;

    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  const src = blobUrls[current.name] || "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ touchAction: "pan-y" }}
    >
      {/* close */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        aria-label="닫기"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* counter */}
      <div className="absolute left-3 top-3 z-10 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
        {index + 1} / {files.length}
      </div>

      {/* prev */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:left-4"
          aria-label="이전"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* next */}
      {index < files.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 sm:right-4"
          aria-label="다음"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* media */}
      <div className="flex h-full w-full items-center justify-center p-4 sm:p-10">
        {!src ? (
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gallery-accent/30 border-t-gallery-accent" />
          </div>
        ) : current.type === "video" ? (
          <VideoPlayer src={src} autoPlay className="max-h-full max-w-full" />
        ) : (
          <img
            src={src}
            alt={current.name}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* filename */}
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm">
        {current.name}
      </div>
    </div>
  );
}
