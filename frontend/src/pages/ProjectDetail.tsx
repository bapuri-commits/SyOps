import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { projects } from "../data/projects";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-dvh">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white">프로젝트를 찾을 수 없습니다</h1>
          <Link to="/projects" className="mt-4 inline-block text-sm text-accent hover:underline">
            ← 프로젝트 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Back */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          프로젝트 목록
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="mt-2 text-lg text-accent-dim">{project.tagline}</p>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-border-subtle bg-surface-card px-3 py-1 text-sm text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="mt-6 flex gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-accent-dim"
            >
              Live Demo
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-4 py-2 text-sm text-slate-300 transition-colors hover:border-accent/40 hover:text-white"
            >
              GitHub
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>

        {/* Description */}
        <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">설명</h2>
          <p className="mt-3 leading-relaxed text-slate-300">{project.description}</p>
        </div>

        {/* Status */}
        <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">현재 상태</h2>
          <p className="mt-3 text-slate-300">{project.status}</p>
        </div>
      </div>
    </div>
  );
}
