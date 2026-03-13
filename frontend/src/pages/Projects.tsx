import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const CATEGORY_LABELS: Record<string, string> = {
  service: "서비스",
  tool: "생산성 도구",
  study: "학습 프로젝트",
};

const CATEGORY_ORDER = ["service", "tool", "study"] as const;

export default function Projects() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: projects.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-white">프로젝트</h1>
        <p className="mt-2 text-sm text-slate-400">
          직접 설계·구현·배포한 프로젝트 포트폴리오
        </p>

        <div className="mt-8 space-y-10">
          {grouped.map(({ category, label, items }) => (
            <section key={category}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
