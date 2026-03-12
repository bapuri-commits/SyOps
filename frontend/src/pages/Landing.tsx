import { Link } from "react-router-dom";
import Header from "../components/Header";
import ServiceCard from "../components/ServiceCard";
import Footer from "../components/Footer";
import { services } from "../data/services";
import { useServiceHealth } from "../hooks/useServiceHealth";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../types";
import type { ServiceCategory } from "../types";

export default function Landing() {
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
    <div className="flex min-h-dvh flex-col items-center gap-16 px-4 py-16">
      <Header />

      <div className="w-full max-w-3xl space-y-12">
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

      <div className="flex flex-col items-center gap-3">
        <Footer />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-accent"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          관리
        </Link>
      </div>
    </div>
  );
}
