import { Link } from "react-router-dom";
import type { ProjectInfo } from "../data/projects";

const STATUS_STYLE: Record<string, string> = {
  "운영 중": "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "개발 중": "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "설계 완료": "bg-blue-400/10 text-blue-400 border-blue-400/20",
  "초기": "bg-slate-400/10 text-slate-400 border-slate-400/20",
};

export default function ProjectCard({ project }: { project: ProjectInfo }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all duration-200 hover:border-accent/40 hover:bg-surface-hover hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">
          {project.name}
        </h3>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLE[project.status] ?? STATUS_STYLE["초기"]}`}
        >
          {project.status}
        </span>
      </div>

      <p className="mt-1 text-sm text-accent-dim">{project.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 5).map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-surface-hover px-2 py-0.5 text-[11px] text-slate-400"
          >
            {tech}
          </span>
        ))}
        {project.techStack.length > 5 && (
          <span className="rounded-md bg-surface-hover px-2 py-0.5 text-[11px] text-slate-500">
            +{project.techStack.length - 5}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        {project.liveUrl && <span>Live</span>}
        {project.githubUrl && <span>GitHub</span>}
        <span className="ml-auto text-accent-dim group-hover:text-accent transition-colors">
          상세 보기 →
        </span>
      </div>
    </Link>
  );
}
