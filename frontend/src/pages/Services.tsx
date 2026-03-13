import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import { services } from "../data/services";
import { useServiceHealth } from "../hooks/useServiceHealth";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../types";
import type { ServiceCategory } from "../types";

export default function Services() {
  const liveIds = services
    .filter((s) => s.deployStatus === "live")
    .map((s) => s.id);
  const healthMap = useServiceHealth(liveIds);

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const items = services.filter((s) => s.category === cat);
      if (items.length > 0) acc.push([cat, items] as const);
      return acc;
    },
    [] as (readonly [ServiceCategory, typeof services])[],
  );

  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-white">서비스</h1>
        <p className="mt-2 text-sm text-slate-400">
          운영 중인 서비스와 준비 중인 프로젝트 현황
        </p>

        <div className="mt-8 space-y-10">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    health={healthMap[svc.id]}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
