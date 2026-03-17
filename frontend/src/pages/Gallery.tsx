import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/gallery/Breadcrumb";
import AlbumCard from "../components/gallery/AlbumCard";
import MediaGrid from "../components/gallery/MediaGrid";

interface Folder {
  name: string;
  item_count: number;
}

interface MediaFile {
  name: string;
  type: string;
  size: number;
  modified: string;
}

interface GalleryData {
  path: string;
  folders: Folder[];
  files: MediaFile[];
}

export default function Gallery() {
  const { "*": splat } = useParams();
  const path = splat || "";
  const { authenticated, initializing, role, authFetch } = useAuth();

  const [data, setData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initializing || !authenticated || role !== "admin") return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    authFetch(`/api/gallery?path=${encodeURIComponent(path)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setError(res.status === 403 ? "접근 권한이 없습니다." : "불러오기 실패");
          return;
        }
        const json = await res.json();
        setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("네트워크 오류");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [path, authFetch, initializing, authenticated, role]);

  const thumbSrc = useCallback(
    (name: string) => {
      const prefix = path ? `${path}/` : "";
      return `/api/gallery/thumbs/${prefix}${name}`;
    },
    [path],
  );

  if (!initializing && (!authenticated || role !== "admin")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-dvh bg-gallery-bg">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb path={path} />

        {loading ? (
          <div className="mt-20 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gallery-accent/30 border-t-gallery-accent" />
          </div>
        ) : error ? (
          <div className="mt-20 text-center">
            <p className="text-gallery-text-muted">{error}</p>
          </div>
        ) : data ? (
          <>
            {data.folders.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gallery-text-muted">
                  앨범
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.folders.map((f) => (
                    <AlbumCard
                      key={f.name}
                      name={f.name}
                      itemCount={f.item_count}
                      basePath={path}
                    />
                  ))}
                </div>
              </section>
            )}

            {data.files.length > 0 && (
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gallery-text-muted">
                    미디어
                  </h2>
                  <span className="text-xs text-gallery-text-muted">
                    {data.files.length}개
                  </span>
                </div>
                <MediaGrid
                  files={data.files}
                  basePath={path}
                  thumbSrc={thumbSrc}
                  authFetch={authFetch}
                />
              </section>
            )}

            {data.folders.length === 0 && data.files.length === 0 && (
              <div className="mt-20 text-center">
                <span className="text-4xl">🖼️</span>
                <p className="mt-4 text-gallery-text-muted">이 폴더는 비어 있습니다.</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
