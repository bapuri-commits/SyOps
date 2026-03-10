import { Link } from "react-router-dom";
import Header from "../components/Header";
import ServiceCard from "../components/ServiceCard";
import Footer from "../components/Footer";
import { services } from "../data/services";
import { useServiceHealth } from "../hooks/useServiceHealth";

export default function Landing() {
  const healthMap = useServiceHealth(services.map((s) => s.id));

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-16 px-4 py-16">
      <Header />

      <section className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {services.map((svc) => (
          <ServiceCard
            key={svc.id}
            service={svc}
            health={healthMap[svc.id]}
          />
        ))}
      </section>

      <div className="flex flex-col items-center gap-3">
        <Footer />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-accent"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          관리
        </Link>
      </div>
    </div>
  );
}
