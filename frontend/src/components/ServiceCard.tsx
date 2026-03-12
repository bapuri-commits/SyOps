import type { ServiceInfo, ServiceHealth } from "../types";
import StatusBadge from "./StatusBadge";

interface Props {
  service: ServiceInfo;
  health: ServiceHealth;
}

export default function ServiceCard({ service, health }: Props) {
  const cardClass =
    "group block rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all duration-200 hover:border-accent/40 hover:bg-surface-hover hover:shadow-lg hover:shadow-accent/5";

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-3xl">{service.icon}</span>
        <StatusBadge status={health.status} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-accent transition-colors">
        {service.name}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {service.description}
      </p>

      {service.url ? (
        <div className="mt-5 flex items-center gap-1 text-sm font-medium text-accent-dim group-hover:text-accent transition-colors">
          바로가기
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </div>
      ) : (
        <div className="mt-5 text-sm text-slate-500">
          내부 서비스
        </div>
      )}
    </>
  );

  if (service.url) {
    return (
      <a href={service.url} target="_blank" rel="noopener noreferrer" className={cardClass}>
        {inner}
      </a>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
