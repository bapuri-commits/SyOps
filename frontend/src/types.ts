export type ServiceCategory = "productivity" | "utility" | "ai" | "discord";

export type DeployStatus = "live" | "coming_soon" | "dev";

export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  url?: string;
  icon: string;
  category: ServiceCategory;
  deployStatus: DeployStatus;
}

export type ServiceStatus = "up" | "down" | "unknown";

export interface ServiceHealth {
  id: string;
  status: ServiceStatus;
  latency_ms?: number;
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  productivity: "생산성",
  utility: "유틸리티",
  ai: "AI / 챗",
  discord: "Discord",
};

export const CATEGORY_ORDER: ServiceCategory[] = [
  "utility",
  "productivity",
  "ai",
  "discord",
];
